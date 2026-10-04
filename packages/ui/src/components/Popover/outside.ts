// True when a pointerdown target lies outside the popup, the trigger and every
// ignored element. `inside` may hold nulls (refs not yet attached).
export function isOutsidePress(
  target: Node | null,
  inside: ReadonlyArray<Element | null>,
): boolean {
  if (!target) return true
  return !inside.some((el) => el != null && el.contains(target))
}
