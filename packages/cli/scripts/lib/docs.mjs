import {readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {repoRoot} from './project.mjs'

const claudeMdPath = join(repoRoot, 'CLAUDE.md')

const marker = (name, edge) => `<!-- duro:generated:${name} ${edge} -->`

function componentsRegion(registry) {
  const rows = Object.entries(registry.components)
    .filter(([, entry]) => entry.meta && (entry.kind === 'component' || entry.kind === 'compound'))
    .map(([key, entry]) => {
      const description = entry.meta.description.split('. ')[0].replace(/\.$/, '')
      const keyProps = entry.parts
        ? `compound: ${Object.keys(entry.parts).slice(0, 5).join(', ')}${Object.keys(entry.parts).length > 5 ? ', …' : ''}`
        : (entry.props ?? [])
            .filter((prop) => prop.name !== 'children')
            .slice(0, 3)
            .map((prop) => `\`${prop.name}\``)
            .join(', ')
      return `| **${key}** | ${description} | ${keyProps} |`
    })
  return [
    '| Component | Description | Key props |',
    '| --- | --- | --- |',
    ...rows,
    '',
    'Full props, usage guidance and examples: `npx @duro-app/cli <Name>` (or the `duro_lookup` MCP tool).',
  ].join('\n')
}

function iconsRegion(registry) {
  const lines = registry.icons.groups.map(
    (group) =>
      `**${group.label ?? 'Stroke icons'}:** ${group.names.map((name) => `\`${name}\``).join(', ')}`,
  )
  const sizes = Object.entries(registry.icons.sizes)
    .map(([token, px]) => `\`${token}\` ${px}px`)
    .join(' · ')
  return [...lines, '', `Sizes: ${sizes} — \`<Icon name="server" size="md" />\``].join('\n\n')
}

function tokensRegion(registry) {
  const table = (group) =>
    [
      '| Token | Value |',
      '| --- | --- |',
      ...group.entries.map((entry) => `| \`${entry.key}\` | ${entry.value} |`),
    ].join('\n')
  return [
    '### Spacing Scale',
    '',
    table(registry.tokens.groups.spacing),
    '',
    '### Border Radius',
    '',
    table(registry.tokens.groups.radii),
  ].join('\n')
}

function recipesRegion(registry) {
  const index = Object.values(registry.recipes).map(
    (recipe) =>
      `- **${recipe.name}** — ${recipe.meta.description} \`npx @duro-app/cli ${recipe.name} --source-only\``,
  )
  const exemplar = registry.recipes['login-form']
  return [
    'Complete, runnable compositions. Each emits consumer-ready source (imports already point at the published packages):',
    '',
    ...index,
    '',
    'One inline exemplar (the others follow the same shape — fetch them with the CLI):',
    '',
    '### Login Form',
    '',
    '```tsx',
    exemplar.source.trimEnd(),
    '```',
  ].join('\n')
}

export function generatedRegions(registry) {
  return {
    components: componentsRegion(registry),
    icons: iconsRegion(registry),
    tokens: tokensRegion(registry),
    recipes: recipesRegion(registry),
  }
}

/**
 * Splice the generated regions into CLAUDE.md between their markers. Never
 * touches anything outside the markers; hard-errors on missing or duplicated
 * markers, and refuses to operate on a region that overlaps duro:rules.
 */
export function spliceDocs(registry, {write}) {
  const original = readFileSync(claudeMdPath, 'utf8')
  const rulesStart = original.indexOf('<!-- duro:rules:start -->')
  const rulesEnd = original.indexOf('<!-- duro:rules:end -->')
  let updated = original

  for (const [name, content] of Object.entries(generatedRegions(registry))) {
    const startMarker = marker(name, 'START')
    const endMarker = marker(name, 'END')
    const start = updated.indexOf(startMarker)
    const end = updated.indexOf(endMarker)
    if (start === -1 || end === -1) {
      throw new Error(
        `CLAUDE.md is missing the ${startMarker} / ${endMarker} markers — add them where the ${name} section belongs`,
      )
    }
    if (updated.indexOf(startMarker, start + 1) !== -1) {
      throw new Error(`CLAUDE.md has duplicated ${startMarker} markers`)
    }
    if (end < start) throw new Error(`CLAUDE.md ${name} markers are reversed`)
    if (rulesStart !== -1 && start < rulesEnd && end > rulesStart) {
      throw new Error(`refusing to write: generated region ${name} overlaps the duro:rules region`)
    }
    updated =
      updated.slice(0, start + startMarker.length) + '\n\n' + content + '\n\n' + updated.slice(end)
  }

  if (updated === original) return {changed: false}
  if (write) {
    writeFileSync(claudeMdPath, updated)
    return {changed: true}
  }
  const changedRegion = Object.keys(generatedRegions(registry)).find((name) => {
    const startMarker = marker(name, 'START')
    return (
      original.slice(original.indexOf(startMarker), original.indexOf(marker(name, 'END'))) !==
      updated.slice(updated.indexOf(startMarker), updated.indexOf(marker(name, 'END')))
    )
  })
  return {changed: true, changedRegion}
}
