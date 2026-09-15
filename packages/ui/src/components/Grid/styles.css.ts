import {css} from 'react-strict-dom'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {breakpoints} from '@duro-app/tokens/tokens/breakpoints.css'

// Where a split collapses to one column. A defineConsts string, inlined into
// the @media text at build time.
const SPLIT_BP = breakpoints.md

export const styles = css.create({
  base: {
    display: 'grid',
  },
  col1: {gridTemplateColumns: '1fr'},
  col2: {gridTemplateColumns: 'repeat(2, 1fr)'},
  col3: {gridTemplateColumns: 'repeat(3, 1fr)'},
  col4: {gridTemplateColumns: 'repeat(4, 1fr)'},
  col5: {gridTemplateColumns: 'repeat(5, 1fr)'},
  col6: {gridTemplateColumns: 'repeat(6, 1fr)'},
  autoFit: (minWidth: string) => ({
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
  }),
  // Asymmetric list/detail splits: a bounded first column, the rest for the
  // detail; one column below the md breakpoint. Static entries rather than a
  // parameter because the pair (widths + collapse point) is the design
  // decision — a screen picks a split, it does not tune one.
  split: {
    gridTemplateColumns: {
      default: '1fr',
      [`@media (min-width: ${SPLIT_BP})`]: 'minmax(240px, 1fr) minmax(0, 2fr)',
    },
  },
  splitWide: {
    gridTemplateColumns: {
      default: '1fr',
      [`@media (min-width: ${SPLIT_BP})`]: 'minmax(280px, 1fr) minmax(0, 3fr)',
    },
  },
  // Weighted columns: `[1, 2]` → `1fr 2fr` (see columns.ts).
  template: (tracks: string) => ({
    gridTemplateColumns: tracks,
  }),
  gapXs: {gap: spacing.xs},
  gapSm: {gap: spacing.sm},
  gapMs: {gap: spacing.ms},
  gapMd: {gap: spacing.md},
  gapLg: {gap: spacing.lg},
  gapXl: {gap: spacing.xl},
  gapXxl: {gap: spacing.xxl},
  gapXxxl: {gap: spacing.xxxl},

  // --- native only (see NativeGrid in Grid.tsx) -----------------------------
  // React Native honours `display: 'flex'` only, and RSD gives it web flex
  // semantics, so the row direction is explicit.
  nativeRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    // A definite width so percentage bases resolve in Yoga's measure pass;
    // against an auto width the line breaks come out wrong and the container
    // under-reports its height (verified on the iOS simulator).
    width: '100%',
  },
  // border-box is explicit: react-strict-dom mirrors the web default
  // (content-box) on native, which adds the gap padding on top of the basis
  // and overflows the row so every cell wraps.
  nativeCell: (basis: string) => ({
    flexBasis: basis,
    flexShrink: 0,
    boxSizing: 'border-box',
  }),
  // Auto-fit approximation: start at the minimum width, grow to fill. flexGrow
  // is fine here: this style is native-only, so RSD-web's forced flex-grow: 0
  // never applies.
  nativeMinCell: (minWidth: string) => ({
    flexBasis: minWidth,
    flexGrow: 1,
    boxSizing: 'border-box',
  }),
  cellGapLeftXs: {paddingLeft: spacing.xs},
  cellGapLeftSm: {paddingLeft: spacing.sm},
  cellGapLeftMs: {paddingLeft: spacing.ms},
  cellGapLeftMd: {paddingLeft: spacing.md},
  cellGapLeftLg: {paddingLeft: spacing.lg},
  cellGapLeftXl: {paddingLeft: spacing.xl},
  cellGapLeftXxl: {paddingLeft: spacing.xxl},
  cellGapLeftXxxl: {paddingLeft: spacing.xxxl},
  cellGapTopXs: {paddingTop: spacing.xs},
  cellGapTopSm: {paddingTop: spacing.sm},
  cellGapTopMs: {paddingTop: spacing.ms},
  cellGapTopMd: {paddingTop: spacing.md},
  cellGapTopLg: {paddingTop: spacing.lg},
  cellGapTopXl: {paddingTop: spacing.xl},
  cellGapTopXxl: {paddingTop: spacing.xxl},
  cellGapTopXxxl: {paddingTop: spacing.xxxl},
})
