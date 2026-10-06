#!/usr/bin/env node
// Packed-artifact smoke test (plan 2026-10-06-every-measure-is-a-token,
// Verification 10). Source-level rendering cannot see packaging faults — an
// import of the TypeScript-only `/keys` entry, a missing `/raw` export, types
// pointing at source — so this installs the PACKED tarballs into a scratch
// directory and renders there in plain Node: no workspace aliases, no
// TypeScript loader.
//
//   node packages/ui-email/scripts/smoke-packed.mjs [--keep]
//
// Checks, each fatal:
//   1. the packed tokens manifest has exports['./raw'].types = ./dist/raw.d.ts,
//      and the tarball holds dist/raw.d.ts;
//   2. the primitive fixture renders from the tarballs in bare Node, and its
//      HTML equals the same fixture rendered against the workspace build;
//   3. a consumer import of both packages type-checks with skipLibCheck: false,
//      under bundler and nodenext resolution.

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
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const uiEmail = dirname(here)
const dsRoot = dirname(dirname(uiEmail))
const keep = process.argv.includes('--keep')
const run = (cmd, argv, cwd, capture = false) =>
  execFileSync(cmd, argv, {
    cwd,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  })

const work = mkdtempSync(join(tmpdir(), 'email-smoke-'))
const failures = []
const check = (ok, message) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${message}`)
  if (!ok) failures.push(message)
}

const RENDER = `import {writeFileSync} from 'node:fs'
import {render} from '@react-email/components'
import {fixtures} from './primitives.mjs'
const out = process.argv[2]
const result = {}
for (const [name, make] of Object.entries(fixtures)) result[name] = await render(make())
writeFileSync(out, JSON.stringify(result))
`

try {
  for (const pkg of ['@duro-app/tokens', '@duro-app/ui-email'])
    run('pnpm', ['--filter', pkg, 'run', 'build'], dsRoot)
  const tgz = join(work, 'tgz')
  mkdirSync(tgz)
  for (const pkg of ['@duro-app/tokens', '@duro-app/ui-email']) {
    run('pnpm', ['--filter', pkg, 'pack', '--pack-destination', tgz], dsRoot)
  }
  const tarballs = readdirSync(tgz).map((f) => join(tgz, f))
  const tokensTgz = tarballs.find((f) => /duro-app-tokens-/.test(f))

  // 1. The published /raw types.
  const manifest = JSON.parse(run('tar', ['-xOzf', tokensTgz, 'package/package.json'], work, true))
  check(
    manifest.exports['./raw'].types === './dist/raw.d.ts',
    `packed exports['./raw'].types = ${manifest.exports['./raw'].types}`,
  )
  const listing = run('tar', ['-tzf', tokensTgz], work, true)
  check(listing.split('\n').includes('package/dist/raw.d.ts'), 'tarball contains dist/raw.d.ts')

  // 2. Render from the tarballs in bare Node.
  const app = join(work, 'app')
  mkdirSync(app)
  const wsPkg = (name) =>
    JSON.parse(readFileSync(join(uiEmail, 'node_modules', name, 'package.json'), 'utf8')).version
  writeFileSync(
    join(app, 'package.json'),
    JSON.stringify({name: 'email-smoke', private: true, type: 'module'}),
  )
  run(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--loglevel=error',
      ...tarballs,
      `react@${wsPkg('react')}`,
      `react-dom@${wsPkg('react')}`,
      `@types/react@${wsPkg('@types/react')}`,
      'typescript@5',
    ],
    app,
  )
  copyFileSync(join(here, 'fixtures', 'primitives.mjs'), join(app, 'primitives.mjs'))
  writeFileSync(join(app, 'render.mjs'), RENDER)
  run('node', ['render.mjs', join(work, 'packed.json')], app)

  // The same fixture against the workspace build: a directory inside the
  // ui-email package resolves `@duro-app/ui-email` by package self-reference.
  const local = join(uiEmail, '.smoke-workspace')
  mkdirSync(local, {recursive: true})
  try {
    copyFileSync(join(here, 'fixtures', 'primitives.mjs'), join(local, 'primitives.mjs'))
    writeFileSync(join(local, 'render.mjs'), RENDER)
    run('node', ['render.mjs', join(work, 'workspace.json')], local)
  } finally {
    rmSync(local, {recursive: true, force: true})
  }
  const packed = JSON.parse(readFileSync(join(work, 'packed.json'), 'utf8'))
  const workspace = JSON.parse(readFileSync(join(work, 'workspace.json'), 'utf8'))
  for (const name of Object.keys(workspace)) {
    check(
      packed[name] === workspace[name],
      `fixture ${name}: packed render equals workspace render (${workspace[name].length} bytes)`,
    )
  }

  // 3. Consumer types with skipLibCheck: false.
  writeFileSync(
    join(app, 'check.ts'),
    `import {BORDERS_PX, EMAIL_PX, FONT_SIZE_REM, RADII_PX, SPACING_PX, darkColors} from '@duro-app/tokens/raw'
import {EmailShell, Text, space, font} from '@duro-app/ui-email'
const width: number = EMAIL_PX.emailCardW + BORDERS_PX.hairline + SPACING_PX.md + RADII_PX.sm + FONT_SIZE_REM.fontSizeMd
const sizes: string[] = [space.md, font.sizeSm, darkColors.bg]
export {EmailShell, Text, width, sizes}
`,
  )
  // Both resolutions a consumer uses: a bundler app, and a Node ESM package
  // (nodenext requires explicit extensions in every relative import of our
  // published .d.ts).
  for (const [module, moduleResolution] of [
    ['esnext', 'bundler'],
    ['nodenext', 'nodenext'],
  ]) {
    writeFileSync(
      join(app, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          strict: true,
          noEmit: true,
          skipLibCheck: false,
          module,
          moduleResolution,
          target: 'es2022',
          jsx: 'react-jsx',
        },
        files: ['check.ts'],
      }),
    )
    // skipLibCheck: false checks every .d.ts in the tree; only errors in our
    // packages or the consumer file count — a third-party declaration with a
    // missing @types peer is not this release's to fix.
    let output = ''
    let exited = 0
    try {
      output = run(join(app, 'node_modules', '.bin', 'tsc'), ['-p', 'tsconfig.json'], app, true)
    } catch (error) {
      // A spawn failure has no status; it must fail the check, not read as clean.
      if (typeof error.status !== 'number') throw new Error(`tsc did not run: ${error.message}`)
      exited = error.status
      output = String(error.stdout ?? '')
    }
    const lines = output.split('\n').filter((line) => /error TS\d+/.test(line))
    const ours = lines.filter((line) => /^(check\.ts|node_modules\/@duro-app\/)/.test(line))
    // Anything not attributed to a third-party file (a TS5xxx config error,
    // a global error with no path) counts as ours.
    const thirdParty = lines.filter((line) => /^node_modules\//.test(line) && !ours.includes(line))
    const unattributed = lines.filter((line) => !ours.includes(line) && !thirdParty.includes(line))
    for (const line of [...ours, ...unattributed]) console.error(`  ${line}`)
    const failed =
      ours.length + unattributed.length > 0 || (exited !== 0 && thirdParty.length === 0)
    check(
      !failed,
      `consumer import type-checks with skipLibCheck: false (${moduleResolution}; ${ours.length + unattributed.length} error(s) in @duro-app, check.ts or config; tsc exit ${exited}, ${thirdParty.length} third-party)`,
    )
  }
} catch (error) {
  failures.push(error.message)
  console.error(`smoke error: ${error.message}`)
} finally {
  if (!keep) rmSync(work, {recursive: true, force: true})
  else console.log(`kept ${work}`)
}
console.log(
  failures.length
    ? `FAIL: ${failures.length} check(s)`
    : 'PASS: packed artifacts render and type-check',
)
process.exit(failures.length ? 1 : 0)
