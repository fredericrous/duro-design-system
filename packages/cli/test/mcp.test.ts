import {describe, expect, it} from 'vitest'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {loadRegistry} from '../src/registry.js'
import {listFiles} from '../src/commands/skill.js'
// @ts-expect-error — a plain .mjs build script, no types
import {listGuideFiles} from '../scripts/lib/guides.mjs'
import type {Registry} from '../src/registry-types.js'
import {
  toolDefinitions,
  callTool,
  toolResponse,
  listResources,
  readResource,
} from '../src/commands/mcp.js'

const registry = loadRegistry()

describe('mcp tools', () => {
  it('exposes exactly the read surfaces and the artboard check', () => {
    expect(toolDefinitions(registry).map((tool) => tool.name)).toEqual([
      'duro_ds_lookup',
      'duro_ds_list',
      'duro_ds_manifest',
      'duro_ds_mockup_check',
      'duro_ds_mockup_canvas',
    ])
  })

  it('duro_ds_mockup_canvas returns one page for the artboards, or the findings that stop it', () => {
    const good =
      '<style>.a{color:var(--duro-color-text)}</style><button class="a" data-duro="Button">Go</button>'
    const page = callTool(registry, 'duro_ds_mockup_canvas', {
      artboards: [
        {file: 'Main.dc.html', html: good},
        {file: 'Main-Phone.dc.html', html: good},
      ],
      title: 'Directions',
    })
    expect(page.isError).toBe(false)
    const data = page.data as {ok: boolean; html: string; findings: unknown[]}
    expect(data.ok).toBe(true)
    expect(data.findings).toEqual([])
    expect(data.html).toContain('<title>Directions</title>')
    expect(page.text).toBe(data.html)

    const refused = callTool(registry, 'duro_ds_mockup_canvas', {
      artboards: [{file: 'Raw.dc.html', html: '<div style="color:#fff"></div>'}],
    })
    expect((refused.data as {ok: boolean; html: null}).ok).toBe(false)
    expect((refused.data as {html: null}).html).toBeNull()
    expect(refused.text).toContain('Raw.dc.html:1')

    const empty = callTool(registry, 'duro_ds_mockup_canvas', {artboards: []})
    expect(empty.isError).toBe(true)
  })

  it('duro_ds_mockup_check reports findings for a raw artboard and none for a token one', () => {
    const raw = callTool(registry, 'duro_ds_mockup_check', {
      html: '<style>.a{color:#fff;padding:8px}</style><div class="a"></div>',
      file: 'Raw.dc.html',
    })
    expect(raw.isError).toBe(false)
    const rawData = raw.data as {ok: boolean; findings: {rule: string}[]}
    expect(rawData.ok).toBe(false)
    expect(rawData.findings.map((f) => f.rule)).toEqual(
      expect.arrayContaining(['raw-color', 'raw-length', 'no-component-map']),
    )
    expect(raw.text).toContain('Raw.dc.html:1')

    const clean = callTool(registry, 'duro_ds_mockup_check', {
      html: '<style>.a{color:var(--duro-color-text);padding:var(--duro-spacing-sm)}</style><button class="a" data-duro="Button">Go</button>',
    })
    expect((clean.data as {ok: boolean}).ok).toBe(true)
  })

  it('duro_ds_lookup returns structured entries and search fallback', () => {
    const button = callTool(registry, 'duro_ds_lookup', {name: 'Button'})
    expect(button.isError).toBe(false)
    expect(button.data).toMatchObject({kind: 'component', key: 'Button'})

    const searched = callTool(registry, 'duro_ds_lookup', {name: 'tags that wrap'})
    expect(searched.isError).toBe(false)
    expect((searched.data as {kind: string}).kind).toBe('search')
  })

  it('duro_ds_list and duro_ds_manifest answer', () => {
    expect(
      (callTool(registry, 'duro_ds_list', {kind: 'recipes'}).data as unknown[]).length,
    ).toBeGreaterThan(4)
    expect((callTool(registry, 'duro_ds_manifest', {}).data as {bin: string}).bin).toBe('duro')
  })

  it('every tool answers with an object structuredContent', () => {
    const calls: [string, Record<string, unknown>][] = [
      ['duro_ds_lookup', {name: 'Button'}],
      ['duro_ds_list', {kind: 'recipes'}],
      ['duro_ds_manifest', {}],
    ]
    for (const [name, args] of calls) {
      const response = toolResponse(registry, name, args)
      expect(Array.isArray(response.structuredContent), `${name} returned an array`).toBe(false)
      expect(typeof response.structuredContent).toBe('object')
      expect(response.content[0].text.length).toBeGreaterThan(0)
    }
    expect(
      toolResponse(registry, 'duro_ds_list', {kind: 'recipes'}).structuredContent,
    ).toHaveProperty('entries')
  })

  describe('guides', () => {
    const skillsDir = fileURLToPath(new URL('../skills/', import.meta.url))

    it('duro_ds_list kind guides lists every file of the three skills', () => {
      const list = callTool(registry, 'duro_ds_list', {kind: 'guides'})
      expect(list.isError).toBe(false)
      const names = (list.data as {name: string}[]).map((entry) => entry.name)
      expect(names).toEqual(
        expect.arrayContaining(['guide:colors', 'guide:typography', 'guide:ui']),
      )
      expect(names).toContain('guide:colors/contrast.md')
      // Out of the default index and the manifest.
      const all = callTool(registry, 'duro_ds_list', {})
      expect((all.data as {kind: string}[]).some((entry) => entry.kind === 'guide')).toBe(false)
      expect(JSON.stringify(callTool(registry, 'duro_ds_manifest', {}).data)).not.toContain(
        'guide:',
      )
    })

    it('guide:<skill> returns SKILL.md byte for byte, guide:<skill>/<file> a reference file', () => {
      const skill = callTool(registry, 'duro_ds_lookup', {name: 'guide:colors'})
      expect(skill.isError).toBe(false)
      expect(skill.text).toBe(readFileSync(`${skillsDir}colors/SKILL.md`, 'utf8'))
      const file = callTool(registry, 'duro_ds_lookup', {name: 'guide:colors/contrast.md'})
      expect(file.isError).toBe(false)
      expect(file.text).toBe(readFileSync(`${skillsDir}colors/contrast.md`, 'utf8'))
      // The prefix wins over the token group of the same name.
      expect(callTool(registry, 'duro_ds_lookup', {name: 'guide:typography'}).text).not.toBe(
        callTool(registry, 'duro_ds_lookup', {name: 'typography'}).text,
      )
    })

    it('guide resources list and read the packaged bytes', () => {
      const uris = listResources(registry).map((resource) => resource.uri)
      expect(uris).toContain('duro://guide/typography')
      const reference = listFiles(`${skillsDir}typography`).find((file) => file !== 'SKILL.md')
      expect(reference).toBeDefined()
      const skill = readResource(registry, 'duro://guide/typography')
      expect(skill.contents[0].mimeType).toBe('text/markdown')
      expect(skill.contents[0].text).toBe(readFileSync(`${skillsDir}typography/SKILL.md`, 'utf8'))
      const file = readResource(registry, `duro://guide/typography/${reference}`)
      expect(file.contents[0].text).toBe(
        readFileSync(`${skillsDir}typography/${reference}`, 'utf8'),
      )
    })

    it('an unknown file names the skill files, an unknown skill the skills', () => {
      const file = callTool(registry, 'duro_ds_lookup', {name: 'guide:ui/nope.md'})
      expect(file.isError).toBe(true)
      expect(file.text).toContain('SKILL.md')
      expect(file.text).toContain('animations.md')
      const skill = callTool(registry, 'duro_ds_lookup', {name: 'guide:nope'})
      expect(skill.isError).toBe(true)
      expect(skill.text).toContain('colors, typography, ui')
    })

    it('a registry without guides gives an unknown-guide error, not a crash', () => {
      const bare: Registry = {...registry}
      delete bare.guides
      const result = callTool(bare, 'duro_ds_lookup', {name: 'guide:colors'})
      expect(result.isError).toBe(true)
      expect(result.text).toContain('unknown guide')
      expect(callTool(bare, 'duro_ds_list', {kind: 'guides'}).isError).toBe(false)
    })

    it('the registry walker and the installer walker list the same files in the same order', () => {
      for (const name of ['colors', 'typography', 'ui']) {
        expect(registry.guides).toHaveProperty(name)
        const dir = `${skillsDir}${name}`
        expect(listGuideFiles(dir)).toEqual(listFiles(dir))
        expect(Object.keys(registry.guides?.[name] ?? {})).toEqual(listFiles(dir))
      }
    })
  })

  it('unknown tools throw', () => {
    expect(() => callTool(registry, 'nope', {})).toThrowError(/unknown tool/)
  })
})
