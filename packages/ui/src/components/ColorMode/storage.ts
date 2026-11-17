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

/**
 * The value under `key`; when there is none, a value under `legacyKey` that
 * `isValid` accepts is moved to `key` (written there, removed from
 * `legacyKey`) and returned. A user's choice saved under an old key name
 * survives the rename, once.
 */
export function readStoredMigrating(
  key: string,
  legacyKey: string,
  isValid: (value: string) => boolean,
): string | null {
  const current = readStoredRaw(key)
  if (current !== null) return current
  const legacy = readStoredRaw(legacyKey)
  if (legacy === null || !isValid(legacy)) return null
  writeStoredRaw(key, legacy)
  try {
    window.localStorage.removeItem(legacyKey)
  } catch {
    /* ignore */
  }
  return legacy
}

export function writeStoredRaw(key: string | null, value: string): void {
  if (!key || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}
