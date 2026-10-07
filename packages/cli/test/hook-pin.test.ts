import {describe, expect, it, vi} from 'vitest'
import {spawnSync} from 'node:child_process'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  utimesSync,
  writeFileSync,
} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {
  HOOK_CACHE_PATH,
  HOOK_MIN_CLI,
  HOOK_PIN_LINE,
  HOOK_SCRIPT,
  HOOK_SCRIPT_PATH,
} from '../src/hook-script.js'
import {SKILL_MIN_CLI} from '../src/skill-template.js'
// @ts-expect-error — a plain .mjs release script, no types
import {pinMajorProblems} from '../scripts/check-pin-major.mjs'

// Every test here starts real processes: sh or dash, then the hook's own
// rm/find/sort/cksum/cat and a stub npx, about ten spawns per run. Measured
// 2026-10-07 at a load average near 95: 1.3-2.2s per test alone, and past
// vitest's 5s default once the push gate runs the whole unit suite in
// parallel. Nothing waits; spawning is slow on a busy machine. The budget
// fits the work instead of failing the gate on load.
vi.setConfig({testTimeout: 30_000})

const src = (f: string) =>
  readFileSync(fileURLToPath(new URL(`../src/${f}`, import.meta.url)), 'utf8')

describe('the CLI floors', () => {
  it('share one major, the hook and the skill', () => {
    expect(HOOK_MIN_CLI.split('.')[0]).toBe(SKILL_MIN_CLI.split('.')[0])
  })

  it('pass the release check for their own major, and fail it for another', () => {
    const hook = src('hook-script.ts')
    const skill = src('skill-template.ts')
    const major = Number(HOOK_MIN_CLI.split('.')[0])
    expect(pinMajorProblems(`${major}.0.0`, hook, skill)).toEqual([])
    expect(pinMajorProblems(`v${major}.9.1`, hook, skill)).toEqual([])
    expect(pinMajorProblems(`${major + 1}.0.0`, hook, skill)).toHaveLength(2)
    // The drift that kept 4.x consumers on 3.x: a floor left a major behind.
    const old = hook.replace(
      `HOOK_MIN_CLI = '${HOOK_MIN_CLI}'`,
      `HOOK_MIN_CLI = '${major - 1}.4.0'`,
    )
    expect(pinMajorProblems(`${major}.0.0`, old, skill)).toEqual([
      expect.stringContaining(`HOOK_MIN_CLI is ^${major - 1}.x`),
    ])
  })

  it('exits non-zero from the command line on a mismatch', () => {
    const script = fileURLToPath(new URL('../scripts/check-pin-major.mjs', import.meta.url))
    const next = `${Number(HOOK_MIN_CLI.split('.')[0]) + 1}.0.0`
    expect(spawnSync('node', [script, next]).status).toBe(1)
    expect(spawnSync('node', [script, HOOK_MIN_CLI]).status).toBe(0)
  })
})

/** POSIX sh, and dash when present: consumers run the hook with whatever /bin/sh is. */
const SHELLS = ['sh', ...(existsSync('/bin/dash') ? ['dash'] : [])]

/** A repo with the generated hook and a fake npx that prints `catalog`, nothing, or fails. */
function repo(npx: {catalog: string} | 'fails' | 'empty' | 'no-newline', shell: string) {
  const dir = mkdtempSync(join(tmpdir(), 'duro-hook-'))
  mkdirSync(join(dir, '.claude/hooks'), {recursive: true})
  writeFileSync(join(dir, HOOK_SCRIPT_PATH), HOOK_SCRIPT)
  const bin = join(dir, 'bin')
  mkdirSync(bin)
  const body =
    npx === 'fails'
      ? 'exit 1'
      : npx === 'empty'
        ? 'exit 0'
        : npx === 'no-newline'
          ? `case "$*" in *session-start*) printf 'ONE LINE' ;; *) : ;; esac`
          : `case "$*" in *session-start*) printf '%s\\n' ${npx.catalog
              .split('\n')
              .map((l) => `'${l}'`)
              .join(' ')} ;; *) : ;; esac`
  writeFileSync(join(bin, 'npx'), `#!/bin/sh\n${body}\n`)
  chmodSync(join(bin, 'npx'), 0o755)
  const run = () =>
    spawnSync(shell, [HOOK_SCRIPT_PATH], {
      cwd: dir,
      env: {...process.env, PATH: `${bin}:${process.env['PATH']}`},
      encoding: 'utf8',
    })
  return {dir, cache: join(dir, HOOK_CACHE_PATH), run}
}

/** A cache written by a 3.x hook: no pin line, newer than the script. */
function oldCache(cache: string) {
  writeFileSync(cache, 'OLD CATALOG\nold second line\n')
  const later = new Date(Date.now() + 60_000)
  utimesSync(cache, later, later)
}

describe.each(SHELLS)('the session hook cache, under %s', (shell) => {
  it('replaces a 3.x cache with the current catalog, and never prints the pin', () => {
    const r = repo({catalog: 'CATALOG 4.4\nsecond line'}, shell)
    oldCache(r.cache)
    const out = r.run()
    expect(out.stdout.split('\n')[0]).toBe('CATALOG 4.4')
    expect(out.stdout).not.toContain('#duro-hook-pin')
    expect(readFileSync(r.cache, 'utf8').split('\n')[0]).toBe(HOOK_PIN_LINE)
  })

  it('keeps the old cache, untouched, when the refresh fails, and says why', () => {
    const r = repo('fails', shell)
    oldCache(r.cache)
    const before = readFileSync(r.cache, 'utf8')
    const out = r.run()
    expect(readFileSync(r.cache, 'utf8')).toBe(before)
    expect(existsSync(`${r.cache}.tmp`)).toBe(false)
    // Printed whole: no catalog line lost to the pin skip.
    expect(out.stdout.startsWith('OLD CATALOG\nold second line')).toBe(true)
    expect(out.stderr).toContain(`npx -y @duro-app/cli@^${HOOK_MIN_CLI} hook install`)
  })

  it('leaves no pin-only cache when the first fetch fails', () => {
    const r = repo('fails', shell)
    r.run()
    expect(existsSync(r.cache)).toBe(false)
    expect(existsSync(`${r.cache}.tmp`)).toBe(false)
  })

  it('keeps no pin-only cache when npx succeeds but prints nothing', () => {
    const r = repo('empty', shell)
    r.run()
    expect(existsSync(r.cache)).toBe(false)
    expect(existsSync(`${r.cache}.tmp`)).toBe(false)
  })

  it('keeps a one-line catalog that ends without a newline', () => {
    const r = repo('no-newline', shell)
    const out = r.run()
    expect(out.stdout.startsWith('ONE LINE')).toBe(true)
    expect(readFileSync(r.cache, 'utf8').split('\n')[0]).toBe(HOOK_PIN_LINE)
  })

  it('does not refetch a current cache', () => {
    const r = repo({catalog: 'CATALOG 4.4'}, shell)
    r.run()
    writeFileSync(join(r.dir, 'bin/npx'), '#!/bin/sh\nexit 1\n')
    const out = r.run()
    expect(out.stdout.split('\n')[0]).toBe('CATALOG 4.4')
    expect(out.stderr).toBe('')
  })
})
