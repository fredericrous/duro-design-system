import {existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'
import {runHook} from '../src/commands/hook.js'
import {loadRegistry} from '../src/registry.js'
import {
  GITIGNORE_BLOCK,
  HOOK_CACHE_IGNORE,
  HOOK_COMMAND,
  HOOK_NOTES_PATH,
  HOOK_SCRIPT_PATH,
  HOOK_SETTINGS_PATH,
  PLAN_HOOK_COMMAND,
  PLAN_HOOK_SCRIPT_PATH,
} from '../src/hook-script.js'
import {
  LEGACY_GITIGNORE_COMMENT,
  LEGACY_HOOK_CACHE_IGNORE,
  LEGACY_HOOK_CACHE_PATH,
  LEGACY_HOOK_GENERATED_MARKER,
  LEGACY_HOOK_NOTES_PATH,
  LEGACY_HOOK_SCRIPT_PATH,
  LEGACY_PLAN_HOOK_SCRIPT_PATH,
} from '../src/legacy-names.js'

const registry = loadRegistry()
const install = (root: string, check = false) => runHook(registry, 'install', {cwd: root, check})
const at = (root: string, path: string) => join(root, path)
const noteLines = /^(migrated|removed|kept):/m

function oldApp(): string {
  const root = mkdtempSync(join(tmpdir(), 'hook-migrate-'))
  mkdirSync(at(root, '.claude/hooks'), {recursive: true})
  // The old CLI's header line, as it wrote it: only a generated script is removed.
  const header = `# old hook — ${LEGACY_HOOK_GENERATED_MARKER}.\n`
  writeFileSync(at(root, LEGACY_HOOK_SCRIPT_PATH), `#!/bin/sh\n${header}echo old catalog\n`)
  writeFileSync(at(root, LEGACY_PLAN_HOOK_SCRIPT_PATH), `#!/bin/sh\n${header}echo old plan\n`)
  writeFileSync(
    at(root, HOOK_SETTINGS_PATH),
    JSON.stringify({
      hooks: {
        SessionStart: [{hooks: [{type: 'command', command: `sh ${LEGACY_HOOK_SCRIPT_PATH}`}]}],
        UserPromptSubmit: [
          {hooks: [{type: 'command', command: `sh ${LEGACY_PLAN_HOOK_SCRIPT_PATH}`}]},
        ],
      },
    }),
  )
  return root
}

const commandsOf = (root: string, event: string): string[] => {
  const settings = JSON.parse(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8'))
  return settings.hooks[event].flatMap((group: {hooks: Array<{command: string}>}) =>
    group.hooks.map((entry) => entry.command),
  )
}

describe('hook install migrates the old wiring', () => {
  it('rewrites both entries, deletes the old scripts and reports each step', () => {
    const root = oldApp()
    const installReport = install(root)
    expect(installReport.exitCode).toBeUndefined()
    expect(commandsOf(root, 'SessionStart')).toEqual([HOOK_COMMAND])
    expect(commandsOf(root, 'UserPromptSubmit')).toEqual([PLAN_HOOK_COMMAND])
    expect(existsSync(at(root, HOOK_SCRIPT_PATH))).toBe(true)
    expect(existsSync(at(root, PLAN_HOOK_SCRIPT_PATH))).toBe(true)
    expect(readdirSync(at(root, '.claude/hooks')).filter((f) => f.startsWith('duro-'))).toEqual([])
    const lines = installReport.text.split('\n')
    expect(lines).toContain(`migrated: ${LEGACY_HOOK_SCRIPT_PATH} -> ${HOOK_SCRIPT_PATH}`)
    expect(lines).toContain(`migrated: ${LEGACY_PLAN_HOOK_SCRIPT_PATH} -> ${PLAN_HOOK_SCRIPT_PATH}`)
    expect(lines).toContain(`removed: ${LEGACY_HOOK_SCRIPT_PATH}`)
    expect(lines).toContain(`removed: ${LEGACY_PLAN_HOOK_SCRIPT_PATH}`)
    expect(installReport.text.includes('\u001b')).toBe(false)
  })

  it('a second install changes nothing and prints no migration line', () => {
    const root = oldApp()
    install(root)
    const before = readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8')
    const again = install(root)
    expect(again.text).not.toMatch(noteLines)
    expect(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8')).toBe(before)
    expect(
      (again.data as {changes: Array<{status: string}>}).changes.every(
        (change) => change.status === 'unchanged',
      ),
    ).toBe(true)
  })

  it('ends with one entry when settings hold both an old and a new one', () => {
    const root = oldApp()
    writeFileSync(
      at(root, HOOK_SETTINGS_PATH),
      JSON.stringify({
        hooks: {
          SessionStart: [
            {hooks: [{type: 'command', command: `sh ${LEGACY_HOOK_SCRIPT_PATH}`}]},
            {hooks: [{type: 'command', command: HOOK_COMMAND}]},
          ],
          UserPromptSubmit: [
            {
              hooks: [
                {type: 'command', command: `sh ${LEGACY_PLAN_HOOK_SCRIPT_PATH}`},
                {type: 'command', command: PLAN_HOOK_COMMAND},
              ],
            },
          ],
        },
      }),
    )
    install(root)
    expect(commandsOf(root, 'SessionStart')).toEqual([HOOK_COMMAND])
    expect(commandsOf(root, 'UserPromptSubmit')).toEqual([PLAN_HOOK_COMMAND])
  })

  it('--check on an old wiring exits 1, writes nothing and names the way out', () => {
    const root = oldApp()
    const before = readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8')
    const installReport = install(root, true)
    expect(installReport.exitCode).toBe(1)
    expect(installReport.text).toContain(LEGACY_HOOK_SCRIPT_PATH)
    expect(installReport.text).toContain('npx -y @greenharness/greenrack-cli@^7 hook install')
    expect(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8')).toBe(before)
    expect(existsSync(at(root, LEGACY_HOOK_SCRIPT_PATH))).toBe(true)
    expect(existsSync(at(root, HOOK_SCRIPT_PATH))).toBe(false)
  })

  it('renames the old notes when the new path is absent, keeps them when it exists', () => {
    const renamed = oldApp()
    writeFileSync(at(renamed, LEGACY_HOOK_NOTES_PATH), 'caveat\n')
    const first = install(renamed)
    expect(first.text.split('\n')).toContain(
      `migrated: ${LEGACY_HOOK_NOTES_PATH} -> ${HOOK_NOTES_PATH}`,
    )
    expect(existsSync(at(renamed, LEGACY_HOOK_NOTES_PATH))).toBe(false)
    expect(readFileSync(at(renamed, HOOK_NOTES_PATH), 'utf8')).toBe('caveat\n')

    const kept = oldApp()
    writeFileSync(at(kept, LEGACY_HOOK_NOTES_PATH), 'old\n')
    writeFileSync(at(kept, HOOK_NOTES_PATH), 'new\n')
    const second = install(kept)
    expect(second.text).toMatch(new RegExp(`^kept: ${LEGACY_HOOK_NOTES_PATH} \\(.+\\)$`, 'm'))
    expect(readFileSync(at(kept, HOOK_NOTES_PATH), 'utf8')).toBe('new\n')
    expect(readFileSync(at(kept, LEGACY_HOOK_NOTES_PATH), 'utf8')).toBe('old\n')
  })

  it('keeps an old script a person edited, and says so', () => {
    const root = oldApp()
    writeFileSync(at(root, LEGACY_HOOK_SCRIPT_PATH), '#!/bin/sh\necho my own catalog\n')
    const installReport = install(root)
    expect(existsSync(at(root, LEGACY_HOOK_SCRIPT_PATH))).toBe(true)
    expect(installReport.text).toContain(`kept: ${LEGACY_HOOK_SCRIPT_PATH} (edited by hand`)
    expect(existsSync(at(root, LEGACY_PLAN_HOOK_SCRIPT_PATH))).toBe(false)
  })

  it('removes the old session cache files', () => {
    const root = oldApp()
    writeFileSync(at(root, LEGACY_HOOK_CACHE_PATH), 'cached')
    writeFileSync(at(root, `${LEGACY_HOOK_CACHE_PATH}.doctor`), 'cached')
    const installReport = install(root)
    expect(existsSync(at(root, LEGACY_HOOK_CACHE_PATH))).toBe(false)
    expect(existsSync(at(root, `${LEGACY_HOOK_CACHE_PATH}.doctor`))).toBe(false)
    expect(installReport.text).toContain(`removed: ${LEGACY_HOOK_CACHE_PATH}`)
  })

  it('names a settings.json whose hooks have the wrong shape, not bad JSON', () => {
    const root = oldApp()
    writeFileSync(at(root, HOOK_SETTINGS_PATH), JSON.stringify({hooks: {SessionStart: {}}}))
    const installReport = install(root)
    expect(installReport.exitCode).toBe(2)
    expect(installReport.text).toContain('"hooks.SessionStart" is not an array')
    expect(installReport.text).not.toContain('not valid JSON')
  })
})

describe('hook install replaces the old .gitignore glob', () => {
  const ignoreOf = (root: string) => readFileSync(at(root, '.gitignore'), 'utf8')

  it('drops the generated comment with the glob and writes the new block where it stood', () => {
    const root = oldApp()
    writeFileSync(
      at(root, '.gitignore'),
      `node_modules\n${LEGACY_GITIGNORE_COMMENT}\n${LEGACY_HOOK_CACHE_IGNORE}\ndist\n`,
    )
    const report = install(root)
    expect(ignoreOf(root)).toBe(`node_modules\n${GITIGNORE_BLOCK}dist\n`)
    expect(report.text.split('\n')).toContain(`removed: ${LEGACY_HOOK_CACHE_IGNORE} (.gitignore)`)
  })

  it('leaves a hand-written comment above the glob alone', () => {
    const root = oldApp()
    writeFileSync(at(root, '.gitignore'), `a\n# mine\n${LEGACY_HOOK_CACHE_IGNORE}\nb\n`)
    install(root)
    expect(ignoreOf(root)).toBe(`a\n# mine\n${GITIGNORE_BLOCK}b\n`)
  })

  it('only removes the glob when the new one is already there', () => {
    const root = oldApp()
    writeFileSync(at(root, '.gitignore'), `${LEGACY_HOOK_CACHE_IGNORE}\n${HOOK_CACHE_IGNORE}\n`)
    install(root)
    expect(ignoreOf(root)).toBe(`${HOOK_CACHE_IGNORE}\n`)
  })

  it("takes the old block's blank separator with it when the new block is already below", () => {
    // The shape `duro hook install` then `greenrack hook install` left: two blocks, a blank between.
    const root = oldApp()
    writeFileSync(
      at(root, '.gitignore'),
      `a\n\n${LEGACY_GITIGNORE_COMMENT}\n${LEGACY_HOOK_CACHE_IGNORE}\n\n${GITIGNORE_BLOCK}`,
    )
    const report = install(root, true)
    expect(report.text).toContain(`drops ${LEGACY_HOOK_CACHE_IGNORE}`)
    install(root)
    expect(ignoreOf(root)).toBe(`a\n\n${GITIGNORE_BLOCK}`)
  })

  it('--check reports .gitignore stale and writes nothing', () => {
    const root = oldApp()
    const before = `${LEGACY_GITIGNORE_COMMENT}\n${LEGACY_HOOK_CACHE_IGNORE}\n`
    writeFileSync(at(root, '.gitignore'), before)
    const report = install(root, true)
    expect(report.exitCode).toBe(1)
    const changes = (report.data as {changes: Array<{path: string; status: string}>}).changes
    expect(changes).toContainEqual(expect.objectContaining({path: '.gitignore', status: 'stale'}))
    expect(ignoreOf(root)).toBe(before)
  })

  it('a .gitignore holding only the new glob is unchanged by a second install', () => {
    const root = oldApp()
    writeFileSync(
      at(root, '.gitignore'),
      `${LEGACY_GITIGNORE_COMMENT}\n${LEGACY_HOOK_CACHE_IGNORE}\n`,
    )
    install(root)
    const first = ignoreOf(root)
    const again = install(root)
    expect(ignoreOf(root)).toBe(first)
    expect(again.text).not.toContain('(.gitignore)')
  })
})
