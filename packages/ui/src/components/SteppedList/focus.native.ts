// Explicit suffix: a native-only module has no web file for moduleSuffixes to pair.
import {focusForAccessibility} from '../../shared/accessibilityFocus.native'

/** Moves the screen reader's focus to `element`: native has no DOM focus. */
export function focusFirstIn(element: HTMLElement | null) {
  focusForAccessibility(element, 'SteppedList')
}
