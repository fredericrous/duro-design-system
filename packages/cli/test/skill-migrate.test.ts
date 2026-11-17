import {existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'
import {runSkill} from '../src/commands/skill.js'
import {
  LEGACY_SKILL_DIR,
  LEGACY_SKILL_GENERATED_MARKER,
  LEGACY_SKILL_NOTES_PATH,
} from '../src/legacy-names.js'
import {SKILL_NOTES_PATH, SKILL_PATH} from '../src/skill-template.js'

const noteLines = /^(migrated|removed|kept):/m
const generated = `# duro-mockup\n\n${LEGACY_SKILL_GENERATED_MARKER} — do not hand-edit.\n`

function repo(skillMd: string | null = generated): string {
  const root = mkdtempSync(join(tmpdir(), 'skill-migrate-'))
  mkdirSync(join(root, LEGACY_SKILL_DIR), {recursive: true})
  if (skillMd !== null) writeFileSync(join(root, LEGACY_SKILL_DIR, 'SKILL.md'), skillMd)
  return root
}

describe('skill install migrates the old duro-mockup skill', () => {
  it('removes a generated skill and its empty directory', () => {
    const root = repo()
    const result = runSkill('install', {cwd: root})
    expect(result.exitCode ?? 0).toBe(0)
    expect(result.text.split('\n')).toContain(`removed: ${LEGACY_SKILL_DIR}/SKILL.md`)
    expect(existsSync(join(root, LEGACY_SKILL_DIR))).toBe(false)
    expect(existsSync(join(root, SKILL_PATH))).toBe(true)
  })

  it('keeps a hand-written SKILL.md', () => {
    const root = repo('my own skill\n')
    const result = runSkill('install', {cwd: root})
    expect(result.text).toMatch(
      new RegExp(`^kept: ${LEGACY_SKILL_DIR} \\(.*rm -r ${LEGACY_SKILL_DIR}\\)$`, 'm'),
    )
    expect(existsSync(join(root, LEGACY_SKILL_DIR, 'SKILL.md'))).toBe(true)
  })

  it('keeps a directory that holds another file', () => {
    const root = repo()
    writeFileSync(join(root, LEGACY_SKILL_DIR, 'extra.md'), 'x')
    const result = runSkill('install', {cwd: root})
    expect(result.text).toContain(`rm -r ${LEGACY_SKILL_DIR}`)
    expect(result.text).toMatch(/^kept: /m)
    expect(existsSync(join(root, LEGACY_SKILL_DIR, 'SKILL.md'))).toBe(true)
  })

  it('--check exits 1 and writes nothing; plain install exits 0', () => {
    const root = repo('my own skill\n')
    const check = runSkill('install', {cwd: root, check: true})
    expect(check.exitCode).toBe(1)
    expect(existsSync(join(root, SKILL_PATH))).toBe(false)
    expect(runSkill('install', {cwd: root}).exitCode ?? 0).toBe(0)
  })

  it('renames the old notes when the new path is absent, keeps them when it exists', () => {
    const root = repo(null)
    writeFileSync(join(root, LEGACY_SKILL_NOTES_PATH), 'notes\n')
    const first = runSkill('install', {cwd: root})
    expect(first.text.split('\n')).toContain(
      `migrated: ${LEGACY_SKILL_NOTES_PATH} -> ${SKILL_NOTES_PATH}`,
    )
    expect(readFileSync(join(root, SKILL_NOTES_PATH), 'utf8')).toBe('notes\n')
    expect(existsSync(join(root, LEGACY_SKILL_NOTES_PATH))).toBe(false)

    writeFileSync(join(root, LEGACY_SKILL_NOTES_PATH), 'older\n')
    const second = runSkill('install', {cwd: root})
    expect(second.text).toMatch(new RegExp(`^kept: ${LEGACY_SKILL_NOTES_PATH} \\(.+\\)$`, 'm'))
    expect(readFileSync(join(root, SKILL_NOTES_PATH), 'utf8')).toBe('notes\n')
  })

  it('prints no migration line on a second run', () => {
    const root = repo()
    writeFileSync(join(root, LEGACY_SKILL_NOTES_PATH), 'notes\n')
    runSkill('install', {cwd: root})
    expect(runSkill('install', {cwd: root}).text).not.toMatch(noteLines)
  })
})
