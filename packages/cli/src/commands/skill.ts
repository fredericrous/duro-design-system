import {execFileSync} from 'node:child_process'
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import type {CommandResult} from './lookup.js'
import {SKILL, SKILL_NOTES_PATH, SKILL_PATH} from '../skill-template.js'

/*
 * duro skill install — wire the mockup → PR workflow into a consuming repo.
 *
 * Claude Code discovers `.claude/skills/<name>/SKILL.md` on its own, so
 * unlike the SessionStart hook there is no settings entry to add: install is
 * one file, byte-compared so a workflow change is a regenerate everywhere
 * rather than a hand-edit per repo.
 */

export interface SkillOptions {
  /** Report drift and exit 1 instead of writing. For CI. */
  check?: boolean
  /** Repo root. Defaults to the process cwd. */
  cwd?: string
}

const ACTIONS = ['install']

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
 * Repos that allowlist .claude (".claude/*" plus "!" exceptions) silently
 * ignore the file install just wrote — the skill then works locally and
 * ships to nobody. Best-effort: no git, no warning.
 */
function ignoredTrackables(root: string, candidates: string[]): string[] {
  try {
    const out = execFileSync('git', ['check-ignore', '--', ...candidates], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return out.split('\n').filter(Boolean)
  } catch {
    // Exit 1 means nothing matched, which is the happy path.
    return []
  }
}

export function runSkill(action: string | undefined, options: SkillOptions = {}): CommandResult {
  if (action !== 'install') {
    return {
      text: `duro skill: unknown action "${action ?? ''}" — expected ${ACTIONS.join(' | ')}`,
      data: {kind: 'usage-error'},
      exitCode: 2,
    }
  }
  const root = options.cwd ?? process.cwd()
  const changes: FileChange[] = []

  const current = read(join(root, SKILL_PATH))
  if (current === SKILL) {
    changes.push({path: SKILL_PATH, status: 'unchanged', detail: 'already up to date'})
  } else if (options.check) {
    changes.push({
      path: SKILL_PATH,
      status: 'stale',
      detail: current === null ? 'missing' : 'differs',
    })
  } else {
    write(join(root, SKILL_PATH), SKILL)
    changes.push({
      path: SKILL_PATH,
      status: 'written',
      detail: current === null ? 'created' : 'regenerated',
    })
  }

  const lines = changes.map(
    (change) => `  ${change.status.padEnd(9)} ${change.path} — ${change.detail}`,
  )
  const stale = changes.filter((change) => change.status === 'stale')

  if (options.check) {
    return stale.length === 0
      ? {
          text: `duro skill install --check: up to date\n${lines.join('\n')}`,
          data: {ok: true, changes},
        }
      : {
          text: `duro skill install --check: ${stale.length} file(s) out of date\n${lines.join(
            '\n',
          )}\nRun: npx -y @duro-app/cli skill install`,
          data: {ok: false, changes},
          exitCode: 1,
        }
  }

  const ignored = ignoredTrackables(root, [SKILL_PATH, SKILL_NOTES_PATH])
  return {
    text: [
      'Duro mockup skill installed — invoke it as /duro-mockup.',
      ...lines,
      '',
      `Repo-specific notes: put them in ${SKILL_NOTES_PATH} — the skill reads that file,`,
      'and regeneration leaves it alone.',
      ...(ignored.length === 0
        ? []
        : [
            '',
            'WARNING: .gitignore excludes these, so the skill would ship to nobody.',
            'Add a negation for each:',
            ...ignored.map((path) => `  !${path}`),
          ]),
    ].join('\n'),
    data: {ok: true, changes, ignored},
  }
}
