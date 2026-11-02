const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Moves focus to the first focusable thing inside `element` (a row, a step's rows). */
export function focusFirstIn(element: HTMLElement | null) {
  element?.querySelector<HTMLElement>(FOCUSABLE)?.focus({preventScroll: true})
}
