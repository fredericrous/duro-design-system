import type {
  ComponentEntry,
  IconRegistry,
  PartEntry,
  PropEntry,
  RecipeEntry,
  Registry,
  RulesRegistry,
  TokenGroup,
} from './registry-types.js'

const useColor =
  process.env.NO_COLOR === undefined &&
  process.stdout.isTTY === true &&
  !process.argv.includes('--no-color')

const bold = (text: string) => (useColor ? `\u001b[1m${text}\u001b[22m` : text)
const dim = (text: string) => (useColor ? `\u001b[2m${text}\u001b[22m` : text)

function wrap(text: string, indent: string, width = 88): string {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if (line.length + word.length + 1 > width - indent.length && line) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines.map((l) => indent + l).join('\n')
}

function propLines(props: PropEntry[], indent = '  '): string {
  const ordered = [...props].sort((a, b) => Number(b.required) - Number(a.required))
  const nameWidth = Math.max(
    ...ordered.map((prop) => prop.name.length + (prop.required ? 1 : 0)),
    8,
  )
  const typeWidth = Math.max(...ordered.map((prop) => Math.min(prop.type.length, 40)), 8)
  const lines: string[] = []
  for (const prop of ordered) {
    const name = (prop.name + (prop.required ? '*' : '')).padEnd(nameWidth + 2)
    const type = prop.type.length > 40 ? prop.type.slice(0, 37) + '...' : prop.type
    const def = prop.default !== undefined ? `  = ${prop.default}` : ''
    const deprecated = prop.deprecated ? '  (deprecated)' : ''
    lines.push(`${indent}${name}${type.padEnd(typeWidth + 2)}${def}${deprecated}`)
    if (prop.union)
      lines.push(
        dim(`${indent}${' '.repeat(nameWidth + 2)}${prop.union.map((u) => `'${u}'`).join(' | ')}`),
      )
    if (prop.description)
      lines.push(dim(wrap(prop.description, indent + ' '.repeat(nameWidth + 2))))
  }
  return lines.join('\n')
}

function metaBlocks(entry: ComponentEntry | RecipeEntry): string[] {
  const blocks: string[] = []
  const meta = entry.meta
  if (!meta) return blocks
  blocks.push(wrap(meta.description, ''))
  if (meta.whenToUse.length > 0) {
    blocks.push(`${bold('USE WHEN')}\n${meta.whenToUse.map((w) => `  · ${w}`).join('\n')}`)
  }
  if (meta.whenNotToUse.length > 0) {
    blocks.push(`${bold("DON'T USE WHEN")}\n${meta.whenNotToUse.map((w) => `  · ${w}`).join('\n')}`)
  }
  return blocks
}

export function renderComponent(
  registry: Registry,
  key: string,
  entry: ComponentEntry,
  options: {part?: string; propsOnly?: boolean} = {},
): string {
  const blocks: string[] = []
  const compound = entry.kind === 'compound' ? '   (compound)' : ''
  blocks.push(`${bold(key)} — import {${entry.name}} from '${entry.importPath}'${compound}`)
  if (entry.deprecated) blocks.push(`DEPRECATED: ${entry.deprecated}`)

  if (!options.propsOnly) blocks.push(...metaBlocks(entry))

  const meta = entry.meta
  if (meta?.anatomy && !options.propsOnly && !options.part) {
    const optional = meta.anatomy.optional?.length
      ? `   optional: ${meta.anatomy.optional.join(' · ')}`
      : ''
    blocks.push(`${bold('ANATOMY')}  required: ${meta.anatomy.required.join(' > ')}${optional}`)
  }

  if (entry.parts) {
    const parts = options.part
      ? Object.entries(entry.parts).filter(([name]) => name === options.part)
      : Object.entries(entry.parts)
    if (options.part && parts.length === 0) {
      const available = Object.keys(entry.parts).join(', ')
      throw Object.assign(new Error(`${key} has no part "${options.part}" — parts: ${available}`), {
        exitCode: 1,
      })
    }
    for (const [name, part] of parts) {
      const deprecated = part.deprecated ? `  ${dim(`(deprecated: ${part.deprecated})`)}` : ''
      blocks.push(
        `${bold(`${entry.name}.${name}`)}${deprecated}${part.props.length > 0 ? '\n' + propLines(part.props) : dim('\n  (no props)')}`,
      )
    }
  } else if (entry.props && entry.props.length > 0) {
    blocks.push(`${bold('PROPS')}\n${propLines(entry.props)}`)
  }

  if (!options.propsOnly && meta?.example) {
    blocks.push(
      `${bold('EXAMPLE')}\n${meta.example
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n')}`,
    )
  }
  if (!options.propsOnly && meta?.relatedTo?.length) {
    const width = Math.max(...meta.relatedTo.map((related) => related.component.length))
    blocks.push(
      `${bold('RELATED')}\n${meta.relatedTo.map((related) => `  ${related.component.padEnd(width + 2)}${related.relationship}`).join('\n')}`,
    )
  }
  if (!options.propsOnly) {
    const recipesUsing = Object.values(registry.recipes)
      .filter((recipe) => recipe.usesComponents.includes(entry.name))
      .map((recipe) => recipe.name)
    if (recipesUsing.length > 0) blocks.push(dim(`Recipes using this: ${recipesUsing.join(', ')}`))
  }
  return blocks.join('\n\n')
}

export function renderRecipe(entry: RecipeEntry, options: {sourceOnly?: boolean} = {}): string {
  if (options.sourceOnly) return entry.source
  const blocks: string[] = [
    `${bold(entry.name)} — ${entry.title}`,
    ...metaBlocks(entry),
    `Uses: ${entry.usesComponents.join(', ')}${entry.peerDeps.length > 0 ? `\nPeer deps: ${entry.peerDeps.join(', ')}` : ''}`,
    `${dim(`--- source (${entry.name}.recipe.tsx) ---`)}\n${entry.source}`,
  ]
  return blocks.join('\n\n')
}

export function renderTokenGroup(key: string, group: TokenGroup): string {
  const lines: string[] = [
    `${bold(key)} — import {${group.exportName}} from '${group.importPath}'`,
    '',
  ]
  const hasThemes = group.entries.some((entry) => entry.values)
  if (hasThemes) {
    const keyWidth = Math.max(...group.entries.map((entry) => entry.key.length)) + 2
    lines.push(
      `  ${'token'.padEnd(keyWidth)}${'dark'.padEnd(28)}${'light'.padEnd(28)}high-contrast`,
    )
    for (const entry of group.entries) {
      const themed = entry.values ?? {}
      lines.push(
        `  ${entry.key.padEnd(keyWidth)}${(themed.dark ?? '').padEnd(28)}${(themed.light ?? '').padEnd(28)}${themed.highContrast ?? ''}`,
      )
    }
  } else {
    for (const entry of group.entries) {
      lines.push(`  ${entry.key.padEnd(14)}${entry.value !== undefined ? String(entry.value) : ''}`)
    }
  }
  return lines.join('\n')
}

export function renderIcons(icons: IconRegistry): string {
  const lines: string[] = [
    `${bold('icons')} — <Icon name="..." size="sm|md|lg|xl|xxl" />  (${Object.entries(icons.sizes)
      .map(([token, px]) => `${token} ${px}px`)
      .join(' · ')})`,
  ]
  for (const group of icons.groups) {
    lines.push('', `  ${group.label ?? 'Core'}`, wrap(group.names.join(' · '), '    '))
  }
  return lines.join('\n')
}

export function renderRules(rules: RulesRegistry): string {
  const lint = rules.lint
    .map((rule) => {
      const fix = rule.fixable === 'none' ? '' : `  (${rule.fixable})`
      return `  ${rule.severity.padEnd(6)}${rule.id}${fix}\n${dim(wrap(rule.description, '        '))}`
    })
    .join('\n')
  return [
    `${bold('CRITICAL RULES')}   ${dim('(source: CLAUDE.md)')}\n\n${rules.critical}`,
    `${bold('ENFORCED BY @duro-app/eslint-plugin')} ${dim('(duro.configs.recommended)')}\n${lint}`,
  ].join('\n\n')
}

export function renderList(registry: Registry, kind?: string): string {
  const sections: string[] = []
  const nameWidth = Math.max(...Object.keys(registry.components).map((name) => name.length), 12) + 2

  if (!kind || kind === 'components') {
    const rows = Object.entries(registry.components)
      .map(
        ([key, entry]) =>
          `  ${key.padEnd(nameWidth)}${entry.meta?.description.split('. ')[0] ?? dim(`(${entry.kind})`)}`,
      )
      .join('\n')
    sections.push(`${bold('COMPONENTS')} (${Object.keys(registry.components).length})\n${rows}`)
  }
  if (!kind || kind === 'recipes') {
    const rows = Object.entries(registry.recipes)
      .map(([key, entry]) => `  ${key.padEnd(nameWidth)}${entry.meta.description}`)
      .join('\n')
    sections.push(`${bold('RECIPES')} (${Object.keys(registry.recipes).length})\n${rows}`)
  }
  if (!kind || kind === 'tokens') {
    const rows = Object.entries(registry.tokens.groups)
      .map(
        ([key, group]) =>
          `  ${key.padEnd(nameWidth)}${group.entries.length} tokens — ${group.importPath}`,
      )
      .join('\n')
    sections.push(
      `${bold('TOKENS')}\n${rows}\n  ${'icons'.padEnd(nameWidth)}${registry.icons.names.length} names — duro icons`,
    )
  }
  sections.push(dim(`duro <name> for details · duro rules · duro manifest`))
  return sections.join('\n\n')
}
