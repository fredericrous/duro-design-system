import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {repoRoot} from './project.mjs'
import {staticEval} from './static-eval.mjs'

/**
 * IconName members grouped by the `//` comments inside the union — the same
 * grouping CLAUDE.md's Icon Names section uses. Parsed from text because the
 * comments live between union members, where the AST doesn't attach them
 * usefully.
 */
export function extractIcons(project) {
  const iconFile = join(repoRoot, 'packages/ui/src/components/Icon/Icon.tsx')
  const text = readFileSync(iconFile, 'utf8')
  const unionMatch = /export type IconName =([\s\S]*?)\n\n/.exec(text)
  if (!unionMatch) throw new Error(`could not find the IconName union in ${iconFile}`)

  const groups = []
  let current = {label: null, names: []}
  for (const line of unionMatch[1].split('\n')) {
    const comment = /^\s*\/\/\s*(.+)$/.exec(line)
    if (comment) {
      if (current.names.length > 0) groups.push(current)
      current = {label: comment[1].trim(), names: []}
      continue
    }
    const member = /^\s*\|\s*'([^']+)'/.exec(line)
    if (member) current.names.push(member[1])
  }
  if (current.names.length > 0) groups.push(current)

  const names = groups.flatMap((group) => group.names)
  if (names.length === 0) throw new Error(`parsed zero IconName members from ${iconFile}`)

  const keysFile = project.getSourceFileOrThrow(join(repoRoot, 'packages/tokens/src/keys.ts'))
  const sizes = staticEval(
    keysFile.getVariableDeclarationOrThrow('ICON_SIZES').getInitializerOrThrow(),
    'keys.ts#ICON_SIZES',
  )

  return {names, sizes, groups}
}
