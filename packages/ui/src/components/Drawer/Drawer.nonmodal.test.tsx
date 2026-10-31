import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {afterEach, describe, expect, it} from 'vitest'
import {Drawer} from './Drawer'
import {LAYERS} from '@duro-app/tokens/keys'
import {Popover} from '../Popover/Popover'
;(globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true

const host = document.createElement('div')
let root: Root | null = null

function mount(modal: boolean | undefined, onOpenChange?: (open: boolean) => void) {
  document.body.appendChild(host)
  root = createRoot(host)
  act(() => {
    root?.render(
      <Drawer.Root open modal={modal} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.Body>
            <button type="button">Inside</button>
          </Drawer.Body>
        </Drawer.Portal>
      </Drawer.Root>,
    )
  })
}

afterEach(() => {
  act(() => root?.unmount())
  root = null
  host.remove()
  document.body.style.overflow = ''
})

describe('Drawer modal prop', () => {
  it('non-modal renders no aria-modal, no backdrop and leaves body overflow alone', () => {
    mount(false)
    const dialog = host.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.hasAttribute('aria-modal')).toBe(false)
    expect(host.querySelector('[data-drawer-backdrop]')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })

  it('default modal drawer keeps its backdrop, aria-modal and scroll lock', () => {
    mount(undefined)
    expect(host.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true')
    expect(host.querySelector('[data-drawer-backdrop]')).not.toBeNull()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('non-modal closes on Escape only while focus is inside the panel', () => {
    const changes: boolean[] = []
    mount(false, (open) => changes.push(open))
    const press = () =>
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}))
      })
    press()
    expect(changes).toEqual([])
    act(() => host.querySelector('button')?.focus())
    press()
    expect(changes).toEqual([false])
  })

  it('a Popover inside a non-modal drawer stacks above the drawer viewport', () => {
    document.body.appendChild(host)
    root = createRoot(host)
    const popover = (label: string, raised?: boolean) => (
      <Popover.Root defaultOpen>
        <Popover.Trigger>{label}</Popover.Trigger>
        <Popover.Popup label={label} raised={raised}>
          Extra
        </Popover.Popup>
      </Popover.Root>
    )
    act(() => {
      root?.render(
        <>
          {popover('Plain')}
          {popover('Raised', true)}
          <Drawer.Root open modal={false}>
            <Drawer.Portal>
              <Drawer.Title>Filters</Drawer.Title>
              {popover('Inside')}
            </Drawer.Portal>
          </Drawer.Root>
        </>,
      )
    })
    // Styles are compiled to one atomic class per property; the zIndex class
    // names the layer token, so equal classes mean the same layer.
    const layerClass = (el: Element | null) =>
      el?.className.split(' ').find((name) => name.startsWith('zIndex-'))
    const popup = (label: string) =>
      document.querySelector(`[role="dialog"][aria-label="${label}"]`)
    const viewportLayer = layerClass(host.querySelector('[data-drawer-viewport]'))
    // The classes name the layers; the token values order them.
    expect(LAYERS.floatingRaised).toBeGreaterThan(LAYERS.floating)
    expect(viewportLayer).toBeDefined()
    expect(viewportLayer).toBe(layerClass(popup('Plain')))
    expect(layerClass(popup('Inside'))).toBe(layerClass(popup('Raised')))
    expect(layerClass(popup('Inside'))).not.toBe(viewportLayer)
  })
})
