import {describeDropped, type DroppedToken} from '@duro-app/tokens/theme'

// Process-wide on purpose: every provider on a page shares one theme file, so
// one warning per value is enough. holds-until: two apps with different theme
// files share a page and need their own warnings (then keep it per provider).
const warned = new Set<string>()

/**
 * One development warning per distinct dropped entry, so a provider that
 * re-renders (or many that share a theme file) does not repeat itself. Called
 * from an effect, never during render.
 */
export function warnDropped(dropped: readonly DroppedToken[]): void {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return
  for (const entry of dropped) {
    const signature = JSON.stringify([entry.group, entry.key, entry.value])
    if (warned.has(signature)) continue
    warned.add(signature)
    console.warn(`[duro] ThemeProvider dropped ${describeDropped(entry)}`)
  }
}
