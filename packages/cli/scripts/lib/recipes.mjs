import {readdirSync} from 'node:fs'
import {join, basename} from 'node:path'
import {staticEval} from './static-eval.mjs'
import {relPath, repoRoot} from './project.mjs'

const RECIPES_DIR = 'docs/ai/recipes'

function titleCase(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function extractRecipes(project, components) {
  const recipes = {}
  const files = readdirSync(join(repoRoot, RECIPES_DIR))
    .filter((file) => file.endsWith('.recipe.tsx'))
    .sort()

  for (const file of files) {
    const slug = basename(file, '.recipe.tsx')
    const sourceFile = project.getSourceFileOrThrow(join(repoRoot, RECIPES_DIR, file))

    const metaVar = sourceFile.getVariableDeclaration('recipeMeta')
    if (!metaVar) {
      throw new Error(
        `${RECIPES_DIR}/${file} has no \`recipeMeta\` export — every recipe carries its ComponentMeta`,
      )
    }
    const meta = staticEval(metaVar.getInitializerOrThrow(), `${file}#recipeMeta`)

    const exportedFn = sourceFile
      .getFunctions()
      .find((fn) => fn.isExported() && /Recipe$/.test(fn.getName() ?? ''))
    if (!exportedFn) {
      throw new Error(`${RECIPES_DIR}/${file} exports no \`*Recipe\` function`)
    }

    // Rewrite deep-relative design-system imports to public specifiers, and
    // drop the recipeMeta block + its type import so the emitted source
    // compiles as-is in a consumer app.
    const usesComponents = []
    const peerDeps = new Set()
    const perPath = new Map() // public path -> {named: string[], insertAt: index}
    const removals = []

    for (const importDecl of sourceFile.getImportDeclarations()) {
      const specifier = importDecl.getModuleSpecifierValue()
      if (/packages\/(ui|diagrams)\/src\//.test(specifier)) {
        const named = importDecl.getNamedImports().map((namedImport) => namedImport.getName())
        usesComponents.push(...named.filter((name) => components[name]))
        for (const name of named) {
          const target = components[name]?.importPath ?? '@duro-app/ui'
          const group = perPath.get(target) ?? []
          group.push(name)
          perPath.set(target, group)
        }
        removals.push(importDecl)
      } else if (specifier === '../types') {
        removals.push(importDecl)
      } else if (
        !specifier.startsWith('.') &&
        specifier !== 'react' &&
        !specifier.startsWith('react/')
      ) {
        if (specifier !== 'react-strict-dom' && !specifier.startsWith('@duro-app/')) {
          peerDeps.add(
            specifier.startsWith('@')
              ? specifier.split('/').slice(0, 2).join('/')
              : specifier.split('/')[0],
          )
        }
      }
    }

    const collapsed = [...perPath.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([path, names]) => `import {${[...new Set(names)].join(', ')}} from '${path}'`)
      .join('\n')

    // Text surgery on a copy of the file text.
    const firstRemoved = removals[0]
    let source = sourceFile.getFullText()
    const cuts = []
    for (const node of removals) {
      cuts.push([node.getStart(), node.getEnd()])
    }
    const metaStatement = metaVar.getVariableStatementOrThrow()
    cuts.push([metaStatement.getStart(), metaStatement.getEnd()])
    cuts.sort((a, b) => b[0] - a[0])
    for (const [start, end] of cuts) {
      source = source.slice(0, start) + source.slice(end)
    }
    // Insert the collapsed imports where the first removed import began.
    const insertAt = firstRemoved ? firstRemoved.getStart() : 0
    source = source.slice(0, insertAt) + collapsed + source.slice(insertAt)
    // Squash the blank-line runs the removals leave behind.
    source = source.replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '\n')

    recipes[slug] = {
      name: slug,
      title: titleCase(slug),
      export: exportedFn.getName(),
      meta,
      source,
      sourcePath: relPath(sourceFile),
      usesComponents: [...new Set(usesComponents)].sort(),
      peerDeps: [...peerDeps].sort(),
    }
  }
  return recipes
}
