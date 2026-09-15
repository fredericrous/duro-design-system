import {describe, expect, it} from 'vitest'
import {loadRegistry} from '../src/registry.js'
import {toolDefinitions, callTool, toolResponse} from '../src/commands/mcp.js'

const registry = loadRegistry()

describe('mcp tools', () => {
  it('exposes exactly the read surfaces and the artboard check', () => {
    expect(toolDefinitions(registry).map((tool) => tool.name)).toEqual([
      'duro_ds_lookup',
      'duro_ds_list',
      'duro_ds_manifest',
      'duro_ds_mockup_check',
    ])
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

  it('unknown tools throw', () => {
    expect(() => callTool(registry, 'nope', {})).toThrowError(/unknown tool/)
  })
})
