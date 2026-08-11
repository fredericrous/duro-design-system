import {Node} from 'ts-morph'
import {join, dirname, basename} from 'node:path'
import {existsSync} from 'node:fs'
import {staticEval} from './static-eval.mjs'
import {extractProps, jsDocOf, unwrapFunction} from './props.mjs'
import {relPath, repoRoot} from './project.mjs'

function classifyName(name) {
  if (/^use[A-Z]/.test(name)) return 'hook'
  if (/Provider$/.test(name)) return 'provider'
  return 'component'
}

function metaForSourcePath(project, sourcePath) {
  const dir = dirname(join(repoRoot, sourcePath))
  const metaPath = join(dir, `${basename(dir)}.meta.ts`)
  if (!existsSync(metaPath)) return null
  const metaFile = project.getSourceFileOrThrow(metaPath)
  const metaVar = metaFile.getVariableDeclaration('meta')
  if (!metaVar) {
    throw new Error(
      `${metaPath} exists but exports no \`meta\` const — export const meta: ComponentMeta = {...}`,
    )
  }
  return staticEval(metaVar.getInitializerOrThrow(), metaPath)
}

/** Follow import aliases to the symbol that actually declares the value. */
function valueDeclarationOf(symbol) {
  if (!symbol) return undefined
  let declaration = symbol.getValueDeclaration()
  if (!declaration || Node.isImportSpecifier(declaration) || Node.isImportClause(declaration)) {
    const aliased = symbol.getAliasedSymbol?.()
    if (aliased) declaration = aliased.getValueDeclaration() ?? declaration
  }
  return declaration
}

/** Resolve an exported declaration through `export const X = Y` indirection. */
function resolveDeclaration(decl) {
  if (Node.isImportSpecifier(decl) || Node.isImportClause(decl)) {
    const target = valueDeclarationOf(decl.getSymbol())
    if (target && target !== decl) return resolveDeclaration(target)
  }
  if (Node.isVariableDeclaration(decl)) {
    const init = decl.getInitializer()
    if (init && Node.isIdentifier(init)) {
      const target = valueDeclarationOf(init.getSymbol())
      if (target) return resolveDeclaration(target)
    }
  }
  return decl
}

function collectCompoundParts(objectLiteral, unions, context) {
  const parts = {}
  for (const prop of objectLiteral.getProperties()) {
    if (Node.isSpreadAssignment(prop)) {
      const spreadTarget = valueDeclarationOf(prop.getExpression().getSymbol())
      if (spreadTarget && Node.isVariableDeclaration(spreadTarget)) {
        const spreadInit = spreadTarget.getInitializer()
        if (spreadInit && Node.isObjectLiteralExpression(spreadInit)) {
          Object.assign(parts, collectCompoundParts(spreadInit, unions, context))
          continue
        }
      }
      throw new Error(`${context}: cannot resolve spread in compound object`)
    }
    if (!Node.isShorthandPropertyAssignment(prop) && !Node.isPropertyAssignment(prop)) {
      throw new Error(`${context}: unsupported compound member ${prop.getKindName()}`)
    }
    const partName = prop.getName()
    // Shorthand properties need getValueSymbol(): getSymbol() on the name
    // yields the *property* symbol (the shorthand itself), not the function
    // it references.
    const valueDecl = Node.isShorthandPropertyAssignment(prop)
      ? valueDeclarationOf(prop.getValueSymbol())
      : valueDeclarationOf(prop.getInitializer()?.getSymbol?.())
    let fn = valueDecl ? resolveDeclaration(valueDecl) : null
    if (fn && Node.isVariableDeclaration(fn)) {
      const init = fn.getInitializer()
      if (
        init &&
        (Node.isArrowFunction(init) ||
          Node.isFunctionExpression(init) ||
          Node.isCallExpression(init))
      ) {
        fn = unwrapFunction(init)
      }
    }
    if (
      !fn ||
      (!Node.isFunctionDeclaration(fn) &&
        !Node.isArrowFunction(fn) &&
        !Node.isFunctionExpression(fn))
    ) {
      // Non-function compound member (a nested namespace or constant) — record without props.
      parts[partName] = {name: partName, sourcePath: relPath(prop.getSourceFile()), props: []}
      continue
    }
    const props = extractProps(fn, unions, `${context}.${partName}`)
    const {deprecated} = jsDocOf(Node.isShorthandPropertyAssignment(prop) ? prop : fn)
    const declDoc = Node.isFunctionDeclaration(fn) ? jsDocOf(fn) : {}
    const part = {
      name: partName,
      sourcePath: relPath(fn.getSourceFile()),
      props: props ?? [],
    }
    const dep = deprecated ?? declDoc.deprecated
    if (dep) part.deprecated = dep === true ? 'deprecated' : dep
    parts[partName] = part
  }
  return parts
}

/**
 * Walk a package entry file and produce ComponentEntry records + exported
 * string-literal unions. `importPath` tags where a consumer imports from.
 */
export function extractSurface(
  project,
  entryPath,
  importPath,
  {components = {}, unions = {}} = {},
) {
  const entry = project.getSourceFileOrThrow(join(repoRoot, entryPath))
  const exported = entry.getExportedDeclarations()

  // First pass: unions (so prop extraction can attach members).
  for (const [name, decls] of exported) {
    for (const decl of decls) {
      if (Node.isTypeAliasDeclaration(decl)) {
        const typeNode = decl.getTypeNode()
        if (Node.isUnionTypeNode(typeNode)) {
          const literals = typeNode.getTypeNodes()
          if (
            literals.every((t) => Node.isLiteralTypeNode(t) && Node.isStringLiteral(t.getLiteral()))
          ) {
            unions[name] = literals.map((t) => t.getLiteral().getLiteralValue())
          }
        }
      }
    }
  }

  // Second pass: components.
  for (const [name, decls] of exported) {
    const decl = resolveDeclaration(decls[0])
    if (Node.isInterfaceDeclaration(decl) || Node.isTypeAliasDeclaration(decl)) continue

    let entryRecord = null
    if (Node.isFunctionDeclaration(decl)) {
      const props = extractProps(decl, unions, name)
      entryRecord = {
        name,
        kind: classifyName(name),
        importPath,
        sourcePath: relPath(decl.getSourceFile()),
        meta: null,
        props: props ?? [],
      }
    } else if (Node.isVariableDeclaration(decl)) {
      const init = decl.getInitializer()
      if (init && Node.isObjectLiteralExpression(init)) {
        entryRecord = {
          name,
          kind: 'compound',
          importPath,
          sourcePath: relPath(decl.getSourceFile()),
          meta: null,
          props: null,
          parts: collectCompoundParts(init, unions, name),
        }
      } else if (
        init &&
        (Node.isArrowFunction(init) ||
          Node.isFunctionExpression(init) ||
          Node.isCallExpression(init))
      ) {
        const fn = unwrapFunction(init)
        if (Node.isArrowFunction(fn) || Node.isFunctionExpression(fn)) {
          const props = extractProps(fn, unions, name)
          entryRecord = {
            name,
            kind: classifyName(name),
            importPath,
            sourcePath: relPath(decl.getSourceFile()),
            meta: null,
            props: props ?? [],
          }
        }
      }
      // Other consts (RAMPS, plain data) are skipped — the completeness test
      // owns the allowlist.
    }

    if (!entryRecord) continue
    const {deprecated} = jsDocOf(decl)
    if (deprecated) entryRecord.deprecated = deprecated === true ? 'deprecated' : deprecated
    entryRecord.meta = metaForSourcePath(project, entryRecord.sourcePath)

    // Name collisions across packages (ui Text vs diagrams Text, root Table
    // vs the table-subpath merge): first registration wins the bare key;
    // later ones get a qualified key and inherit the bare entry's meta when
    // they have none (the subpath Table is the root Table plus extras).
    let key = name
    if (components[key] && components[key].importPath !== importPath) {
      key = `${name} (${importPath.replace('@duro-app/', '')})`
      if (entryRecord.meta === null) entryRecord.meta = components[name].meta
    }
    components[key] = entryRecord
  }

  return {components, unions}
}
