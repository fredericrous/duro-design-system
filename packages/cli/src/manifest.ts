import type {Registry} from './registry-types.js'
import {lookupNames} from './registry.js'

/** `duro mockup <sub>`: the spec owns the names, the command dispatches on them. */
export const MOCKUP_SUBCOMMANDS = ['seed', 'check', 'canvas']

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
    mcpTool: 'duro_ds_lookup',
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
    mcpTool: 'duro_ds_list',
  },
  {
    name: 'manifest',
    summary: 'This command spec plus all valid lookup names — the one-call agent bootstrap',
    args: [],
    flags: [],
    returns: {shape: 'Manifest', description: 'Commands, flags, shapes, and enums of valid names'},
    examples: ['duro manifest --json'],
    mcpTool: 'duro_ds_manifest',
  },
  {
    name: 'hook',
    summary:
      'Claude Code hooks: session-start prints the consult-first preamble + full catalog; install wires it (SessionStart) plus a plan-mode mockup nudge (UserPromptSubmit) into the current repo',
    args: [
      {
        name: 'event',
        required: true,
        description:
          'session-start (print the bootstrap) | install (wire both hooks into this repo)',
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
    name: 'skill',
    summary:
      'Claude Code skills — /duro-mockup (the mockup → implementation → proof workflow) plus the colors, typography and ui interface skills; install writes all four into the current repo; --force overwrites a skill directory of your own and removes the files in it that the package does not ship',
    args: [
      {
        name: 'action',
        required: true,
        description: 'install (write .claude/skills/{duro-mockup,colors,typography,ui}/)',
        valuesFrom: 'skillActions',
      },
    ],
    flags: [
      {
        name: 'check',
        type: 'boolean',
        description: 'install: report drift and exit 1 instead of writing (for CI)',
      },
      {
        name: 'force',
        type: 'boolean',
        description:
          'install: with --force, write into an existing colors, typography or ui skill directory that lacks the shipped NOTICE.md (a skill of your own); without --force install refuses. --force also removes the files of that overwritten directory the package does not ship',
      },
    ],
    returns: {
      shape: '{ok: boolean, changes: FileChange[]}',
      description: 'What each wired file did: written, unchanged, stale or removed',
    },
    examples: ['duro skill install', 'duro skill install --check'],
  },
  {
    name: 'mockup',
    summary:
      'Token-seeded mockup artboards: seed writes a .dc.html whose only design vocabulary is the resolved token block; check refuses raw colours/values and controls that name no component; canvas writes one review page of every direction in a directory, refusing any artboard that fails check',
    args: [
      {
        name: 'action',
        required: true,
        description:
          'seed (write <Name>.dc.html) | check <file.dc.html>... (exit 1 on findings) | canvas <dir> (write the review page; exit 1 on findings)',
        valuesFrom: 'mockupActions',
      },
    ],
    flags: [
      {
        name: 'out',
        type: 'string',
        description:
          'seed: directory (default docs/mockups/<name>); canvas: the page (default <dir>/canvas.html)',
      },
      {name: 'name', type: 'string', description: 'seed: artboard stem (default Main)'},
      {
        name: 'theme',
        type: 'string',
        description: 'seed: dark (default) | light | high-contrast — sets <html data-theme>',
      },
      {
        name: 'overrides',
        type: 'string',
        description:
          'seed: a theme JSON file, {colors?, fonts?, radii?} (or a flat map of colour keys), written into the token block as --duro-color-*, --duro-typography-font-family(-mono) and --duro-radius-* rules',
      },
      {
        name: 'title',
        type: 'string',
        description: 'canvas: the page title (default "<dir> directions")',
      },
    ],
    returns: {
      shape:
        '{ok: boolean, path: string} | {ok: boolean, findings: Finding[], skew?: {own, installed}} | {ok: boolean, path: string, artboards: number, skew?: {own, installed}}',
      description:
        'seed: where it wrote. check: {file, line, rule, message} per finding — raw-color, raw-length, raw-breakpoint, unknown-component, no-component-map, unannotated-control',
    },
    examples: [
      'duro mockup seed --name Main --out docs/mockups/approvals',
      'duro mockup check docs/mockups/approvals/*.dc.html',
      'duro mockup check Main.dc.html --json',
      'duro mockup canvas docs/mockups/approvals',
    ],
    mcpTool: 'duro_ds_mockup_check',
  },
  {
    name: 'doctor',
    summary:
      "Check how the app in the cwd wires @duro-app/ui into its build: runtimeInjection left on, unlayered StyleX extraction, the stylesheet missing from the entry, layers declared out of order, unlayered resets. Each one flattens component spacing while the design system's own CSS is fine. It also flags a StyleX build that never compiles @duro-app/tokens, so css.create cannot import the tokens, and fresh built CSS whose @media reads a var() (media-var). Exits 1 on an error, 0 on warnings",
    args: [],
    flags: [
      {
        name: 'session',
        type: 'boolean',
        description:
          'SessionStart mode: silent when healthy, an agent-facing block otherwise, always exit 0',
      },
    ],
    returns: {
      shape: '{ok: boolean, findings: DoctorFinding[], checked: string[]}',
      description:
        '{rule, severity, file, line?, message, fix} per finding — runtime-injection, layered-extraction, css-imported, css-load-order, unlayered-reset, version-skew. Exit 1 on any error',
    },
    examples: ['duro doctor', 'duro doctor --json', 'duro doctor --session'],
  },
  {
    name: 'mcp',
    summary:
      'Run a stdio MCP server exposing duro_ds_lookup / duro_ds_list / duro_ds_manifest / duro_ds_mockup_check / duro_ds_mockup_canvas',
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
      // Guides are fetched by name (guide:<skill>) and stay out of the manifest.
      names: lookupNames(registry).filter((name) => !name.startsWith('guide:')),
      kinds: ['components', 'recipes', 'tokens'],
      events: ['session-start', 'install'],
      mockupActions: MOCKUP_SUBCOMMANDS,
      skillActions: ['install'],
    },
  }
}
