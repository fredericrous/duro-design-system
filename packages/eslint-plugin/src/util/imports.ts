import type {TSESLint, TSESTree} from '@typescript-eslint/utils'

/**
 * Find how a module import is written in this file so inserted imports match
 * its style (quote char, trailing semicolon). Falls back to the repo default
 * (single quotes, no semicolon) when the file has no imports.
 */
function importStyle(sourceCode: Readonly<TSESLint.SourceCode>): {quote: string; semi: string} {
  const first = sourceCode.ast.body.find(
    (stmt): stmt is TSESTree.ImportDeclaration => stmt.type === 'ImportDeclaration',
  )
  if (!first) return {quote: "'", semi: ''}
  const raw = sourceCode.getText(first.source)
  const text = sourceCode.getText(first)
  return {quote: raw.startsWith('"') ? '"' : "'", semi: text.endsWith(';') ? ';' : ''}
}

export interface EnsureImportResult {
  /** The local name the caller should reference (respects aliases). */
  local: string
  /** Fixes that add the import when it is missing (empty when present). */
  fixes: TSESLint.RuleFix[]
}

/**
 * Is `name` bound to anything other than an import from `moduleName` in any
 * scope enclosing `scope`? Used to bail out of fixes that would reference a
 * shadowed binding.
 */
export function isShadowed(
  scope: TSESLint.Scope.Scope | null,
  name: string,
  moduleName: string,
): boolean {
  for (let s = scope; s; s = s.upper) {
    const variable = s.variables.find((v) => v.name === name)
    if (!variable) continue
    const fromModule = variable.defs.every(
      (def) =>
        def.type === 'ImportBinding' &&
        def.parent.type === 'ImportDeclaration' &&
        def.parent.source.value === moduleName,
    )
    if (!fromModule || variable.defs.length === 0) return true
  }
  return false
}

/**
 * Ensure a named import for `importedName` from `moduleName` exists, returning
 * the local name to reference plus the fixes that create/extend the import.
 * Reuses an existing (possibly aliased) specifier when present.
 */
export function ensureNamedImport(
  sourceCode: Readonly<TSESLint.SourceCode>,
  fixer: TSESLint.RuleFixer,
  moduleName: string,
  importedName: string,
): EnsureImportResult {
  const imports = sourceCode.ast.body.filter(
    (stmt): stmt is TSESTree.ImportDeclaration => stmt.type === 'ImportDeclaration',
  )
  const fromModule = imports.filter(
    (decl) => decl.source.value === moduleName && decl.importKind !== 'type',
  )

  for (const decl of fromModule) {
    for (const spec of decl.specifiers) {
      if (
        spec.type === 'ImportSpecifier' &&
        spec.imported.type === 'Identifier' &&
        spec.imported.name === importedName &&
        spec.importKind !== 'type'
      ) {
        return {local: spec.local.name, fixes: []}
      }
    }
  }

  // Extend an existing value-import from the module when possible.
  for (const decl of fromModule) {
    const named = decl.specifiers.filter((spec) => spec.type === 'ImportSpecifier')
    const last = named[named.length - 1]
    if (last) {
      return {local: importedName, fixes: [fixer.insertTextAfter(last, `, ${importedName}`)]}
    }
    const defaultSpec = decl.specifiers.find((spec) => spec.type === 'ImportDefaultSpecifier')
    if (defaultSpec) {
      return {
        local: importedName,
        fixes: [fixer.insertTextAfter(defaultSpec, `, {${importedName}}`)],
      }
    }
  }

  // Add a fresh import declaration.
  const {quote, semi} = importStyle(sourceCode)
  const statement = `import {${importedName}} from ${quote}${moduleName}${quote}${semi}`
  const lastImport = imports[imports.length - 1]
  if (lastImport) {
    return {local: importedName, fixes: [fixer.insertTextAfter(lastImport, `\n${statement}`)]}
  }
  return {local: importedName, fixes: [fixer.insertTextBeforeRange([0, 0], `${statement}\n`)]}
}
