import {describe, expect, it} from 'vitest'
import {createHostRegistry, entriesForHost} from '../src/shared/portal/hostRegistry'

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

  it('keeps a base entry in the root when a Modal opens, and moves the top entries up', () => {
    const registry = createHostRegistry()
    registry.addHost('root', 'base')
    registry.setEntry({key: 'pane', layer: 50, host: 'base', node: 'pane'})
    registry.setEntry({key: 'toast', layer: 1060, node: 'toast'})
    const keys = (host: string) =>
      entriesForHost(registry.getSnapshot(), host)?.map((entry) => entry.key)

    // Nothing presented: the root is both hosts, so it draws everything, lowest layer first.
    expect(keys('root')).toEqual(['pane', 'toast'])

    // A Dialog opens: the toast moves to the Dialog's host, the pane stays in the root.
    const removeDialog = registry.addHost('dialog', 'presented')
    expect(registry.getSnapshot().baseHost).toBe('root')
    expect(keys('root')).toEqual(['pane'])
    expect(keys('dialog')).toEqual(['toast'])

    // The Dialog closes: the root draws both again, and the pane never left it.
    removeDialog()
    expect(keys('root')).toEqual(['pane', 'toast'])
  })

  it('draws nothing in a host that is neither the top nor the base', () => {
    const registry = createHostRegistry()
    registry.addHost('root', 'base')
    registry.addHost('first', 'presented')
    registry.addHost('second', 'presented')
    registry.setEntry({key: 'toast', layer: 1060, node: 'toast'})
    expect(entriesForHost(registry.getSnapshot(), 'first')).toBeNull()
    expect(entriesForHost(registry.getSnapshot(), 'second')?.length).toBe(1)
  })

  it('finds the base host whatever order the hosts register in, and forgets it on removal', () => {
    const registry = createHostRegistry()
    registry.addHost('modal', 'presented')
    const removeRoot = registry.addHost('root', 'base')
    expect(registry.getSnapshot().baseHost).toBe('root')
    removeRoot()
    expect(registry.getSnapshot().baseHost).toBeUndefined()
  })

  it('treats an entry with no host as a top entry', () => {
    const registry = createHostRegistry()
    registry.addHost('root', 'base')
    registry.addHost('modal', 'presented')
    registry.setEntry({key: 'plain', layer: 1, node: null})
    expect(entriesForHost(registry.getSnapshot(), 'modal')?.map((entry) => entry.key)).toEqual([
      'plain',
    ])
    expect(entriesForHost(registry.getSnapshot(), 'root')).toEqual([])
  })
})
