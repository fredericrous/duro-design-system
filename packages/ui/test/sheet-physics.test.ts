import {describe, expect, it} from 'vitest'
import {
  cycleDetent,
  detentHeight,
  rubberBand,
  settleDetent,
  shouldDismissEdge,
  sortSnapPoints,
} from '../src/components/Drawer/sheetPhysics'

const heights = [422, 797] // medium and large on an 844 window with a 47 top inset

describe('detentHeight', () => {
  it('medium is half the window, large the window less its top inset', () => {
    expect(detentHeight('medium', 844, 47)).toBe(422)
    expect(detentHeight('large', 844, 47)).toBe(797)
  })
})

describe('sortSnapPoints', () => {
  it('orders ascending and drops duplicates', () => {
    expect(sortSnapPoints(['large', 'medium', 'large'])).toEqual(['medium', 'large'])
  })
})

describe('settleDetent', () => {
  it('a slow release settles on the nearest detent', () => {
    expect(settleDetent({heights, from: 0, height: 700, velocity: 0})).toBe(1)
    expect(settleDetent({heights, from: 1, height: 500, velocity: 0})).toBe(0)
  })

  it('a fling moves one detent in its direction', () => {
    expect(settleDetent({heights, from: 0, height: 440, velocity: -1})).toBe(1)
    expect(settleDetent({heights, from: 1, height: 780, velocity: 1})).toBe(0)
  })

  it('a fling up from the largest stays there', () => {
    expect(settleDetent({heights, from: 1, height: 797, velocity: -2})).toBe(1)
  })

  it('a fling down from the lowest dismisses', () => {
    expect(settleDetent({heights, from: 0, height: 410, velocity: 1})).toBe('dismiss')
  })

  it('a slow drag far below the lowest dismisses, a short one snaps back', () => {
    expect(settleDetent({heights, from: 0, height: 250, velocity: 0})).toBe('dismiss')
    expect(settleDetent({heights, from: 0, height: 380, velocity: 0})).toBe(0)
  })

  it('a single detent behaves like a dismissable sheet', () => {
    expect(settleDetent({heights: [797], from: 0, height: 790, velocity: -1})).toBe(0)
    expect(settleDetent({heights: [797], from: 0, height: 500, velocity: 0})).toBe('dismiss')
  })
})

describe('cycleDetent', () => {
  it('steps up and wraps', () => {
    expect(cycleDetent(0, 2)).toBe(1)
    expect(cycleDetent(1, 2)).toBe(0)
    expect(cycleDetent(0, 1)).toBe(0)
  })
})

describe('rubberBand', () => {
  it('grows and stays under its cap', () => {
    expect(rubberBand(0, 24)).toBe(0)
    expect(rubberBand(40, 24)).toBeGreaterThan(0)
    expect(rubberBand(100_000, 24)).toBeLessThan(24)
  })
})

describe('shouldDismissEdge', () => {
  it('dismisses past the threshold or on a fling', () => {
    expect(shouldDismissEdge(120, 320, 0)).toBe(true)
    expect(shouldDismissEdge(40, 320, 0)).toBe(false)
    expect(shouldDismissEdge(40, 320, 0.8)).toBe(true)
  })
})
