import type {Registry} from './registry-types.js'
import {runList} from './commands/list.js'
import {relatedPairs} from './disambiguation.js'
import {renderPairs} from './format.js'

// Injected into agent context by a Claude Code SessionStart hook. The point
// is to turn "consult the design system before building UI" from a remembered
// step into ambient context: with the catalog already in front of it, an
// agent has nothing to remember and no excuse to hand-roll a widget the
// design system ships.
export const PREAMBLE = [
  'Duro design-system session bootstrap (duro context).',
  'The catalog below is already in your context — before hand-rolling ANY',
  'interactive element (menu, badge, tag, dialog, select, tooltip, ...),',
  'pick the design-system component or recipe from this list. When two of',
  'them could both fit, the neighbors section decides; the compose section',
  'says what already wraps what, so you never rebuild it. Details:',
  'duro <Component> (props+usage) · duro <recipe> --source-only ·',
  'duro spacing|icons|rules.',
  'A new screen, page or UI proposal starts with the /duro-mockup skill',
  '(duro skill install if this repo lacks it; it also installs the colors,',
  'typography and ui interface skills): token-seeded artboards, checked,',
  'then implemented from their component map.',
].join('\n')

/** One index line: the guides are fetched by name, never listed in the catalog. */
function renderGuideIndex(registry: Registry): string {
  const skills = Object.keys(registry.guides ?? {})
  if (skills.length === 0) return ''
  return `GUIDES: ${skills.map((skill) => `guide:${skill}`).join(' · ')} — interface rules, read with duro_ds_lookup or duro guide:<name>`
}

/**
 * Recipes are in the index too, but buried under 65 components. A screen
 * starts from one of these before any grid is hand-rolled, so they lead.
 */
function renderScreens(registry: Registry): string {
  const entries = Object.entries(registry.recipes).sort(([a], [b]) => a.localeCompare(b))
  if (entries.length === 0) return ''
  const width = Math.max(...entries.map(([name]) => name.length)) + 2
  const rows = entries.map(([name, entry]) => `  ${name.padEnd(width)}${entry.meta.description}`)
  return [
    `SCREENS — START FROM A RECIPE (${entries.length})`,
    'A new screen copies the closest recipe (duro <recipe> --source-only) and',
    'edits it; a hand-rolled page layout needs a reason in the PR.',
    ...rows,
  ].join('\n')
}

/** The catalog session context: preamble, screens, index, guides, neighbour tables. */
export function renderCatalog(registry: Registry) {
  const list = runList(registry)
  // The index says what exists; the guard says which one is wrong. Both ship
  // in the same injection so neither waits on a call the agent may skip.
  const contrast = relatedPairs(registry, 'contrast')
  const composition = relatedPairs(registry, 'composition')
  const sections = [
    PREAMBLE,
    renderScreens(registry),
    list.text,
    renderGuideIndex(registry),
    renderPairs(contrast, 'PICKING BETWEEN NEIGHBORS', 'vs'),
    renderPairs(composition, 'COMPOSE — DO NOT HAND-ROLL THE WRAPPER', '+'),
  ].filter(Boolean)
  return {
    text: sections.join('\n\n'),
    data: {preamble: PREAMBLE, entries: list.data, contrast, composition},
  }
}
