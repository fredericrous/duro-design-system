import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {loadRegistry} from '../src/registry.js'
import {
  ARTBOARD_HEIGHT,
  ARTBOARD_WIDTH,
  buildCanvas,
  checkArtboard,
  MOCKUP_SUBCOMMANDS,
  runMockup,
  runMockupCanvas,
  runMockupCheck,
  runMockupSeed,
  seedArtboard,
  TOKENS_END,
  TOKENS_START,
  tokenVariableName,
} from '../src/commands/mockup.js'
import {GROUP_KEYS, THEMABLE_GROUPS, type ThemableGroup} from '@duro-app/tokens/theme'

const fixture = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../../tokens/test/fixtures/theme-tokens.json', import.meta.url)),
    'utf8',
  ),
) as {
  valid: {group: string; key: string; value: string}[]
  invalid: {group: string; key: string; value: string; reason: string}[]
}
const registry = loadRegistry()
const bin = fileURLToPath(new URL('../dist/bin.js', import.meta.url))

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
<div class="artboard" style="width: var(--duro-mockup-canvas-width); height: var(--duro-mockup-canvas-height)">
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
    expect(rules(clean.replace('style="width:', 'style="color: rgba(0,0,0,.5); width:'))).toContain(
      'raw-color',
    )
  })

  it('reports raw design lengths but not geometry', () => {
    // the root's canvas size comes through the seed's variables — not a finding.
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

  it('reports raw sizes and border widths, not positions or the canvas (ADR-0027)', () => {
    // The root reads the canvas size through the seed's variables.
    expect(rules(clean)).not.toContain('raw-length')
    for (const to of [
      'width: 44px',
      'min-height: 28px',
      'border: 1px solid',
      'border-top-width: 2px',
      'outline-offset: -2px',
    ]) {
      const found = checkArtboard(registry, 'A.dc.html', clean.replace('cursor: pointer', to))
      expect(
        found.map((f) => f.rule),
        `${to} should be a raw-length`,
      ).toContain('raw-length')
    }
    expect(
      checkArtboard(registry, 'A.dc.html', clean.replace('cursor: pointer', 'width: 44px'))[0]
        ?.message,
    ).toContain('var(--duro-size-*)')
    // No geometry is exempt: a raw canvas size on the root is a raw length too.
    expect(
      rules(clean.replace('width: var(--duro-mockup-canvas-width)', 'width: 1120px')),
    ).toContain('raw-length')
    for (const to of [
      'border: var(--duro-border-hairline) solid',
      'width: var(--duro-size-touch-target)',
      'top: 120px',
      'left: 12px',
      'width: 100%',
      'max-height: 85vh',
      'border: none',
      'width: 0',
    ]) {
      expect(rules(clean.replace('cursor: pointer', to)), `${to} is allowed`).not.toContain(
        'raw-length',
      )
    }
  })

  it('reports a raw value hidden behind a custom property, not one from a token', () => {
    for (const to of ['--gap: 12px', '--card-w: 44px', '--fade: 150ms']) {
      const found = checkArtboard(registry, 'A.dc.html', clean.replace('cursor: pointer', to))
      expect(
        found.map((f) => f.rule),
        `${to} should be a raw-length`,
      ).toContain('raw-length')
      expect(found.find((f) => f.rule === 'raw-length')?.message).toContain('custom property')
    }
    for (const to of [
      '--gap: var(--duro-spacing-md)',
      '--w: calc(2 * var(--duro-size-touch-target))',
      '--ratio: 1.5',
      '--half: 50%',
      '--zero: 0px',
    ]) {
      expect(rules(clean.replace('cursor: pointer', to)), `${to} is allowed`).not.toContain(
        'raw-length',
      )
    }
    // A colour behind a custom property was already caught.
    expect(rules(clean.replace('cursor: pointer', '--c: #333'))).toContain('raw-color')
    // The seed's own canvas variables sit in the masked token block.
    expect(rules(seedArtboard(registry, 'Main', 'dark'))).toEqual(['no-component-map'])
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

  describe('--overrides', () => {
    const seedWith = (content: string) => {
      writeFileSync(join(root, 'o.json'), content)
      return runMockupSeed(registry, {cwd: root, out: 'art', overrides: 'o.json'})
    }
    const seeded = () => readFileSync(join(root, 'art', 'Main.dc.html'), 'utf8')
    const tokenBlock = (html: string) =>
      html.slice(html.indexOf(TOKENS_START), html.indexOf(TOKENS_END))
    const runBin = (...extra: string[]) =>
      spawnSync(
        process.execPath,
        [bin, 'mockup', 'seed', '--out', 'art', '--overrides', 'o.json', ...extra],
        {cwd: root, encoding: 'utf8'},
      )

    it('writes the override rules inside the token block and the artboard passes check', () => {
      expect(seedWith('{"bg": "#020803", "successBg": "rgb(1 2 3)"}').exitCode).toBeUndefined()
      const html = seeded()
      const block = tokenBlock(html)
      for (const selector of [
        ':root',
        ':root[data-theme="light"]',
        ':root[data-theme="high-contrast"]',
      ]) {
        expect(block).toContain(
          `${selector} { --duro-color-bg: #020803; --duro-color-success-bg: rgb(1 2 3); }`,
        )
      }
      expect(block).toContain('o.json')
      expect(block.indexOf('--duro-mockup-canvas-width')).toBeLessThan(block.indexOf('o.json'))
      const authored = html.replace(
        '</div>\n</x-dc>',
        '<div class="btn" data-duro="Button variant=primary">Go</div></div>\n</x-dc>',
      )
      expect(rules(authored)).toEqual([])
    })

    it('still refuses a raw colour outside the block', () => {
      seedWith('{"bg": "#020803"}')
      const raw = seeded().replace('</style>', '.x { color: #ff0000; }\n</style>')
      expect(rules(raw)).toContain('raw-color')
    })

    it('is byte-for-byte the plain seed without overrides', () => {
      runMockupSeed(registry, {cwd: root, out: 'art'})
      const html = seeded()
      const expectedBlock = [
        TOKENS_START,
        registry.tokens.mockupCss.trimEnd(),
        "/* The design canvas size: the board's coordinate space, not a design token. */",
        `:root { --duro-mockup-canvas-width: ${ARTBOARD_WIDTH}px; --duro-mockup-canvas-height: ${ARTBOARD_HEIGHT}px; }`,
        TOKENS_END,
      ].join('\n')
      const block = html.slice(
        html.indexOf(TOKENS_START),
        html.indexOf(TOKENS_END) + TOKENS_END.length,
      )
      expect(block).toBe(expectedBlock)
      expect(block).not.toContain('Theme overrides')
    })

    it('maps every colour key to a --duro-color-* variable the token CSS declares', () => {
      const entries = registry.tokens.groups.colors?.entries ?? []
      expect(entries.length).toBeGreaterThan(0)
      for (const {key} of entries) {
        expect(registry.tokens.mockupCss).toContain(`${tokenVariableName('colors', key)}:`)
      }
    })

    it('names every themable key of every group by a variable the token CSS declares', () => {
      for (const group of THEMABLE_GROUPS) {
        for (const key of GROUP_KEYS[group]) {
          const name = tokenVariableName(group, key)
          expect(registry.tokens.mockupCss, name).toContain(`${name}:`)
        }
      }
    })

    describe('tokens file', () => {
      const tokens = JSON.stringify({
        colors: {bg: '#020803'},
        typography: {
          fontFamily: "'JetBrains Mono', monospace",
          fontFamilyMono: 'ui-monospace, Menlo',
        },
        radii: {xs: '2px', sm: '4px', md: '0', lg: '0.5rem'},
        sizes: {dialogSm: '300px'},
        spacing: {md: '20px'},
        shadows: {sm: '0 1px 2px rgba(0, 0, 0, 0.3)'},
        duration: {base: '250ms'},
      })

      it('seeds a variable for every group inside the token block, each one declared', () => {
        const result = seedWith(tokens)
        expect(result.exitCode).toBeUndefined()
        expect(result.text).toContain(
          'with overrides from o.json: colors 1, shadows 1, typography 2, spacing 1, radii 4, sizes 1, duration 1.',
        )
        const block = tokenBlock(seeded())
        const overrides = block.slice(block.indexOf('/* Theme overrides'))
        expect(overrides).toContain('/* Theme overrides from o.json')
        const emitted = [...overrides.matchAll(/(--duro-[a-z0-9-]+):/g)].map((match) => match[1])
        expect(new Set(emitted)).toEqual(
          new Set([
            '--duro-color-bg',
            '--duro-typography-font-family',
            '--duro-typography-font-family-mono',
            '--duro-shadow-sm',
            '--duro-spacing-md',
            '--duro-radius-xs',
            '--duro-radius-sm',
            '--duro-radius-md',
            '--duro-radius-lg',
            '--duro-size-dialog-sm',
            '--duro-duration-base',
          ]),
        )
        for (const name of emitted) {
          expect(registry.tokens.mockupCss, name).toContain(`${name}:`)
        }
        expect(block).toContain(
          ":root { --duro-color-bg: #020803; --duro-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3); --duro-typography-font-family: 'JetBrains Mono', monospace;",
        )
      })

      it('counts a flat colour file as colours only', () => {
        const result = seedWith('{"bg": "#020803"}')
        expect(result.text).toContain('with overrides from o.json: colors 1.')
        expect(result.text).not.toContain('typography')
      })

      it('leaves no .tmp file behind', () => {
        seedWith(tokens)
        expect(existsSync(join(root, 'art', 'Main.dc.html.tmp'))).toBe(false)
      })

      it.each(fixture.valid)('accepts $group.$key = $value', ({group, key, value}) => {
        const result = seedWith(JSON.stringify({[group]: {[key]: value}}))
        expect(result.exitCode).toBeUndefined()
        expect(tokenBlock(seeded())).toContain(
          `${tokenVariableName(group as ThemableGroup, key)}: ${value};`,
        )
      })

      it.each(fixture.invalid)(
        'exits 2 on stderr with empty stdout for $group.$key = $value',
        ({group, key, value, reason}) => {
          writeFileSync(join(root, 'o.json'), JSON.stringify({[group]: {[key]: value}}))
          const run = runBin()
          expect(run.status).toBe(2)
          expect(run.stdout).toBe('')
          expect(run.stderr).toContain(`${group}.${key}: `)
          expect(run.stderr).toContain(reason)
          expect(existsSync(join(root, 'art', 'Main.dc.html'))).toBe(false)
        },
      )

      it.each([
        [
          'a mixed file',
          '{"colors": {}, "bg": "#fff"}',
          `bg: unknown group (expected ${THEMABLE_GROUPS.join(' | ')})`,
        ],
        [
          'an unknown group',
          '{"radii": {}, "font": {"a": "b"}}',
          `font: unknown group (expected ${THEMABLE_GROUPS.join(' | ')})`,
        ],
        ['a flat unknown colour', '{"nope": "#fff"}', 'colors.nope: unknown token'],
        ['a flat non-colour value', '{"bg": "red; } body { x: y"}', 'colors.bg: "red; } body'],
        ['a group that is not an object', '{"radii": 4}', 'radii: expected an object'],
      ])('gives a usage error for %s', (_label, content, message) => {
        const result = seedWith(content)
        expect(result.exitCode).toBe(2)
        expect(result.text).toContain(message)
        expect(existsSync(join(root, 'art', 'Main.dc.html'))).toBe(false)
      })

      it('keeps the --json result on stdout with exit 2, and the error on stderr', () => {
        writeFileSync(join(root, 'o.json'), '{"sizes": {"touchTarget": "40px"}}')
        const run = runBin('--json')
        expect(run.status).toBe(2)
        expect(run.stderr).toContain('sizes.touchTarget: 40px is under the 44px floor')
        expect(JSON.parse(run.stdout)).toMatchObject({
          kind: 'usage-error',
          problems: [{group: 'sizes', key: 'touchTarget'}],
        })
      })

      it('emits a plain --json result on stdout on success', () => {
        writeFileSync(join(root, 'o.json'), tokens)
        const run = runBin('--json')
        expect(run.status).toBe(0)
        expect(JSON.parse(run.stdout)).toMatchObject({ok: true})
      })
    })

    it.each([
      ['a non-JSON file', 'bg = red', 'not valid JSON'],
      ['an array', '[]', 'expected a JSON object'],
    ])('gives a usage error for %s', (_label, content, problem) => {
      const result = seedWith(content)
      expect(result.exitCode).toBe(2)
      expect(result.text).toContain(problem)
      expect(existsSync(join(root, 'art', 'Main.dc.html'))).toBe(false)
    })

    it('gives a usage error for a missing file', () => {
      const result = runMockupSeed(registry, {cwd: root, overrides: 'absent.json'})
      expect(result.exitCode).toBe(2)
      expect(result.text).toContain('cannot read')
    })
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

describe('buildCanvas', () => {
  const art = (file: string) => ({file, html: clean})

  it('groups artboards into lettered directions by stem, Main first, each inlined', () => {
    const {html, findings} = buildCanvas(
      registry,
      [art('Tree-Phone.dc.html'), art('Rail.dc.html'), art('Tree.dc.html'), art('Main.dc.html')],
      {title: 'Shell directions'},
    )
    expect(findings).toEqual([])
    expect(html).not.toBeNull()
    const headings = [...html!.matchAll(/<h2>([^<]*)<\/h2>/g)].map((m) => m[1])
    expect(headings).toEqual(['A · Main', 'B · Rail', 'C · Tree'])
    // Tree before Tree-Phone inside direction C.
    expect(html!.indexOf('title="Tree.dc.html"')).toBeLessThan(
      html!.indexOf('title="Tree-Phone.dc.html"'),
    )
    expect(html).toContain('<title>Shell directions</title>')
    // srcdoc carries the whole artboard, attribute-escaped: one page, no supporting files.
    expect(html).toContain('srcdoc="')
    expect(html).toContain('data-duro=&quot;Button variant=primary&quot;')
    expect(html).not.toMatch(/<iframe[^>]* src=/)
    // Untrusted HTML: every frame is sandboxed, scripts off.
    expect(html!.match(/<iframe /g)).toHaveLength(html!.match(/ sandbox="" /g)!.length)
  })

  it("drops the seed's relative support.js, which a srcdoc frame cannot load", () => {
    const seeded = {file: 'Main.dc.html', html: `<script src="./support.js"></script>\n${clean}`}
    const {html} = buildCanvas(registry, [seeded], {})
    expect(html).not.toContain('support.js')
  })

  it('refuses to build a page from an artboard that fails the check', () => {
    const bad = {file: 'Bad.dc.html', html: clean.replace('cursor: pointer', 'color: #fff')}
    const {html, findings} = buildCanvas(registry, [art('Good.dc.html'), bad], {})
    expect(html).toBeNull()
    expect(findings.map((f) => [f.file, f.rule])).toEqual([['Bad.dc.html', 'raw-color']])
  })
})

describe('runMockup canvas on disk', () => {
  let root: string
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'duro-canvas-'))
  })
  afterEach(() => {
    rmSync(root, {recursive: true, force: true})
  })

  it('writes <dir>/canvas.html from every *.dc.html there, and honours --out and --title', () => {
    mkdirSync(join(root, 'shell'))
    writeFileSync(join(root, 'shell', 'Tree.dc.html'), clean)
    writeFileSync(join(root, 'shell', 'Rail-Phone.dc.html'), clean)
    writeFileSync(join(root, 'shell', 'notes.md'), 'not an artboard')
    const result = runMockupCanvas(registry, 'shell', {cwd: root})
    expect(result.exitCode).toBeUndefined()
    expect(result.data).toMatchObject({ok: true, path: 'shell/canvas.html', artboards: 2})
    const page = readFileSync(join(root, 'shell', 'canvas.html'), 'utf8')
    expect(page).toContain('title="Rail-Phone.dc.html"')
    expect(page).not.toContain('notes.md')

    // A second run does not read its own output back as an artboard.
    expect(runMockupCanvas(registry, 'shell', {cwd: root}).data).toMatchObject({artboards: 2})

    runMockupCanvas(registry, 'shell', {cwd: root, out: 'review/page.html', title: 'Pick one'})
    expect(readFileSync(join(root, 'review', 'page.html'), 'utf8')).toContain(
      '<title>Pick one</title>',
    )
  })

  it('refuses with exit 1 and writes nothing when an artboard fails; 2 on bad input', () => {
    mkdirSync(join(root, 'bad'))
    writeFileSync(
      join(root, 'bad', 'Main.dc.html'),
      clean.replace('cursor: pointer', 'color: #fff'),
    )
    const refused = runMockupCanvas(registry, 'bad', {cwd: root})
    expect(refused.exitCode).toBe(1)
    expect(refused.text).toMatch(/Main\.dc\.html:\d+ raw-color/)
    expect(existsSync(join(root, 'bad', 'canvas.html'))).toBe(false)

    expect(runMockupCanvas(registry, undefined, {cwd: root}).exitCode).toBe(2)
    expect(runMockupCanvas(registry, 'missing', {cwd: root}).exitCode).toBe(2)
    mkdirSync(join(root, 'empty'))
    expect(runMockupCanvas(registry, 'empty', {cwd: root}).exitCode).toBe(2)
  })

  it('is a mockup subcommand', () => {
    expect(MOCKUP_SUBCOMMANDS).toEqual(['seed', 'check', 'canvas'])
    mkdirSync(join(root, 'one'))
    writeFileSync(join(root, 'one', 'Main.dc.html'), clean)
    expect(runMockup(registry, 'canvas', ['one'], {cwd: root}).exitCode).toBeUndefined()
    expect(runMockup(registry, 'canvas', ['one', 'two'], {cwd: root}).exitCode).toBe(2)
  })

  it('says when the app installs a different @duro-app/ui than the checker knows', () => {
    writeFileSync(join(root, 'package.json'), '{"name":"app"}')
    mkdirSync(join(root, 'node_modules', '@duro-app', 'ui'), {recursive: true})
    writeFileSync(
      join(root, 'node_modules', '@duro-app', 'ui', 'package.json'),
      // As published: an exports map without ./package.json, so require() cannot read it.
      '{"name":"@duro-app/ui","version":"0.0.1","exports":{".":"./index.js"}}',
    )
    writeFileSync(join(root, 'Main.dc.html'), clean)
    const result = runMockupCheck(registry, ['Main.dc.html'], {cwd: root})
    expect(result.text).toContain('@duro-app/ui is 0.0.1')
    expect(result.text).toContain('npx -y @duro-app/cli@0.0.1 mockup check')
    expect(result.data).toMatchObject({skew: {installed: '0.0.1'}})
  })

  it('stays quiet for a workspace-linked @duro-app/ui: a source checkout has no release to skew', () => {
    writeFileSync(join(root, 'package.json'), '{"name":"app"}')
    mkdirSync(join(root, 'ui'))
    writeFileSync(join(root, 'ui', 'package.json'), '{"name":"@duro-app/ui","version":"0.0.1"}')
    mkdirSync(join(root, 'node_modules', '@duro-app'), {recursive: true})
    symlinkSync(join(root, 'ui'), join(root, 'node_modules', '@duro-app', 'ui'))
    writeFileSync(join(root, 'Main.dc.html'), clean)
    const result = runMockupCheck(registry, ['Main.dc.html'], {cwd: root})
    expect(result.text).not.toContain('note:')
    expect(result.data).not.toHaveProperty('skew')
  })
})
