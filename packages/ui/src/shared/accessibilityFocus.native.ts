import {AccessibilityInfo} from 'react-native'

const reported = new Set<string>()

type FocusTarget = Parameters<typeof AccessibilityInfo.sendAccessibilityEvent>[0]

/**
 * Moves the screen reader's focus to `target` (a host view, or a
 * react-strict-dom element ref). Native overlays call it on open and, for the
 * trigger, on close: the screen-reader contract that stands in for the web's
 * DOM focus (plan N0, Decision 6). A target the platform refuses is logged
 * once per caller, in release builds too, rather than dropped.
 */
export function focusForAccessibility(target: unknown, from: string): void {
  if (target == null) return
  try {
    AccessibilityInfo.sendAccessibilityEvent(target as FocusTarget, 'focus')
  } catch (error) {
    if (reported.has(from)) return
    reported.add(from)
    console.warn(`[duro] ${from}: could not move accessibility focus: ${String(error)}`)
  }
}
