import type {Registry} from '../registry-types.js'
import type {CommandResult} from './lookup.js'
import {runList} from './list.js'

// Injected into agent context by a Claude Code SessionStart hook. The point
// is to turn "consult the design system before building UI" from a remembered
// step into ambient context: with the catalog already in front of it, an
// agent has nothing to remember and no excuse to hand-roll a widget the
// design system ships.
const PREAMBLE = [
  'Duro design-system session bootstrap (duro hook session-start).',
  'The catalog below is already in your context — before hand-rolling ANY',
  'interactive element (menu, badge, tag, dialog, select, tooltip, ...),',
  'pick the design-system component or recipe from this list. Details:',
  'duro <Component> (props+usage) · duro <recipe> --source-only ·',
  'duro spacing|icons|rules.',
].join('\n')

export function runHook(registry: Registry, event?: string): CommandResult {
  if (event !== 'session-start') {
    return {
      text: `duro hook: unknown event "${event ?? ''}" — expected session-start`,
      data: {kind: 'usage-error'},
      exitCode: 2,
    }
  }
  const list = runList(registry)
  return {
    text: `${PREAMBLE}\n\n${list.text}`,
    data: {preamble: PREAMBLE, entries: list.data},
  }
}
