import {execFileSync} from 'node:child_process'
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import type {Registry} from '../registry-types.js'
import type {CommandResult} from './lookup.js'
import {runList} from './list.js'
import {
  GITIGNORE_BLOCK,
  HOOK_CACHE_IGNORE,
  HOOK_COMMAND,
  HOOK_NOTES_PATH,
  HOOK_SCRIPT,
  HOOK_SCRIPT_PATH,
  HOOK_SETTINGS_PATH,
} from '../hook-script.js'

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

export interface HookOptions {
  /** Report drift and exit 1 instead of writing. For CI. */
  check?: boolean
  /** Repo root. Defaults to the process cwd. */
  cwd?: string
}

const EVENTS = ['session-start', 'install']

export function runHook(
  registry: Registry,
  event?: string,
  options: HookOptions = {},
): CommandResult {
  if (event === 'install') return runHookInstall(options)
  if (event !== 'session-start') {
    return {
      text: `duro hook: unknown event "${event ?? ''}" — expected ${EVENTS.join(' | ')}`,
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

type HookEntry = {type?: string; command?: string}
type HookGroup = {matcher?: string; hooks?: HookEntry[]}
type Settings = {hooks?: Record<string, HookGroup[]>} & Record<string, unknown>

/** One file the install touches, and what happened (or would happen) to it. */
interface FileChange {
  path: string
  status: 'written' | 'unchanged' | 'stale'
  detail: string
}

function read(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

function write(path: string, content: string): void {
  mkdirSync(dirname(path), {recursive: true})
  writeFileSync(path, content, 'utf8')
}

/**
 * Add the SessionStart entry without disturbing anything else in the file:
 * consuming repos keep their own hooks, permissions and skill overrides here.
 * Returns null when the file is already wired correctly.
 */
function nextSettings(current: string | null): string | null {
  const parsed: Settings = current === null ? {} : (JSON.parse(current) as Settings)
  const hooks = (parsed.hooks ??= {})
  const sessionStart = (hooks.SessionStart ??= [])
  const ours = sessionStart
    .flatMap((group) => group.hooks ?? [])
    .find((entry) => entry.command?.includes(HOOK_SCRIPT_PATH))
  if (ours) {
    if (ours.command === HOOK_COMMAND && ours.type === 'command') return null
    ours.type = 'command'
    ours.command = HOOK_COMMAND
  } else {
    sessionStart.push({hooks: [{type: 'command', command: HOOK_COMMAND}]})
  }
  return JSON.stringify(parsed, null, 2) + '\n'
}

/** Append the cache to .gitignore, unless some rule already covers the path. */
function nextGitignore(current: string | null): string | null {
  if (current !== null && current.split('\n').some((line) => line.trim() === HOOK_CACHE_IGNORE)) {
    return null
  }
  if (current === null || current === '') return GITIGNORE_BLOCK
  return current.endsWith('\n')
    ? `${current}\n${GITIGNORE_BLOCK}`
    : `${current}\n\n${GITIGNORE_BLOCK}`
}

/**
 * Repos that allowlist .claude (".claude/*" plus "!" exceptions) silently
 * ignore the files install just wrote — the hook then works locally and ships
 * to nobody. Best-effort: no git, no warning.
 */
function ignoredTrackables(root: string): string[] {
  const candidates = [HOOK_SCRIPT_PATH, HOOK_SETTINGS_PATH, HOOK_NOTES_PATH]
  try {
    const out = execFileSync('git', ['check-ignore', '--', ...candidates], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return out.split('\n').filter(Boolean)
  } catch {
    // Exit 1 means nothing matched, which is the happy path. Anything else
    // (no git, not a repo yet) is not ours to report.
    return []
  }
}

function runHookInstall(options: HookOptions): CommandResult {
  const root = options.cwd ?? process.cwd()
  const at = (path: string) => join(root, path)
  const changes: FileChange[] = []

  const apply = (path: string, next: string | null, detail: string): void => {
    if (next === null) {
      changes.push({path, status: 'unchanged', detail: 'already up to date'})
      return
    }
    if (options.check) {
      changes.push({path, status: 'stale', detail})
      return
    }
    write(at(path), next)
    changes.push({path, status: 'written', detail})
  }

  const script = read(at(HOOK_SCRIPT_PATH))
  apply(
    HOOK_SCRIPT_PATH,
    script === HOOK_SCRIPT ? null : HOOK_SCRIPT,
    script === null ? 'created' : 'regenerated',
  )

  const settingsRaw = read(at(HOOK_SETTINGS_PATH))
  let settingsNext: string | null
  try {
    settingsNext = nextSettings(settingsRaw)
  } catch (error) {
    return {
      text: `duro hook install: ${HOOK_SETTINGS_PATH} is not valid JSON (${
        error instanceof Error ? error.message : String(error)
      }) — fix or remove it, then rerun`,
      data: {kind: 'usage-error'},
      exitCode: 2,
    }
  }
  apply(
    HOOK_SETTINGS_PATH,
    settingsNext,
    settingsRaw === null ? 'created' : 'SessionStart entry added',
  )

  const gitignoreRaw = read(at('.gitignore'))
  apply('.gitignore', nextGitignore(gitignoreRaw), `ignores ${HOOK_CACHE_IGNORE}`)

  const stale = changes.filter((change) => change.status === 'stale')
  const lines = changes.map(
    (change) => `  ${change.status.padEnd(9)} ${change.path} — ${change.detail}`,
  )

  if (options.check) {
    return stale.length === 0
      ? {
          text: `duro hook install --check: up to date\n${lines.join('\n')}`,
          data: {ok: true, changes},
        }
      : {
          text: `duro hook install --check: ${stale.length} file(s) out of date\n${lines.join(
            '\n',
          )}\nRun: npx -y @duro-app/cli hook install`,
          data: {ok: false, changes},
          exitCode: 1,
        }
  }

  const ignored = ignoredTrackables(root)
  return {
    text: [
      'Duro SessionStart hook installed.',
      ...lines,
      '',
      `Repo-specific caveats: put them in ${HOOK_NOTES_PATH} — the hook appends that file`,
      'after the catalog, and regeneration leaves it alone.',
      ...(ignored.length === 0
        ? []
        : [
            '',
            'WARNING: .gitignore excludes these, so the hook would ship to nobody.',
            'Add a negation for each:',
            ...ignored.map((path) => `  !${path}`),
          ]),
    ].join('\n'),
    data: {ok: true, changes, ignored},
  }
}
