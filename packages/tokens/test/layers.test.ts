import {describe, expect, it} from 'vitest'
import {LAYER_KEYS, LAYERS} from '@duro-app/tokens/keys'

// React Native takes a number for zIndex, never the CSS variable string, so a
// native overlay reads these.
describe('LAYERS', () => {
  it('is numeric, in key order', () => {
    expect(LAYERS.overlay).toBe(1000)
    for (const value of Object.values(LAYERS)) expect(typeof value).toBe('number')
    expect(Object.keys(LAYERS)).toEqual([...LAYER_KEYS])
  })

  it('stacks in the documented order', () => {
    const order = LAYER_KEYS.map((key) => LAYERS[key])
    // Strictly increasing: no two layers share a value.
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThan(order[i - 1]!)
    expect(LAYERS.popup).toBeGreaterThan(LAYERS.modal)
    // A Popover clears a modal, and stays under what opens from inside it.
    expect(LAYERS.popover).toBeGreaterThan(LAYERS.modal)
    expect(LAYERS.popover).toBeLessThan(LAYERS.popupBackdrop)
    expect(LAYERS.toast).toBeGreaterThan(LAYERS.popup)
    // A sheet's own chrome clears the modal it sits on, under a Popover.
    expect(LAYERS.modalRaised).toBeGreaterThan(LAYERS.modal)
    expect(LAYERS.modalRaised).toBeLessThan(LAYERS.popover)
    // A floating surface over another one: under a modal outside one, and
    // under what opens from a Popover inside one.
    expect(LAYERS.floatingRaised).toBeGreaterThan(LAYERS.floating)
    expect(LAYERS.floatingRaised).toBeLessThan(LAYERS.overlay)
    expect(LAYERS.popoverRaised).toBeGreaterThan(LAYERS.popover)
    expect(LAYERS.popoverRaised).toBeLessThan(LAYERS.popupBackdrop)
  })
})
