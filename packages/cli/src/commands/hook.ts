import {execFileSync} from 'node:child_process'
import {existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {
  LEGACY_HOOK_NOTES_PATH,
  LEGACY_HOOK_SCRIPT_PATH,
  LEGACY_PLAN_HOOK_SCRIPT_PATH,
} from '../legacy-names.js'
import type {Registry} from '../registry-types.js'
import type {CommandResult} from './lookup.js'
import {runContext} from './context.js'
import {
  GITIGNORE_BLOCK,
  HOOK_CACHE_IGNORE,
  HOOK_COMMAND,
  HOOK_NOTES_PATH,
  HOOK_SCRIPT,
  HOOK_SCRIPT_PATH,
  HOOK_SETTINGS_PATH,
  PLAN_HOOK_COMMAND,
  PLAN_HOOK_SCRIPT,
  PLAN_HOOK_SCRIPT_PATH,
} from '../hook-script.js'

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
      text: `greenrack hook: unknown event "${event ?? ''}" — expected ${EVENTS.join(' | ')}`,
      data: {kind: 'usage-error'},
      exitCode: 2,
    }
  }
  return runContext(registry, {catalogOnly: true, cwd: options.cwd})
}

type HookEntry = {type?: string; command?: string}
type HookGroup = {matcher?: string; hooks?: HookEntry[]}
type Settings = {hooks?: Record<string, HookGroup[]>} & Record<string, unknown>

/** One file the install touches, and what happened (or would happen) to it. */
interface FileChange {
  path: string
  status: 'written' | 'unchanged' | 'stale' | 'removed'
  detail: string
}

const UPGRADE_COMMAND = 'npx @greenharness/greenrack-cli@^7 hook install'

function read(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

/** Write through a temp file in the same directory, then rename over the target. */
function write(path: string, content: string): void {
  mkdirSync(dirname(path), {recursive: true})
  const temp = `${path}.tmp-${process.pid}`
  writeFileSync(temp, content, 'utf8')
  renameSync(temp, path)
}

/** One settings.json entry install owns: the event, the script it runs, the exact command. */
interface Wiring {
  event: string
  script: string
  command: string
  legacyScript: string
}

const WIRINGS: Wiring[] = [
  {
    event: 'SessionStart',
    script: HOOK_SCRIPT_PATH,
    command: HOOK_COMMAND,
    legacyScript: LEGACY_HOOK_SCRIPT_PATH,
  },
  {
    event: 'UserPromptSubmit',
    script: PLAN_HOOK_SCRIPT_PATH,
    command: PLAN_HOOK_COMMAND,
    legacyScript: LEGACY_PLAN_HOOK_SCRIPT_PATH,
  },
]

/**
 * Add each event's entry without disturbing anything else in the file:
 * consuming repos keep their own hooks, permissions and skill overrides here.
 * An entry that runs an old script is ours: it is rewritten to the new
 * command, and every other entry of ours for the event is dropped, so there
 * is never a second one. Returns the events that changed, the wirings whose
 * old entry was found, and null for the text when the file is already wired
 * correctly.
 */
function nextSettings(current: string | null): {
  text: string | null
  events: string[]
  legacy: Wiring[]
} {
  const parsed: Settings = current === null ? {} : (JSON.parse(current) as Settings)
  const hooks = (parsed.hooks ??= {})
  const events: string[] = []
  const legacy: Wiring[] = []
  for (const wiring of WIRINGS) {
    const {event, script, command, legacyScript} = wiring
    const groups = (hooks[event] ??= [])
    const isOurs = (entry: HookEntry) =>
      entry.command?.includes(script) === true || entry.command?.includes(legacyScript) === true
    const all = groups.flatMap((group) => group.hooks ?? []).filter(isOurs)
    const sawLegacy = all.some((entry) => entry.command?.includes(legacyScript) === true)
    if (sawLegacy) legacy.push(wiring)
    const ours = all.find((entry) => entry.command?.includes(script) === true) ?? all[0]
    let changed = false
    if (ours === undefined) {
      groups.push({hooks: [{type: 'command', command}]})
      changed = true
    } else {
      for (const group of groups) {
        if (group.hooks === undefined) continue
        const kept = group.hooks.filter((entry) => entry === ours || !isOurs(entry))
        if (kept.length !== group.hooks.length) {
          group.hooks = kept
          changed = true
        }
      }
      for (let index = groups.length - 1; index >= 0; index--) {
        if (groups[index].hooks?.length === 0) groups.splice(index, 1)
      }
      if (ours.command !== command || ours.type !== 'command') {
        ours.type = 'command'
        ours.command = command
        changed = true
      }
    }
    if (changed) events.push(event)
  }
  if (events.length === 0) return {text: null, events, legacy}
  return {text: JSON.stringify(parsed, null, 2) + '\n', events, legacy}
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
  const candidates = [HOOK_SCRIPT_PATH, PLAN_HOOK_SCRIPT_PATH, HOOK_SETTINGS_PATH, HOOK_NOTES_PATH]
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

  for (const [path, content] of [
    [HOOK_SCRIPT_PATH, HOOK_SCRIPT],
    [PLAN_HOOK_SCRIPT_PATH, PLAN_HOOK_SCRIPT],
  ] as const) {
    const script = read(at(path))
    apply(path, script === content ? null : content, script === null ? 'created' : 'regenerated')
  }

  const settingsRaw = read(at(HOOK_SETTINGS_PATH))
  let settingsNext: ReturnType<typeof nextSettings>
  try {
    settingsNext = nextSettings(settingsRaw)
  } catch (error) {
    return {
      text: `greenrack hook install: ${HOOK_SETTINGS_PATH} is not valid JSON (${
        error instanceof Error ? error.message : String(error)
      }) — fix or remove it, then rerun`,
      data: {kind: 'usage-error'},
      exitCode: 2,
    }
  }
  const legacyEntries = settingsNext.legacy.map((wiring) => wiring.legacyScript)
  apply(
    HOOK_SETTINGS_PATH,
    settingsNext.text,
    settingsRaw === null
      ? 'created'
      : legacyEntries.length > 0
        ? `${settingsNext.events.join(' + ')} entry wired; old entry runs ${legacyEntries.join(', ')}`
        : `${settingsNext.events.join(' + ')} entry wired`,
  )

  const gitignoreRaw = read(at('.gitignore'))
  apply('.gitignore', nextGitignore(gitignoreRaw), `ignores ${HOOK_CACHE_IGNORE}`)

  // Last: the old scripts go only after settings.json no longer runs them.
  const migration: string[] = []
  for (const wiring of settingsNext.legacy) {
    if (!options.check) migration.push(`migrated: ${wiring.legacyScript} -> ${wiring.script}`)
  }
  for (const {legacyScript} of WIRINGS) {
    if (!existsSync(at(legacyScript))) continue
    if (options.check) {
      changes.push({path: legacyScript, status: 'stale', detail: 'old script, install removes it'})
      continue
    }
    rmSync(at(legacyScript))
    changes.push({path: legacyScript, status: 'removed', detail: 'old script'})
    migration.push(`removed: ${legacyScript}`)
  }
  if (existsSync(at(LEGACY_HOOK_NOTES_PATH))) {
    if (existsSync(at(HOOK_NOTES_PATH))) {
      migration.push(`kept: ${LEGACY_HOOK_NOTES_PATH} (${HOOK_NOTES_PATH} already exists)`)
    } else if (options.check) {
      changes.push({
        path: LEGACY_HOOK_NOTES_PATH,
        status: 'stale',
        detail: `old notes, install renames them to ${HOOK_NOTES_PATH}`,
      })
    } else {
      renameSync(at(LEGACY_HOOK_NOTES_PATH), at(HOOK_NOTES_PATH))
      migration.push(`migrated: ${LEGACY_HOOK_NOTES_PATH} -> ${HOOK_NOTES_PATH}`)
    }
  }

  const stale = changes.filter((change) => change.status === 'stale')
  const lines = changes
    .filter((change) => change.status !== 'removed')
    .map((change) => `  ${change.status.padEnd(9)} ${change.path} — ${change.detail}`)
  const legacyFound =
    legacyEntries.length > 0 || stale.some((change) => change.detail.startsWith('old '))

  if (options.check) {
    return stale.length === 0
      ? {
          text: `greenrack hook install --check: up to date\n${lines.join('\n')}`,
          data: {ok: true, changes},
        }
      : {
          text: `greenrack hook install --check: ${stale.length} file(s) out of date\n${lines.join(
            '\n',
          )}\nRun: ${legacyFound ? UPGRADE_COMMAND : 'npx -y @greenharness/greenrack-cli hook install'}`,
          data: {ok: false, changes},
          exitCode: 1,
        }
  }

  const ignored = ignoredTrackables(root)
  return {
    text: [
      'Duro hooks installed: SessionStart (catalog) and UserPromptSubmit (plan-mode nudge).',
      ...migration,
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
