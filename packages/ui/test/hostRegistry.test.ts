import {describe, expect, it} from 'vitest'
import {createHostRegistry} from '../src/shared/portal/hostRegistry'

describe('createHostRegistry', () => {
  it('draws in the last presented host, with the root always below', () => {
    const registry = createHostRegistry()
    const removeModal = registry.addHost('modal', 'presented')
    // The root host registers after an already-open Modal's host (effects run
    // child-first), yet stays at the bottom.
    registry.addHost('root', 'base')
    expect(registry.getSnapshot().topHost).toBe('modal')

    const removeRoute = registry.addHost('route', 'presented')
    expect(registry.getSnapshot().topHost).toBe('route')

    removeRoute()
    removeModal()
    expect(registry.getSnapshot().topHost).toBe('root')
  })

  it('orders entries by layer and replaces an entry with the same key', () => {
    const registry = createHostRegistry()
    registry.setEntry({key: 'toast', layer: 1060, node: 'toast'})
    registry.setEntry({key: 'bar', layer: 50, node: 'bar'})
    registry.setEntry({key: 'toast', layer: 1060, node: 'toast v2'})
    expect(registry.getSnapshot().entries.map((entry) => entry.node)).toEqual(['bar', 'toast v2'])
  })

  it('publishes a new snapshot on change and none on a no-op removal', () => {
    const registry = createHostRegistry()
    let calls = 0
    const unsubscribe = registry.subscribe(() => {
      calls += 1
    })
    const before = registry.getSnapshot()
    registry.setEntry({key: 'a', layer: 1, node: null})
    expect(registry.getSnapshot()).not.toBe(before)
    registry.removeEntry('missing')
    expect(calls).toBe(1)
    unsubscribe()
  })
})
