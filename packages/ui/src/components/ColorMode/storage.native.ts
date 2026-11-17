// Native has no localStorage: an app persists the preference itself, through
// ColorModeProvider's `preference` and `onPreferenceChange`.

export function readStoredRaw(_key: string | null): string | null {
  return null
}

export function readStoredMigrating(
  _key: string,
  _legacyKey: string,
  _isValid: (value: string) => boolean,
): string | null {
  return null
}

export function writeStoredRaw(_key: string | null, _value: string): boolean {
  return false
}
