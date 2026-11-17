import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {readStoredMigrating} from '../src/components/ColorMode/storage'

/** A Map-backed localStorage on a fake window, so the node unit project can run it. */
function fakeStorage(seed: Record<string, string>): Map<string, string> {
  const store = new Map(Object.entries(seed))
  ;(globalThis as {window?: unknown}).window = {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
  }
  return store
}

const isMode = (value: string) => ['light', 'dark', 'system'].includes(value)

describe('readStoredMigrating', () => {
  beforeEach(() => {
    delete (globalThis as {window?: unknown}).window
  })
  afterEach(() => {
    delete (globalThis as {window?: unknown}).window
  })

  it('moves a valid value from the old key to the new one, once', () => {
    const store = fakeStorage({'duro-color-mode': 'dark'})
    expect(readStoredMigrating('greenrack-color-mode', 'duro-color-mode', isMode)).toBe('dark')
    expect(store.get('greenrack-color-mode')).toBe('dark')
    expect(store.has('duro-color-mode')).toBe(false)
  })

  it('prefers the new key and leaves the old one alone', () => {
    const store = fakeStorage({'greenrack-color-mode': 'light', 'duro-color-mode': 'dark'})
    expect(readStoredMigrating('greenrack-color-mode', 'duro-color-mode', isMode)).toBe('light')
    expect(store.get('duro-color-mode')).toBe('dark')
  })

  it('ignores an invalid old value', () => {
    const store = fakeStorage({'duro-color-mode': 'sepia'})
    expect(readStoredMigrating('greenrack-color-mode', 'duro-color-mode', isMode)).toBeNull()
    expect(store.has('greenrack-color-mode')).toBe(false)
    expect(store.get('duro-color-mode')).toBe('sepia')
  })

  it('keeps the old key when the new one cannot be written', () => {
    const store = fakeStorage({'duro-color-mode': 'dark'})
    const storage = (globalThis as {window: {localStorage: {setItem: unknown}}}).window.localStorage
    storage.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    expect(readStoredMigrating('greenrack-color-mode', 'duro-color-mode', isMode)).toBe('dark')
    expect(store.get('duro-color-mode')).toBe('dark')
  })

  it('returns null without storage', () => {
    expect(readStoredMigrating('greenrack-color-mode', 'duro-color-mode', isMode)).toBeNull()
  })
})
