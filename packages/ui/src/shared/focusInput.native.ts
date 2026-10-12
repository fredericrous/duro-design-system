interface StrictInputRef {
  getNativeRef?: () => {focus?: () => void} | null
  focus?: () => void
}

/**
 * Focus an html.input on native. react-strict-dom 0.0.55 hands out a copy of
 * the TextInput instance, whose `focus()` does nothing (#506); the copy keeps
 * TextInput's own `getNativeRef()`, which returns the real host.
 *
 * holds-until: react-strict-dom releases #515 (focus() on the ref itself).
 */
export function focusInput(input: unknown): void {
  const ref = input as StrictInputRef | null
  const host = ref?.getNativeRef?.()
  if (host?.focus) host.focus()
  else ref?.focus?.()
}
