import {describe, expect, it} from 'vitest'
import {loadRegistry} from '../src/registry.js'
import {toolDefinitions, callTool} from '../src/commands/mcp.js'

const registry = loadRegistry()

describe('mcp tools', () => {
  it('exposes exactly the three read surfaces', () => {
    expect(toolDefinitions(registry).map((tool) => tool.name)).toEqual([
      'duro_lookup',
      'duro_list',
      'duro_manifest',
    ])
  })

  it('duro_lookup returns structured entries and search fallback', () => {
    const button = callTool(registry, 'duro_lookup', {name: 'Button'})
    expect(button.isError).toBe(false)
    expect(button.data).toMatchObject({kind: 'component', key: 'Button'})

    const searched = callTool(registry, 'duro_lookup', {name: 'tags that wrap'})
    expect(searched.isError).toBe(false)
    expect((searched.data as {kind: string}).kind).toBe('search')
  })

  it('duro_list and duro_manifest answer', () => {
    expect(
      (callTool(registry, 'duro_list', {kind: 'recipes'}).data as unknown[]).length,
    ).toBeGreaterThan(4)
    expect((callTool(registry, 'duro_manifest', {}).data as {bin: string}).bin).toBe('duro')
  })

  it('unknown tools throw', () => {
    expect(() => callTool(registry, 'nope', {})).toThrowError(/unknown tool/)
  })
})
