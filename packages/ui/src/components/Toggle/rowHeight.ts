/**
 * The fixed block size of a Toggle in a wrapping group, per size, and under a
 * coarse pointer. One source for ToggleGroup's `maxRows` arithmetic and the
 * stories that measure it.
 *
 * holds-until: StyleX can import a constant into a static style. Toggle's
 * `styles.css.ts` must repeat these numbers in its `wrapped*` heights. The
 * ToggleGroup stories (small, default) and the Drawer coarse-pointer story
 * measure a rendered toggle against this module to ±0.5px, so a drift in
 * either file fails a test rather than a layout.
 */
export const ROW_HEIGHT = {small: 28, default: 39, coarse: 44} as const
