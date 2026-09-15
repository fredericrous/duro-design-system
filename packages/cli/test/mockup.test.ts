import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {loadRegistry} from '../src/registry.js'
import {
  checkArtboard,
  runMockup,
  runMockupCheck,
  runMockupSeed,
  seedArtboard,
  TOKENS_END,
  TOKENS_START,
} from '../src/commands/mockup.js'

const registry = loadRegistry()

const rules = (html: string) => checkArtboard(registry, 'A.dc.html', html).map((f) => f.rule)

/** A minimal token-clean artboard with one named control. */
const clean = `<style>
${TOKENS_START}
:root { --duro-color-bg: #0f0f0f; --duro-spacing-md: 16px; }
${TOKENS_END}
body { background: var(--duro-color-bg); padding: var(--duro-spacing-md); }
.btn { padding: var(--duro-spacing-sm) var(--duro-spacing-md); border-radius: var(--duro-radius-sm); background: var(--duro-color-accent); cursor: pointer; }
@media (min-width: 768px) { .row { gap: var(--duro-spacing-md); } }
</style>
<div class="artboard" style="width: 1120px; height: 840px">
  <div class="btn" data-duro="Button variant=primary">Save</div>
</div>`

describe('seedArtboard', () => {
  it('is the design canvas contract with the token block first in the style', () => {
    const html = seedArtboard(registry, 'Main', 'dark')
    expect(html).toContain('<script src="./support.js"></script>')
    expect(html).toContain('<x-dc>')
    expect(html).toContain('<helmet>')
    expect(html.indexOf(TOKENS_START)).toBeLessThan(html.indexOf('body {'))
    expect(html).toContain('--duro-color-bg: #0f0f0f;')
    expect(html).toContain(':root[data-theme="light"]')
    expect(html).not.toContain('data-theme="dark"')
  })

  it('stamps the theme on <html> so the resolved block switches', () => {
    expect(seedArtboard(registry, 'Main', 'light')).toContain('<html data-theme="light">')
  })

  it('is byte-stable', () => {
    expect(seedArtboard(registry, 'Main', 'dark')).toBe(seedArtboard(registry, 'Main', 'dark'))
  })

  it('checks clean except for the component map it does not have yet', () => {
    expect(rules(seedArtboard(registry, 'Main', 'dark'))).toEqual(['no-component-map'])
  })
})

describe('checkArtboard', () => {
  it('accepts a token-only artboard that names its control', () => {
    expect(checkArtboard(registry, 'A.dc.html', clean)).toEqual([])
  })

  it('never scans the token block itself', () => {
    // The block is nothing but hex and px; masking it is what makes the seed clean.
    expect(rules(clean)).not.toContain('raw-color')
  })

  it('reports a raw colour on any property, in a rule or inline', () => {
    expect(rules(clean.replace('cursor: pointer', 'border: 1px solid #333'))).toContain('raw-color')
    expect(
      rules(clean.replace('style="width: 1120px', 'style="color: rgba(0,0,0,.5); width: 1120px')),
    ).toContain('raw-color')
  })

  it('reports raw design lengths but not geometry', () => {
    // width/height on the artboard root are geometry — not a finding.
    expect(rules(clean)).not.toContain('raw-length')
    for (const [from, to] of [
      ['padding: var(--duro-spacing-md)', 'padding: 23px'],
      ['border-radius: var(--duro-radius-sm)', 'border-radius: 6px'],
      ['cursor: pointer', 'font-size: 14px'],
      ['cursor: pointer', 'font-weight: 600'],
      ['cursor: pointer', 'box-shadow: 0 1px 2px var(--duro-color-border)'],
      ['cursor: pointer', 'transition: opacity 150ms'],
    ]) {
      const found = checkArtboard(registry, 'A.dc.html', clean.replace(from, to))
      expect(
        found.map((f) => f.rule),
        `${to} should be a raw-length`,
      ).toContain('raw-length')
      expect(found[0]?.message).toContain('var(--duro-')
    }
    expect(rules(clean.replace('cursor: pointer', 'margin: 0'))).not.toContain('raw-length')
  })

  it('accepts a media query on the breakpoint scale and refuses one off it', () => {
    expect(rules(clean)).not.toContain('raw-breakpoint')
    const off = checkArtboard(registry, 'A.dc.html', clean.replace('768px', '800px'))
    expect(off.map((f) => f.rule)).toContain('raw-breakpoint')
    expect(off.find((f) => f.rule === 'raw-breakpoint')?.message).toContain('480 / 640 / 768')
  })

  it('validates data-duro names and parts against the registry, with suggestions', () => {
    const unknown = checkArtboard(
      registry,
      'A.dc.html',
      clean.replace('Button variant=primary', 'Buton'),
    )
    const finding = unknown.find((f) => f.rule === 'unknown-component')
    expect(finding?.message).toContain('unknown component "Buton"')
    expect(finding?.message).toContain('Button')
    expect(rules(clean.replace('Button variant=primary', 'Tabs.Tab'))).toEqual([])
    expect(rules(clean.replace('Button variant=primary', 'Tabs.Knob'))).toContain(
      'unknown-component',
    )
    expect(rules(clean.replace('Button variant=primary', 'login-form'))).toEqual([])
  })

  it('fails an artboard with no component map at all', () => {
    expect(rules(clean.replace(' data-duro="Button variant=primary"', ''))).toEqual([
      'no-component-map',
      'unannotated-control',
    ])
  })

  it('names a control by its class signature, not its tag', () => {
    // A canvas artboard draws controls as divs and spans: the union of every
    // rule that mentions the class decides. A hover state alone is enough.
    const html = `<style>
.row { padding: var(--duro-spacing-sm); border-radius: var(--duro-radius-sm); }
.row.on { background: var(--duro-color-bg-card); }
.tab:hover { color: var(--duro-color-text); }
.label { color: var(--duro-color-text-muted); }
</style>
<div data-duro="List">
  <div class="row on">one</div>
  <span class="tab">two</span>
  <span class="label">three</span>
</div>`
    const found = checkArtboard(registry, 'A.dc.html', html)
    expect(found.map((f) => `${f.line}:${f.rule}`)).toEqual([
      '8:unannotated-control',
      '9:unannotated-control',
    ])
    expect(found[0]?.message).toContain('class="row on"')
  })

  it('lets a parent annotation cover a nested control', () => {
    const html = `<div class="tag" data-duro="Tag"><button class="x">×</button></div>`
    expect(rules(html)).toEqual([])
    expect(rules(`<div data-duro="Stack"><div><button>deep</button></div></div>`)).toEqual([
      'unannotated-control',
    ])
  })

  it('reports native controls without a name, and ignores markup in comments', () => {
    expect(
      rules(`<!-- <button>not real</button> --><a href="#" data-duro="LinkButton">go</a>`),
    ).toEqual([])
    expect(rules(`<input type="text"><div data-duro="Stack"></div>`)).toEqual([
      'unannotated-control',
    ])
  })

  it('sorts findings by line and carries the file name', () => {
    const found = checkArtboard(
      registry,
      'Deep/Main.dc.html',
      `<style>\n.a{color:#fff}\n.b{gap:3px}\n</style>`,
    )
    expect(found.map((f) => [f.file, f.line, f.rule])).toEqual([
      ['Deep/Main.dc.html', 1, 'no-component-map'],
      ['Deep/Main.dc.html', 2, 'raw-color'],
      ['Deep/Main.dc.html', 3, 'raw-length'],
    ])
  })
})

describe('runMockup seed + check on disk', () => {
  let root: string
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'duro-mockup-'))
  })
  afterEach(() => {
    rmSync(root, {recursive: true, force: true})
  })

  it('seeds docs/mockups/<name>/<Name>.dc.html by default and refuses to overwrite', () => {
    const first = runMockupSeed(registry, {cwd: root, name: 'Approvals'})
    expect(first.exitCode).toBeUndefined()
    const path = join(root, 'docs', 'mockups', 'approvals', 'Approvals.dc.html')
    expect(readFileSync(path, 'utf8')).toBe(seedArtboard(registry, 'Approvals', 'dark'))
    expect(first.data).toMatchObject({ok: true, path: 'docs/mockups/approvals/Approvals.dc.html'})

    const again = runMockupSeed(registry, {cwd: root, name: 'Approvals'})
    expect(again.exitCode).toBe(1)
    expect(again.text).toContain('exists')
  })

  it('honours --out and --theme, and rejects a bad theme or name', () => {
    runMockupSeed(registry, {cwd: root, out: 'art', theme: 'light'})
    expect(readFileSync(join(root, 'art', 'Main.dc.html'), 'utf8')).toContain('data-theme="light"')
    expect(runMockupSeed(registry, {cwd: root, theme: 'sepia'}).exitCode).toBe(2)
    expect(runMockupSeed(registry, {cwd: root, name: '../x'}).exitCode).toBe(2)
  })

  it('check reads several files, exits 1 with file:line lines, 2 on a missing file', () => {
    writeFileSync(join(root, 'Good.dc.html'), clean)
    writeFileSync(join(root, 'Bad.dc.html'), clean.replace('cursor: pointer', 'color: #fff'))
    const ok = runMockupCheck(registry, ['Good.dc.html'], {cwd: root})
    expect(ok.exitCode).toBeUndefined()
    expect(ok.data).toMatchObject({ok: true, findings: []})

    const bad = runMockupCheck(registry, ['Good.dc.html', 'Bad.dc.html'], {cwd: root})
    expect(bad.exitCode).toBe(1)
    expect(bad.text).toMatch(/^duro mockup check: 1 finding\(s\)\nBad\.dc\.html:\d+ raw-color: /)

    expect(runMockupCheck(registry, ['Nope.dc.html'], {cwd: root}).exitCode).toBe(2)
    expect(runMockupCheck(registry, [], {cwd: root}).exitCode).toBe(2)
  })

  it('dispatches subcommands and refuses an unknown one', () => {
    expect(runMockup(registry, 'nope', [], {cwd: root}).exitCode).toBe(2)
    expect(runMockup(registry, 'seed', ['extra'], {cwd: root}).exitCode).toBe(2)
    expect(runMockup(registry, 'seed', [], {cwd: root, out: 'x'}).exitCode).toBeUndefined()
  })
})
