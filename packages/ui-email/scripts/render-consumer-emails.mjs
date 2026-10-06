#!/usr/bin/env node
// Email equality harness (plan 2026-10-06-every-measure-is-a-token, Verification 9).
//
// Renders a consumer's real email templates twice — against @duro-app/tokens and
// @duro-app/ui-email packed from a BASELINE duro-design-system SHA, then from a
// CANDIDATE SHA — and fails on any HTML difference, Outlook conditionals and the
// dark-mode <style> block included. Mail clients see the HTML, so only the HTML
// can prove a release left email output alone; Storybook cannot.
//
//   node packages/ui-email/scripts/render-consumer-emails.mjs \
//     --consumer <consumer checkout> --variants <manifest.json> \
//     --base <duro-design-system SHA> --candidate <SHA> \
//     [--consumer-ref <SHA, default HEAD>] [--out <dir>] [--keep]
//
// Each side gets fresh git worktrees of both repositories, so neither checkout
// is touched. Inputs are frozen by construction: the consumer's lockfile (npm
// ci), its own locale files and the fixed props in the manifest. Only the two
// @duro-app tarballs change between sides, which the lockfile check asserts.

import {execFileSync} from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import {tmpdir} from 'node:os'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const PACKAGES = ['@duro-app/tokens', '@duro-app/ui-email']
const USAGE = `usage: node packages/ui-email/scripts/render-consumer-emails.mjs \\
  --consumer <checkout> --variants <manifest.json> --base <SHA> --candidate <SHA> \\
  [--consumer-ref <SHA>] [--out <dir>] [--keep]`

function parseArgs(argv) {
  const args = {keep: false}
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i]
    if (flag === '--keep') args.keep = true
    else if (flag.startsWith('--')) args[flag.slice(2)] = argv[++i]
  }
  for (const required of ['consumer', 'variants', 'base', 'candidate']) {
    if (!args[required]) {
      console.error(`missing --${required}\n\n${USAGE}`)
      process.exit(2)
    }
  }
  return args
}

const run = (cmd, argv, cwd, opts = {}) =>
  execFileSync(cmd, argv, {
    cwd,
    stdio: opts.capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    encoding: 'utf8',
    env: {...process.env, ...opts.env},
  })
const git = (cwd, ...argv) => run('git', argv, cwd, {capture: true}).trim()

const args = parseArgs(process.argv.slice(2))
const dsRoot = git(here, 'rev-parse', '--show-toplevel')
const consumer = resolve(args.consumer)
const variants = resolve(args.variants)
const consumerSha = git(consumer, 'rev-parse', args['consumer-ref'] ?? 'HEAD')
const sides = {
  baseline: git(dsRoot, 'rev-parse', args.base),
  candidate: git(dsRoot, 'rev-parse', args.candidate),
}
const work = mkdtempSync(join(tmpdir(), 'email-harness-'))
const outRoot = resolve(args.out ?? join(work, 'out'))
const worktrees = []

function addWorktree(repo, sha, path) {
  git(repo, 'worktree', 'add', '--detach', path, sha)
  worktrees.push({repo, path})
}

/** Pack @duro-app/tokens and @duro-app/ui-email from a duro-design-system SHA. */
function packDesignSystem(side, sha) {
  const ds = join(work, `ds-${side}`)
  addWorktree(dsRoot, sha, ds)
  run('pnpm', ['install', '--frozen-lockfile', '--silent'], ds)
  const tgz = join(work, `tgz-${side}`)
  mkdirSync(tgz, {recursive: true})
  for (const pkg of PACKAGES) {
    const dir = join(ds, 'packages', pkg.split('/')[1])
    // One version for both so ui-email's rewritten `workspace:^` range resolves
    // to the tarball installed beside it, as a release (one tag) would.
    run('npm', ['pkg', 'set', 'version=0.0.0-email-harness'], dir)
  }
  for (const pkg of PACKAGES) run('pnpm', ['--filter', pkg, 'run', 'build'], ds)
  for (const pkg of PACKAGES) run('pnpm', ['--filter', pkg, 'pack', '--pack-destination', tgz], ds)
  return readdirSync(tgz).map((f) => join(tgz, f))
}

/** Assert the install changed only the two @duro-app entries of the lockfile. */
function checkLockfile(app, before) {
  const after = JSON.parse(readFileSync(join(app, 'package-lock.json'), 'utf8')).packages
  const changed = new Set(
    [...Object.keys(before), ...Object.keys(after)].filter(
      (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]),
    ),
  )
  changed.delete('') // the root entry lists the two tarballs as dependencies
  const allowed = new Set(PACKAGES.map((p) => `node_modules/${p}`))
  const stray = [...changed].filter((key) => !allowed.has(key))
  if (stray.length)
    throw new Error(`lockfile changed beyond ${PACKAGES.join(', ')}: ${stray.join(', ')}`)
}

function renderSide(side, tarballs) {
  const app = join(work, `app-${side}`)
  addWorktree(consumer, consumerSha, app)
  run('npm', ['ci', '--no-audit', '--no-fund', '--loglevel=error'], app)
  const before = JSON.parse(readFileSync(join(app, 'package-lock.json'), 'utf8')).packages
  run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error', ...tarballs], app)
  checkLockfile(app, before)
  const harness = join(app, '.email-harness')
  mkdirSync(harness, {recursive: true})
  copyFileSync(join(here, 'render-entry.tsx'), join(harness, 'render-entry.tsx'))
  copyFileSync(join(here, 'fixtures', 'primitives.mjs'), join(harness, 'primitives.mjs'))
  const out = join(outRoot, side)
  run('npx', ['--no-install', 'tsx', join(harness, 'render-entry.tsx'), variants, out], app)
  const lock = JSON.parse(readFileSync(join(app, 'package-lock.json'), 'utf8')).packages
  const version = (name) => lock[`node_modules/${name}`]?.version ?? null
  return {
    out,
    versions: Object.fromEntries(
      [
        'react',
        'react-dom',
        '@react-email/render',
        '@react-email/components',
        'i18next',
        'react-i18next',
        'tsx',
      ].map((n) => [n, version(n)]),
    ),
  }
}

let failed = false
const report = {consumer, consumerSha, designSystem: sides, variants, files: {}}
try {
  const rendered = {}
  for (const [side, sha] of Object.entries(sides))
    rendered[side] = renderSide(side, packDesignSystem(side, sha))
  report.versions = rendered.baseline.versions
  if (JSON.stringify(rendered.baseline.versions) !== JSON.stringify(rendered.candidate.versions)) {
    throw new Error(`frozen versions differ between sides: ${JSON.stringify(rendered)}`)
  }
  const names = readdirSync(rendered.baseline.out).sort()
  const other = readdirSync(rendered.candidate.out).sort()
  if (JSON.stringify(names) !== JSON.stringify(other))
    throw new Error(`rendered file sets differ: ${names} vs ${other}`)
  for (const name of names) {
    const a = readFileSync(join(rendered.baseline.out, name), 'utf8')
    const b = readFileSync(join(rendered.candidate.out, name), 'utf8')
    const same = a === b
    report.files[name] = {bytes: a.length, identical: same}
    console.log(`${same ? 'identical' : 'DIFFERENT'}  ${name}  (${a.length} bytes)`)
    if (!same) failed = true
  }
  writeFileSync(join(outRoot, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(`\nreport: ${join(outRoot, 'report.json')}`)
  console.log(failed ? 'FAIL: email HTML differs' : `PASS: ${names.length} renders byte-identical`)
} catch (error) {
  failed = true
  console.error(`harness error: ${error.message}`)
} finally {
  for (const {repo, path} of worktrees.reverse()) {
    try {
      git(repo, 'worktree', 'remove', '--force', path)
    } catch {
      console.error(`could not remove worktree ${path}`)
    }
  }
  if (!args.keep && !args.out) rmSync(work, {recursive: true, force: true})
}
process.exit(failed ? 1 : 0)
