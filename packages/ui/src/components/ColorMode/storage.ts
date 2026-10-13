/** The stored preference, as a raw string; null without storage or a value. */
export function readStoredRaw(key: string | null): string | null {
  if (!key || typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    // Private mode / blocked storage — degrade to no persistence.
    return null
  }
}

export function writeStoredRaw(key: string | null, value: string): void {
  if (!key || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}
