import {execFileSync, spawnSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vitest'
import type {Registry} from '../src/registry-types.js'

const bin = fileURLToPath(new URL('../dist/bin.js', import.meta.url))
const buildScript = fileURLToPath(new URL('../scripts/build-registry.mjs', import.meta.url))
const registry = JSON.parse(
  readFileSync(new URL('../registry.json', import.meta.url), 'utf8'),
) as Registry

function duro(...args: string[]): string {
  return execFileSync(process.execPath, [bin, ...args], {
    encoding: 'utf8',
    env: {...process.env, NO_COLOR: '1'},
  })
}

describe('Popover in the registry and CLI', () => {
  it('is registered with its props and schemaVersion 1', () => {
    expect(registry.schemaVersion).toBe(1)
    expect(registry.components.Popover).toBeDefined()
    const serialized = JSON.stringify(registry.components.Popover)
    for (const prop of ['anchor', 'side', 'align', 'ignore']) {
      expect(serialized).toContain(`"${prop}"`)
    }
  })

  it('duro Popover prints use / avoid / related sections', () => {
    const out = duro('Popover')
    expect(out).toContain('USE WHEN')
    expect(out).toContain('RELATED')
    // The names must be in DON'T USE WHEN itself: RELATED names them too,
    // so a whole-output match would pass with every avoid line gone.
    const start = out.indexOf("DON'T USE WHEN")
    expect(start).toBeGreaterThan(-1)
    const rest = out.slice(start + "DON'T USE WHEN".length)
    const end = rest.search(/\n[A-Z][A-Z' ]+\n/)
    const avoid = end === -1 ? rest : rest.slice(0, end)
    for (const name of ['Menu', 'Tooltip', 'Dialog', 'DetailPanel', 'Drawer']) {
      expect(avoid).toContain(name)
    }
  })

  it('duro list components has a short Popover row', () => {
    const row = duro('list', 'components')
      .split('\n')
      .find((line) => line.trim().startsWith('Popover'))
    expect(row).toBeDefined()
    expect(row!.trim()).toMatch(
      /^Popover\s+Non-modal anchored overlay for small interactive content/,
    )
    expect(row!.length).toBeLessThanOrEqual(80)
  })

  it('registry and CLAUDE.md are current', () => {
    const result = spawnSync(process.execPath, [buildScript, '--check', '--check-docs'], {
      encoding: 'utf8',
    })
    expect(result.status, result.stdout + result.stderr).toBe(0)
  }, 60_000)
})
