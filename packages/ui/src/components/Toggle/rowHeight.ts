/**
 * The fixed block size of a Toggle in a wrapping group, per size, and under a
 * coarse pointer. One source for ToggleGroup's `maxRows` arithmetic and the
 * stories that measure it.
 *
 * holds-until: StyleX can import a constant into a static style. Toggle's
 * `styles.css.ts` must repeat these numbers in its `wrapped*` heights, and
 * the ToggleGroup stories measure the rendered toggles against this module,
 * so a drift fails a test rather than a layout.
 */
export const ROW_HEIGHT = {small: 28, default: 39, coarse: 44} as const
