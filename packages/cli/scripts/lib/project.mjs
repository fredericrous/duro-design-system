import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'
import {Project} from 'ts-morph'

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')

/**
 * One ts-morph Project over the sources the registry is generated from.
 * Syntax + symbol resolution only — nothing here calls the type checker, so
 * generation stays in the seconds range.
 */
export function createProject() {
  const project = new Project({
    tsConfigFilePath: join(repoRoot, 'tsconfig.base.json'),
    skipAddingFilesFromTsConfig: true,
  })
  project.addSourceFilesAtPaths([
    join(repoRoot, 'packages/ui/src/**/*.{ts,tsx}'),
    join(repoRoot, 'packages/diagrams/src/**/*.{ts,tsx}'),
    join(repoRoot, 'packages/tokens/src/**/*.ts'),
    join(repoRoot, 'packages/eslint-plugin/src/**/*.ts'),
    join(repoRoot, 'docs/ai/recipes/*.recipe.tsx'),
  ])
  return project
}

/** Repo-relative POSIX path for registry output. */
export function relPath(sourceFile) {
  return sourceFile.getFilePath().slice(repoRoot.length + 1)
}
