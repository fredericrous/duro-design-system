import {describe, expect, it} from 'vitest'
import {computePopoverPosition} from '../src/components/Popover/position'
import {isOutsidePress} from '../src/components/Popover/outside'

const viewport = {width: 800, height: 600}
const popup = {width: 200, height: 100}
const anchor = {top: 200, left: 300, width: 80, height: 30}
const base = {anchor, popup, viewport, side: 'bottom' as const, align: 'start' as const, offset: 4}

describe('computePopoverPosition', () => {
  it('places below the anchor', () => {
    expect(computePopoverPosition(base)).toEqual({top: 234, left: 300, side: 'bottom'})
  })

  it('places above the anchor', () => {
    expect(computePopoverPosition({...base, side: 'top'})).toEqual({
      top: 96,
      left: 300,
      side: 'top',
    })
  })

  it('aligns start, center and end', () => {
    expect(computePopoverPosition({...base, align: 'start'}).left).toBe(300)
    expect(computePopoverPosition({...base, align: 'center'}).left).toBe(240)
    expect(computePopoverPosition({...base, align: 'end'}).left).toBe(180)
  })

  it('flips from bottom to top near the viewport bottom', () => {
    const r = computePopoverPosition({...base, anchor: {...anchor, top: 560}})
    expect(r).toEqual({top: 456, left: 300, side: 'top'})
  })

  it('flips from top to bottom near the viewport top', () => {
    const r = computePopoverPosition({...base, side: 'top', anchor: {...anchor, top: 20}})
    expect(r).toEqual({top: 54, left: 300, side: 'bottom'})
  })

  it('clamps horizontally at both edges', () => {
    expect(computePopoverPosition({...base, anchor: {...anchor, left: -50}}).left).toBe(0)
    expect(computePopoverPosition({...base, anchor: {...anchor, left: 780}}).left).toBe(600)
  })
})

// The unit project runs in Node (no DOM): a tiny tree stands in for elements.
class FakeNode {
  children: FakeNode[] = []
  contains(other: FakeNode): boolean {
    return other === this || this.children.some((c) => c.contains(other))
  }
}
const asNode = (n: FakeNode) => n as unknown as Node & Element

describe('isOutsidePress', () => {
  const popupEl = new FakeNode()
  const inner = new FakeNode()
  popupEl.children.push(inner)
  const ignored = new FakeNode()
  const elsewhere = new FakeNode()
  const inside = [asNode(popupEl), null, asNode(ignored)]

  it('is false inside the popup', () => {
    expect(isOutsidePress(asNode(inner), inside)).toBe(false)
  })
  it('is false inside an ignore element', () => {
    expect(isOutsidePress(asNode(ignored), inside)).toBe(false)
  })
  it('is true elsewhere', () => {
    expect(isOutsidePress(asNode(elsewhere), inside)).toBe(true)
  })
  it('is true for a null target', () => {
    expect(isOutsidePress(null, inside)).toBe(true)
  })
})
