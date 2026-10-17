import {execFileSync} from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import type {CommandResult} from './lookup.js'
import {SKILL, SKILL_NOTES_PATH, SKILL_PATH} from '../skill-template.js'

/*
 * duro skill install — wire the mockup → PR workflow into a consuming repo.
 *
 * Claude Code discovers `.claude/skills/<name>/SKILL.md` on its own, so
 * unlike the SessionStart hook there is no settings entry to add. Install
 * writes duro-mockup (a template string) and every file of the packaged
 * `skills/<name>/` (colors, typography, ui), byte-compared so a change is a
 * regenerate everywhere rather than a hand-edit per repo.
 */

export interface SkillOptions {
  /** Report drift and exit 1 instead of writing. For CI. */
  check?: boolean
  /** Write into an existing skill directory that lacks the shipped NOTICE.md. */
  force?: boolean
  /** Repo root. Defaults to the process cwd. */
  cwd?: string
  /** Packaged skills directory. Defaults to the one shipped next to dist/; tests override it. */
  skillsDir?: URL
}

const ACTIONS = ['install']
const SKILLS_ROOT = '.claude/skills'
/** Marks a directory as one install wrote: the packaged skills each ship it. */
const NOTICE = 'NOTICE.md'
const SKILLS_DIR = new URL('../../skills/', import.meta.url)

interface FileChange {
  path: string
  status: 'written' | 'unchanged' | 'stale' | 'removed'
  detail: string
}

interface PlannedFile {
  skill: string
  /** Repo-relative POSIX path. */
  path: string
  content: Buffer
}

/** Byte-wise order of the UTF-8 paths; scripts/lib/guides.mjs sorts the same way. */
function byBytes(a: string, b: string): number {
  return Buffer.compare(Buffer.from(a), Buffer.from(b))
}

/** Every file under `dir`, as relative POSIX paths sorted byte-wise. */
export function listFiles(dir: string): string[] {
  const out: string[] = []
  const walk = (prefix: string): void => {
    for (const entry of readdirSync(join(dir, prefix), {withFileTypes: true})) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) walk(rel)
      else if (entry.isFile()) out.push(rel)
    }
  }
  walk('')
  return out.sort(byBytes)
}

/** The packaged skills: name -> files. Null when the directory is missing or empty. */
function packagedSkills(skillsDir: URL): Map<string, string[]> | null {
  const root = fileURLToPath(skillsDir)
  try {
    const skills = new Map<string, string[]>()
    const names = readdirSync(root, {withFileTypes: true})
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(byBytes)
    for (const name of names) {
      const files = listFiles(join(root, name))
      if (files.length > 0) skills.set(name, files)
    }
    return skills.size === 0 ? null : skills
  } catch {
    return null
  }
}

function read(path: string): Buffer | null {
  try {
    return readFileSync(path)
  } catch {
    return null
  }
}

/** Write to `<path>.tmp`, then rename, so an interrupted install leaves no half file. */
function write(path: string, content: Buffer): void {
  mkdirSync(dirname(path), {recursive: true})
  const tmp = `${path}.tmp`
  writeFileSync(tmp, content)
  renameSync(tmp, path)
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
  const skillsDir = options.skillsDir ?? SKILLS_DIR
  const packaged = packagedSkills(skillsDir)
  if (!packaged) {
    return {
      text: `duro skill: the packaged skills directory is missing or empty (${fileURLToPath(skillsDir)}) — reinstall @duro-app/cli`,
      data: {kind: 'missing-skills'},
      exitCode: 2,
    }
  }

  const skillDirOf = (name: string): string => join(root, SKILLS_ROOT, name)
  // Decided before anything is written: install itself adds NOTICE.md.
  const ownedAtStart = new Set(
    [...packaged.keys()].filter((name) => existsSync(join(skillDirOf(name), NOTICE))),
  )
  const owned = (name: string): boolean => ownedAtStart.has(name)

  if (!options.check && !options.force) {
    const foreign = [...packaged.keys()].filter(
      (name) => existsSync(skillDirOf(name)) && !owned(name),
    )
    if (foreign.length > 0) {
      return {
        text: [
          `duro skill install: ${foreign.map((name) => `${SKILLS_ROOT}/${name}`).join(', ')} exist${foreign.length === 1 ? 's' : ''} without the shipped ${NOTICE}, so ${foreign.length === 1 ? 'it looks' : 'they look'} like your own skill.`,
          'Nothing was written. Re-run with --force to overwrite: npx -y @duro-app/cli skill install --force',
        ].join('\n'),
        data: {kind: 'foreign-skill-directory', directories: foreign},
        exitCode: 1,
      }
    }
  }

  const planned: PlannedFile[] = [
    {skill: 'duro-mockup', path: SKILL_PATH, content: Buffer.from(SKILL, 'utf8')},
  ]
  for (const [name, files] of packaged) {
    for (const rel of files) {
      planned.push({
        skill: name,
        path: `${SKILLS_ROOT}/${name}/${rel}`,
        content: readFileSync(new URL(`${name}/${rel}`, skillsDir)),
      })
    }
  }

  const changes: FileChange[] = []
  const skillOf = new Map<string, string>()
  for (const file of planned) {
    skillOf.set(file.path, file.skill)
    const current = read(join(root, file.path))
    if (current !== null && current.equals(file.content)) {
      changes.push({path: file.path, status: 'unchanged', detail: 'already up to date'})
    } else if (options.check) {
      changes.push({
        path: file.path,
        status: 'stale',
        detail: current === null ? 'missing' : 'differs',
      })
    } else {
      write(join(root, file.path), file.content)
      changes.push({
        path: file.path,
        status: 'written',
        detail: current === null ? 'created' : 'regenerated',
      })
    }
  }

  // A file the package does not ship, in a directory install owns.
  const shipped = new Set(planned.map((file) => file.path))
  for (const name of packaged.keys()) {
    const dir = skillDirOf(name)
    if (!existsSync(dir)) continue
    const removable = !options.check && owned(name)
    for (const rel of listFiles(dir)) {
      const path = `${SKILLS_ROOT}/${name}/${rel}`
      if (shipped.has(path)) continue
      skillOf.set(path, name)
      if (removable) {
        rmSync(join(root, path))
        changes.push({path, status: 'removed', detail: 'not shipped by the package'})
      } else {
        changes.push({
          path,
          status: 'stale',
          detail: options.check
            ? 'not shipped by the package'
            : `not shipped by the package; kept, ${name} has no ${NOTICE}`,
        })
      }
    }
  }

  // One line per skill when nothing changed in it, one per file otherwise.
  const lines: string[] = []
  for (const name of ['duro-mockup', ...packaged.keys()]) {
    const mine = changes.filter((change) => skillOf.get(change.path) === name)
    const touched = mine.filter((change) => change.status !== 'unchanged')
    if (touched.length === 0) {
      lines.push(`  unchanged ${SKILLS_ROOT}/${name} — ${mine.length} file(s) up to date`)
    } else {
      for (const change of touched) {
        lines.push(`  ${change.status.padEnd(9)} ${change.path} — ${change.detail}`)
      }
    }
  }
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

  const ignored = ignoredTrackables(root, [...planned.map((file) => file.path), SKILL_NOTES_PATH])
  const skillNames = ['duro-mockup', ...packaged.keys()]
  return {
    text: [
      `Duro skills installed: ${skillNames.join(', ')} — invoke the workflow as /duro-mockup.`,
      ...lines,
      '',
      `Repo-specific notes: put them in ${SKILL_NOTES_PATH} — the skill reads that file,`,
      'and regeneration leaves it alone.',
      ...(ignored.length === 0
        ? []
        : [
            '',
            'WARNING: .gitignore excludes these, so the skills would ship to nobody.',
            'Add a negation for each:',
            ...ignored.map((path) => `  !${path}`),
          ]),
      '',
      'Next: npx -y @duro-app/cli skill install --check',
    ].join('\n'),
    data: {ok: true, changes, ignored},
  }
}
