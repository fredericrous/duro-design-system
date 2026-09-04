import type {Registry} from './registry-types.js'
import {lookupNames} from './registry.js'

/**
 * The single command spec. CLI dispatch, --help text, and MCP tool
 * registration all derive from this object — one place to add a command.
 */
export interface CommandSpec {
  name: string
  summary: string
  args: Array<{name: string; required: boolean; description: string; valuesFrom?: string}>
  flags: Array<{name: string; type: 'boolean' | 'string'; description: string}>
  returns: {shape: string; description: string}
  examples: string[]
  mcpTool?: string
}

export const COMMANDS: CommandSpec[] = [
  {
    name: 'lookup',
    summary:
      'Docs for anything by name: a component (props, usage, example), a recipe (runnable source), a token group, or the rules. Unknown names fall back to full-text search over the usage metadata.',
    args: [
      {
        name: 'name',
        required: true,
        description:
          'Component (Button), recipe (login-form), token group (spacing), icons, rules — or free text to search',
        valuesFrom: 'names',
      },
    ],
    flags: [
      {name: 'part', type: 'string', description: 'Narrow a compound component to one part'},
      {name: 'props', type: 'boolean', description: 'Prop table only'},
      {name: 'source-only', type: 'boolean', description: 'Recipes: emit just the source file'},
    ],
    returns: {
      shape:
        'ComponentEntry | RecipeEntry | TokenGroup | IconRegistry | RulesRegistry | SearchHit[]',
      description: 'The registry entry, or ranked search hits when the name did not match',
    },
    examples: [
      'duro Button',
      'duro Select --part Root',
      'duro login-form --source-only',
      'duro "tags that wrap"',
    ],
    mcpTool: 'duro_lookup',
  },
  {
    name: 'list',
    summary: 'One-line index of everything documented',
    args: [
      {
        name: 'kind',
        required: false,
        description: 'components | recipes | tokens (default: all)',
        valuesFrom: 'kinds',
      },
    ],
    flags: [],
    returns: {shape: 'ListEntry[]', description: '{name, kind, importPath?, description}'},
    examples: ['duro list', 'duro list recipes --json'],
    mcpTool: 'duro_list',
  },
  {
    name: 'manifest',
    summary: 'This command spec plus all valid lookup names — the one-call agent bootstrap',
    args: [],
    flags: [],
    returns: {shape: 'Manifest', description: 'Commands, flags, shapes, and enums of valid names'},
    examples: ['duro manifest --json'],
    mcpTool: 'duro_manifest',
  },
  {
    name: 'hook',
    summary:
      'Claude Code SessionStart hook: session-start prints the consult-first preamble + full catalog; install wires it into the current repo',
    args: [
      {
        name: 'event',
        required: true,
        description: 'session-start (print the bootstrap) | install (wire it into this repo)',
        valuesFrom: 'events',
      },
    ],
    flags: [
      {
        name: 'check',
        type: 'boolean',
        description: 'install: report drift and exit 1 instead of writing (for CI)',
      },
    ],
    returns: {
      shape: '{preamble: string, entries: ListEntry[]} | {ok: boolean, changes: FileChange[]}',
      description:
        'session-start: the preamble plus the same entries as duro list. install: what each wired file did',
    },
    examples: ['duro hook session-start', 'duro hook install', 'duro hook install --check'],
  },
  {
    name: 'mcp',
    summary: 'Run a stdio MCP server exposing duro_lookup / duro_list / duro_manifest',
    args: [],
    flags: [],
    returns: {shape: 'never', description: 'Serves until stdin closes'},
    examples: [
      'claude mcp add duro -- npx -y -p @duro-app/cli -p @modelcontextprotocol/sdk duro mcp',
    ],
  },
]

export function buildManifest(registry: Registry, version: string) {
  return {
    name: '@duro-app/cli',
    bin: 'duro',
    version,
    schemaVersion: registry.schemaVersion,
    description: 'Machine-queryable docs for the Duro design system.',
    usage: 'duro <name|command> [flags] [--json]',
    globalFlags: [
      {name: 'json', type: 'boolean', description: 'Emit JSON on stdout'},
      {name: 'no-color', type: 'boolean', description: 'Disable ANSI styling'},
    ],
    commands: COMMANDS,
    enums: {
      names: lookupNames(registry),
      kinds: ['components', 'recipes', 'tokens'],
      events: ['session-start', 'install'],
    },
  }
}
