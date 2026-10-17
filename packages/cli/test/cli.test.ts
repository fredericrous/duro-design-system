import {execFileSync} from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {describe, expect, it} from 'vitest'
import {loadRegistry, lookup} from '../src/registry.js'
import {runLookup} from '../src/commands/lookup.js'
import {runList} from '../src/commands/list.js'
import {runManifest} from '../src/commands/manifest.js'
import {listFiles, runSkill} from '../src/commands/skill.js'
import {SKILL, SKILL_MIN_CLI, SKILL_PATH} from '../src/skill-template.js'
import {runHook} from '../src/commands/hook.js'
import {relatedPairs} from '../src/disambiguation.js'
import {search} from '../src/search.js'
import {COMMANDS} from '../src/manifest.js'
import {
  HOOK_CACHE_IGNORE,
  HOOK_COMMAND,
  HOOK_SCRIPT,
  HOOK_SCRIPT_PATH,
  HOOK_SETTINGS_PATH,
  PLAN_HOOK_COMMAND,
  PLAN_HOOK_SCRIPT,
  PLAN_HOOK_SCRIPT_PATH,
  PLAN_NUDGE,
} from '../src/hook-script.js'

const registry = loadRegistry()
const bin = fileURLToPath(new URL('../dist/bin.js', import.meta.url))
const skillsDir = fileURLToPath(new URL('../skills/', import.meta.url))

function duro(...args: string[]): {stdout: string; code: number} {
  try {
    return {stdout: execFileSync(process.execPath, [bin, ...args], {encoding: 'utf8'}), code: 0}
  } catch (error) {
    const failure = error as {status?: number; stdout?: string}
    return {stdout: failure.stdout ?? '', code: failure.status ?? -1}
  }
}

describe('lookup dispatch', () => {
  it('components, recipes, token groups, icons and rules all resolve', () => {
    for (const name of ['Button', 'login-form', 'spacing', 'icons', 'rules']) {
      expect(lookup(registry, name), name).not.toBeNull()
    }
  })
  it('is case-insensitive on exact names', () => {
    expect(lookup(registry, 'button')?.key).toBe('Button')
  })
  it('search ranks Cluster first for wrapping tags', () => {
    expect(search(registry, 'tags that wrap')[0].key).toBe('Cluster')
  })
  it('falls back to search then not-found', () => {
    expect(runLookup(registry, 'tags that wrap', {}).exitCode).toBeUndefined()
    const notFound = runLookup(registry, 'zzzz-nope', {})
    expect(notFound.exitCode).toBe(1)
  })
  it('unknown part is a not-found error naming the parts', () => {
    expect(() => runLookup(registry, 'Select', {part: 'Nope'})).toThrowError(/parts: /)
  })
})

describe('command results', () => {
  it('every relatedTo edge declares its kind', () => {
    // The kind is what keeps composition ("Place Input inside Field.Root") out
    // of a section that promises to decide between alternatives. A new edge
    // without one is a type error at authoring time; this catches a registry
    // built before that guard existed.
    for (const [name, entry] of Object.entries(registry.components)) {
      for (const related of entry.meta?.relatedTo ?? []) {
        expect(['contrast', 'composition'], `${name} -> ${related.component}`).toContain(
          related.kind,
        )
      }
    }
  })

  it('contrast and composition are separate, non-overlapping tables', () => {
    const label = (pair: {a: string; b: string}) => `${pair.a}|${pair.b}`
    const contrast = relatedPairs(registry, 'contrast').map(label)
    const composition = relatedPairs(registry, 'composition').map(label)
    // Alternatives you pick between.
    expect(contrast).toContain('Menu|Select')
    expect(contrast).toContain('Card|Panel')
    // Composition — Input goes inside Field.Root, it is not an alternative to
    // it. Shown as "Input vs Field" this would read as the opposite advice.
    expect(composition).toContain('Field|Input')
    expect(composition).toContain('ScrollArea|Table')
    // React composes: "built on" and "wraps" are composition, not a choice.
    expect(composition).toContain('ConfirmDialog|Dialog')
    expect(composition).toContain('Icon|StatusIcon')
    expect(contrast.filter((pair) => composition.includes(pair))).toEqual([])
  })

  it('pairs are deduped, sorted and deterministic', () => {
    for (const kind of ['contrast', 'composition'] as const) {
      const pairs = relatedPairs(registry, kind)
      const labels = pairs.map((pair) => `${pair.a}|${pair.b}`)
      expect(new Set(labels).size, kind).toBe(labels.length)
      // Components sharing a meta file restate the same sentence; keep one.
      expect(new Set(pairs.map((pair) => pair.relationship)).size, kind).toBe(pairs.length)
      expect(labels, kind).toEqual(
        [...pairs]
          .sort((x, y) => x.a.localeCompare(y.a) || x.b.localeCompare(y.b))
          .map((pair) => `${pair.a}|${pair.b}`),
      )
      expect(relatedPairs(registry, kind), kind).toEqual(pairs)
    }
  })

  it('session-start leads with the screens table and points every layout at a recipe', () => {
    const text = runHook(registry, 'session-start').text
    const screens = text.indexOf('SCREENS — START FROM A RECIPE')
    expect(screens).toBeGreaterThan(0)
    expect(screens).toBeLessThan(text.indexOf(runList(registry).text))
    for (const recipe of ['split-pane', 'admin-detail-page', 'page-with-sidenav']) {
      expect(text).toContain(`  ${recipe}`)
    }
    const composition = relatedPairs(registry, 'composition')
    const targets = composition.map((pair) => `${pair.a}+${pair.b}`)
    expect(targets).toContain('PageShell+page-with-sidenav')
    expect(targets).toContain('Grid+split-pane')
    expect(targets).toContain('Tabs+admin-detail-page')
  })

  it('session-start carries both tables, not just the index', () => {
    const text = runHook(registry, 'session-start').text
    expect(text).toContain('PICKING BETWEEN NEIGHBORS')
    expect(text).toContain('COMPOSE')
    // The whole point: neither answer needs a second call.
    expect(text).toContain('Menu vs Select')
    expect(text).toContain('Field + Input')
  })

  it('hook session-start emits the preamble plus the list, other events are usage errors', () => {
    const ok = runHook(registry, 'session-start')
    expect(ok.exitCode).toBeUndefined()
    expect(ok.text).toContain('hand-rolling')
    expect(ok.text).toContain('/duro-mockup')
    expect(ok.text).toContain(runList(registry).text)
    expect(runHook(registry, 'nope').exitCode).toBe(2)
    expect(runHook(registry).exitCode).toBe(2)
  })
  it('list returns entries for each kind', () => {
    const all = runList(registry).data as Array<{name: string; kind: string}>
    expect(all.some((entry) => entry.kind === 'compound')).toBe(true)
    expect(all.some((entry) => entry.kind === 'recipe')).toBe(true)
    expect(all.some((entry) => entry.kind === 'tokens')).toBe(true)
    expect(runList(registry, 'nope').exitCode).toBe(2)
  })
  it('manifest enums cover the lookup namespace and commands match dispatch', () => {
    const manifest = runManifest(registry).data as {
      enums: {names: string[]}
      commands: Array<{name: string}>
    }
    expect(manifest.enums.names).toContain('Button')
    expect(manifest.enums.names).toContain('login-form')
    expect(manifest.enums.names).toContain('rules')
    expect(COMMANDS.map((command) => command.name).sort()).toEqual([
      'doctor',
      'hook',
      'list',
      'lookup',
      'manifest',
      'mcp',
      'mockup',
      'skill',
    ])
  })
})

describe('bin end-to-end', () => {
  it('duro Button prints the prop table', () => {
    const {stdout, code} = duro('Button')
    expect(code).toBe(0)
    expect(stdout).toContain("import {Button} from '@duro-app/ui'")
    expect(stdout).toContain('ButtonVariant')
  })
  it('--json emits parseable JSON and nothing else on stdout', () => {
    const {stdout, code} = duro('Button', '--json')
    expect(code).toBe(0)
    const parsed = JSON.parse(stdout) as {kind: string; key: string}
    expect(parsed).toMatchObject({kind: 'component', key: 'Button'})
  })
  it('--source-only output is pipeable source', () => {
    const {stdout} = duro('login-form', '--source-only')
    expect(stdout).toMatch(/^import \{Schema\} from 'effect'/)
    expect(stdout).not.toContain('recipeMeta')
  })
  it('misspellings suggest and exit 1', () => {
    const {code} = duro('Buton')
    expect(code).toBe(1)
  })
  it('unknown flags exit 2', () => {
    const {code} = duro('Button', '--frobnicate')
    expect(code).toBe(2)
  })
})

describe('hook install', () => {
  const repo = () => mkdtempSync(join(tmpdir(), 'duro-hook-'))
  const at = (root: string, path: string) => join(root, path)
  const install = (root: string, check = false) => runHook(registry, 'install', {cwd: root, check})

  it('wires an empty repo: script, settings and gitignore', () => {
    const root = repo()
    const result = install(root)
    expect(result.exitCode).toBeUndefined()
    expect(readFileSync(at(root, HOOK_SCRIPT_PATH), 'utf8')).toBe(HOOK_SCRIPT)
    const settings = JSON.parse(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8'))
    expect(settings.hooks.SessionStart[0].hooks[0].command).toBe(HOOK_COMMAND)
    expect(readFileSync(at(root, PLAN_HOOK_SCRIPT_PATH), 'utf8')).toBe(PLAN_HOOK_SCRIPT)
    expect(settings.hooks.UserPromptSubmit).toEqual([
      {hooks: [{type: 'command', command: PLAN_HOOK_COMMAND}]},
    ])
    expect(readFileSync(at(root, '.gitignore'), 'utf8')).toContain(HOOK_CACHE_IGNORE)
  })

  it('is idempotent and --check passes on a wired repo', () => {
    const root = repo()
    install(root)
    const again = install(root)
    expect(again.data).toMatchObject({ok: true})
    expect(
      (again.data as {changes: Array<{status: string}>}).changes.every(
        (c) => c.status === 'unchanged',
      ),
    ).toBe(true)
    expect(install(root, true).exitCode).toBeUndefined()
  })

  it('--check exits 1 on a repo that was never wired, and writes nothing', () => {
    const root = repo()
    const result = install(root, true)
    expect(result.exitCode).toBe(1)
    expect(result.text).toContain('hook install')
    expect(() => readFileSync(at(root, HOOK_SCRIPT_PATH), 'utf8')).toThrow()
  })

  it('--check catches a hand-edited script', () => {
    const root = repo()
    install(root)
    writeFileSync(at(root, HOOK_SCRIPT_PATH), '#!/bin/sh\necho tampered\n')
    expect(install(root, true).exitCode).toBe(1)
    expect(install(root).exitCode).toBeUndefined()
    expect(readFileSync(at(root, HOOK_SCRIPT_PATH), 'utf8')).toBe(HOOK_SCRIPT)
  })

  it('--check catches a hand-edited plan hook and a removed UserPromptSubmit entry', () => {
    const root = repo()
    install(root)
    writeFileSync(at(root, PLAN_HOOK_SCRIPT_PATH), '#!/bin/sh\necho tampered\n')
    expect(install(root, true).exitCode).toBe(1)
    install(root)
    expect(readFileSync(at(root, PLAN_HOOK_SCRIPT_PATH), 'utf8')).toBe(PLAN_HOOK_SCRIPT)

    const settings = JSON.parse(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8'))
    delete settings.hooks.UserPromptSubmit
    writeFileSync(at(root, HOOK_SETTINGS_PATH), JSON.stringify(settings, null, 2) + '\n')
    const stale = install(root, true)
    expect(stale.exitCode).toBe(1)
    expect(stale.text).toContain(HOOK_SETTINGS_PATH)
  })

  it('joins an existing UserPromptSubmit array without removing other hooks', () => {
    const root = repo()
    mkdirSync(at(root, '.claude'), {recursive: true})
    const other = {matcher: '', hooks: [{type: 'command', command: 'sh lint-prompt.sh'}]}
    writeFileSync(
      at(root, HOOK_SETTINGS_PATH),
      JSON.stringify({hooks: {UserPromptSubmit: [other]}}),
    )
    install(root)
    const settings = JSON.parse(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8'))
    expect(settings.hooks.UserPromptSubmit).toEqual([
      other,
      {hooks: [{type: 'command', command: PLAN_HOOK_COMMAND}]},
    ])
    expect(install(root, true).exitCode).toBeUndefined()
  })

  it('keeps unrelated settings and existing SessionStart hooks', () => {
    const root = repo()
    mkdirSync(at(root, '.claude'), {recursive: true})
    writeFileSync(
      at(root, HOOK_SETTINGS_PATH),
      JSON.stringify({
        permissions: {allow: ['Bash(pnpm test)']},
        hooks: {SessionStart: [{hooks: [{type: 'command', command: 'sh other.sh'}]}]},
      }),
    )
    install(root)
    const settings = JSON.parse(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8'))
    expect(settings.permissions.allow).toEqual(['Bash(pnpm test)'])
    const commands = settings.hooks.SessionStart.flatMap((g: {hooks: Array<{command: string}>}) =>
      g.hooks.map((h) => h.command),
    )
    expect(commands).toEqual(['sh other.sh', HOOK_COMMAND])
  })

  it('migrates a legacy inline/renamed duro command in place', () => {
    const root = repo()
    mkdirSync(at(root, '.claude'), {recursive: true})
    writeFileSync(
      at(root, HOOK_SETTINGS_PATH),
      JSON.stringify({
        hooks: {
          SessionStart: [
            {hooks: [{type: 'command', command: 'sh ./.claude/hooks/duro-catalog.sh'}]},
          ],
        },
      }),
    )
    install(root)
    const settings = JSON.parse(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8'))
    expect(settings.hooks.SessionStart[0].hooks[0].command).toBe(HOOK_COMMAND)
    expect(settings.hooks.SessionStart).toHaveLength(1)
  })

  it('does not duplicate an existing gitignore rule', () => {
    const root = repo()
    writeFileSync(at(root, '.gitignore'), `node_modules\n${HOOK_CACHE_IGNORE}\n`)
    install(root)
    const ignore = readFileSync(at(root, '.gitignore'), 'utf8')
    expect(ignore.split('\n').filter((line) => line.trim() === HOOK_CACHE_IGNORE)).toHaveLength(1)
  })

  it('warns when .gitignore shadows the files it just wrote', () => {
    const root = repo()
    execFileSync('git', ['init', '-q'], {cwd: root})
    writeFileSync(at(root, '.gitignore'), '.claude/*\n')
    const result = install(root)
    expect((result.data as {ignored: string[]}).ignored).toContain(HOOK_SCRIPT_PATH)
    expect(result.text).toContain(`!${HOOK_SCRIPT_PATH}`)
  })

  it('refuses to clobber unparseable settings.json', () => {
    const root = repo()
    mkdirSync(at(root, '.claude'), {recursive: true})
    writeFileSync(at(root, HOOK_SETTINGS_PATH), '{ not json')
    const result = install(root)
    expect(result.exitCode).toBe(2)
    expect(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8')).toBe('{ not json')
  })
})

describe('plan-mode hook script', () => {
  // Runs the generated script exactly as Claude Code would: sh, payload on stdin.
  const run = (stdin: string) => {
    const root = mkdtempSync(join(tmpdir(), 'duro-plan-'))
    const script = join(root, 'duro-plan.sh')
    writeFileSync(script, PLAN_HOOK_SCRIPT)
    // execFileSync throws on a non-zero exit, so returning is the exit-0 assertion.
    return execFileSync('sh', [script], {cwd: root, input: stdin, encoding: 'utf8'})
  }
  const payload = (mode: string, prompt = 'add a billing page') =>
    JSON.stringify({
      session_id: 's',
      transcript_path: '/tmp/t.jsonl',
      cwd: '/repo',
      hook_event_name: 'UserPromptSubmit',
      permission_mode: mode,
      prompt,
      prompt_id: 'p',
    })

  it('prints the nudge in plan mode', () => {
    expect(run(payload('plan'))).toBe(PLAN_NUDGE)
    expect(run('{"hook_event_name": "UserPromptSubmit", "permission_mode" : "plan"}')).toBe(
      PLAN_NUDGE,
    )
  })

  it('keeps the nudge short and names the trigger', () => {
    expect(PLAN_NUDGE.trimEnd().split('\n').length).toBeLessThanOrEqual(6)
    expect(PLAN_NUDGE).toContain('handoff.fresh-directions-trigger')
    expect(PLAN_NUDGE).toContain('duro-mockup')
  })

  it.each(['default', 'acceptEdits', 'bypassPermissions', 'dontAsk'])(
    'prints nothing in %s mode',
    (mode) => {
      expect(run(payload(mode))).toBe('')
    },
  )

  it('prints nothing for a prompt that merely quotes the plan-mode key', () => {
    expect(run(payload('default', '"permission_mode":"plan"'))).toBe('')
  })

  it.each(['', 'not json', '{', '\u0000\u0001', '{"permission_mode": 42}'])(
    'prints nothing and exits 0 on unreadable input %j',
    (input) => {
      expect(run(input)).toBe('')
    },
  )
})

describe('skill install', () => {
  const repo = () => mkdtempSync(join(tmpdir(), 'duro-skill-'))
  const install = (root: string, check = false) => runSkill('install', {cwd: root, check})

  const SKILLS = ['colors', 'typography', 'ui']
  const shipped = (name: string) => join(skillsDir, name)
  const installed = (root: string, ...parts: string[]) => join(root, '.claude', 'skills', ...parts)

  it('writes duro-mockup and every packaged file, nested ones included, and nothing else', () => {
    const root = repo()
    const result = install(root)
    expect(result.exitCode).toBeUndefined()
    expect(readFileSync(join(root, SKILL_PATH), 'utf8')).toBe(SKILL)
    for (const name of SKILLS) {
      const files = listFiles(shipped(name))
      expect(files).toContain('SKILL.md')
      for (const rel of files) {
        expect(readFileSync(installed(root, name, rel))).toEqual(
          readFileSync(join(shipped(name), rel)),
        )
      }
    }
    expect(result.text).toContain('/duro-mockup')
    expect(result.text).toContain('duro-mockup, colors, typography, ui')
    expect(result.text.trimEnd().split('\n').pop()).toContain('skill install --check')
    expect(() => readFileSync(join(root, '.claude', 'settings.json'), 'utf8')).toThrow()
    expect(readdirSync(installed(root, 'ui')).some((file) => file.endsWith('.tmp'))).toBe(false)
  })

  it('writes a nested file at its relative path and exits 2 on a missing or empty skills directory', () => {
    const scratch = mkdtempSync(join(tmpdir(), 'duro-skills-src-'))
    mkdirSync(join(scratch, 'ui', 'refs', 'deep'), {recursive: true})
    writeFileSync(join(scratch, 'ui', 'SKILL.md'), 'skill\n')
    writeFileSync(join(scratch, 'ui', 'NOTICE.md'), 'notice\n')
    writeFileSync(join(scratch, 'ui', 'refs', 'deep', 'a.md'), 'nested\n')
    const root = repo()
    const result = runSkill('install', {cwd: root, skillsDir: pathToFileURL(`${scratch}/`)})
    expect(result.exitCode).toBeUndefined()
    expect(readFileSync(installed(root, 'ui', 'refs', 'deep', 'a.md'), 'utf8')).toBe('nested\n')
    expect(listFiles(scratch)).toEqual(['ui/NOTICE.md', 'ui/SKILL.md', 'ui/refs/deep/a.md'])

    const empty = mkdtempSync(join(tmpdir(), 'duro-skills-empty-'))
    expect(runSkill('install', {cwd: repo(), skillsDir: pathToFileURL(`${empty}/`)}).exitCode).toBe(
      2,
    )
    expect(
      runSkill('install', {cwd: repo(), skillsDir: pathToFileURL(`${empty}/nope/`)}).exitCode,
    ).toBe(2)
  })

  it('is idempotent with one line per unchanged skill, and --check passes when wired', () => {
    const root = repo()
    expect(install(root, true).exitCode).toBe(1)
    install(root)
    const again = install(root)
    expect(again.exitCode).toBeUndefined()
    const changes = (again.data as {changes: {status: string}[]}).changes
    expect(changes.length).toBeGreaterThan(4)
    expect(changes.every((change) => change.status === 'unchanged')).toBe(true)
    const lines = again.text.split('\n').filter((line) => line.startsWith('  unchanged'))
    expect(lines).toHaveLength(4)
    expect(install(root, true).exitCode).toBeUndefined()
  })

  it('--check reports a hand edit, a missing file and an orphan file as stale (exit 1)', () => {
    const root = repo()
    install(root)
    writeFileSync(join(root, SKILL_PATH), '# tampered\n')
    const edited = install(root, true)
    expect(edited.exitCode).toBe(1)
    expect(edited.text).toContain('differs')
    expect(readFileSync(join(root, SKILL_PATH), 'utf8')).toBe('# tampered\n')
    install(root)

    writeFileSync(installed(root, 'colors', 'SKILL.md'), 'edited\n')
    const colorsEdit = install(root, true)
    expect(colorsEdit.exitCode).toBe(1)
    expect(colorsEdit.text).toContain('.claude/skills/colors/SKILL.md')
    install(root)

    rmSync(installed(root, 'typography', 'SKILL.md'))
    const missing = install(root, true)
    expect(missing.exitCode).toBe(1)
    expect(missing.text).toContain('missing')
    install(root)

    writeFileSync(installed(root, 'ui', 'orphan.md'), 'left behind\n')
    const orphan = install(root, true)
    expect(orphan.exitCode).toBe(1)
    expect(orphan.text).toContain('.claude/skills/ui/orphan.md')
    expect(existsSync(installed(root, 'ui', 'orphan.md'))).toBe(true)
  })

  it('install removes an orphan only where the directory carries NOTICE.md', () => {
    const root = repo()
    install(root)
    writeFileSync(installed(root, 'ui', 'orphan.md'), 'x\n')
    const result = install(root)
    expect(result.text).toContain('removed')
    expect(existsSync(installed(root, 'ui', 'orphan.md'))).toBe(false)
    expect(install(root, true).exitCode).toBeUndefined()

    // Without the shipped NOTICE.md and with --force: written over, orphan only listed.
    const foreign = repo()
    mkdirSync(installed(foreign, 'ui'), {recursive: true})
    writeFileSync(installed(foreign, 'ui', 'mine.md'), 'mine\n')
    const forced = runSkill('install', {cwd: foreign, force: true})
    expect(forced.exitCode).toBeUndefined()
    expect(forced.text).toContain('removed')
    expect(forced.text).toContain('.claude/skills/ui/mine.md')
    expect(existsSync(installed(foreign, 'ui', 'mine.md'))).toBe(false)

    // A second plain install after --force changes nothing.
    const again = install(foreign)
    expect(again.exitCode).toBeUndefined()
    expect(again.text).not.toContain('removed')
    expect(again.text).not.toContain('regenerated')
    expect(again.text).not.toContain('created')
  })

  it('exits 2 with the error message when the skills directory cannot be read', () => {
    const root = repo()
    const notADirectory = pathToFileURL(join(root, 'plain-file'))
    writeFileSync(join(root, 'plain-file'), 'x\n')
    const result = runSkill('install', {cwd: root, skillsDir: notADirectory})
    expect(result.exitCode).toBe(2)
    expect(result.text).toContain('ENOTDIR')
    expect(result.text).not.toContain('missing or empty')
  })

  it('warns for each skill when an allowlisted .claude would not ship them', () => {
    const root = repo()
    execFileSync('git', ['init', '-q'], {cwd: root})
    writeFileSync(join(root, '.gitignore'), '.claude/*\n')
    const result = install(root)
    for (const name of ['duro-mockup', ...SKILLS]) {
      expect(result.text).toContain(`!.claude/skills/${name}/SKILL.md`)
    }
  })

  it('refuses a foreign ui directory (exit 1) and overwrites it with --force', () => {
    const root = repo()
    mkdirSync(installed(root, 'ui'), {recursive: true})
    writeFileSync(installed(root, 'ui', 'SKILL.md'), 'my own ui skill\n')
    const refused = install(root)
    expect(refused.exitCode).toBe(1)
    expect(refused.text).toContain('--force')
    expect(readFileSync(installed(root, 'ui', 'SKILL.md'), 'utf8')).toBe('my own ui skill\n')
    expect(existsSync(join(root, SKILL_PATH))).toBe(false)

    const forced = runSkill('install', {cwd: root, force: true})
    expect(forced.exitCode).toBeUndefined()
    expect(readFileSync(installed(root, 'ui', 'SKILL.md'))).toEqual(
      readFileSync(join(shipped('ui'), 'SKILL.md')),
    )
  })

  it('names --force in the command help', () => {
    const skill = COMMANDS.find((command) => command.name === 'skill')
    expect(skill?.flags.find((flag) => flag.name === 'force')?.description).toContain('--force')
    const help = duro('skill', '--help')
    expect(help.code).toBe(0)
    expect(help.stdout).toContain('--force')
  })

  it('packs skills/{colors,typography,ui}/SKILL.md', () => {
    const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
      cwd: fileURLToPath(new URL('..', import.meta.url)),
      encoding: 'utf8',
    })
    const packed = (JSON.parse(out) as {files: {path: string}[]}[])[0].files.map(
      (file) => file.path,
    )
    for (const name of SKILLS) expect(packed).toContain(`skills/${name}/SKILL.md`)
  }, 60_000)

  it('refuses an unknown action', () => {
    expect(runSkill('uninstall', {cwd: repo()}).exitCode).toBe(2)
  })

  it('the skill overrides the design skill and pins the CLI floor', () => {
    expect(SKILL).toContain('name: duro-mockup')
    expect(SKILL).toContain("overrides the `design` skill's step 0")
    expect(SKILL).toContain(`npx -y @duro-app/cli@^${SKILL_MIN_CLI} mockup check`)
    expect(SKILL).toContain('docs/mockups/<screen>')
    expect(SKILL).toContain('Mockup: none')
  })

  it('the skill also triggers while planning a screen', () => {
    const description = SKILL.split('\n').find((line) => line.startsWith('description:'))
    expect(description).toContain('plan mode')
  })
})

describe('the /duro-mockup skill names only what the CLI ships', () => {
  it('every `duro mockup <sub>` it runs is a real subcommand', async () => {
    const {MOCKUP_SUBCOMMANDS} = await import('../src/commands/mockup.js')
    const subs = [...SKILL.matchAll(/@duro-app\/cli@\S+ mockup ([a-z-]+)/g)].map((m) => m[1])
    expect(subs).toEqual(expect.arrayContaining(['seed', 'check', 'canvas']))
    for (const sub of subs) expect(MOCKUP_SUBCOMMANDS).toContain(sub)
  })

  it('sends the agent to no helper Duro does not ship', () => {
    expect(SKILL).not.toMatch(/seed-canvas|bundled-skills/)
  })
})
