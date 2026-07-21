import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {breakpoints} from '@duro-app/tokens/tokens/breakpoints.css'

// Container-query thresholds, from the shared breakpoint scale. `sm` (640px)
// is the single "card up" line used across every table (Table + VirtualTable);
// below it dense tables become cards, above it they stay tabular and scroll
// horizontally. `md` (768px) is the compact band (tighter padding, nowrap
// headers). These are inlined into the @container query text at build time.
const COMPACT_BP = breakpoints.md
const STACK_BP = breakpoints.sm

export const styles = css.create({
  // Outer wrapper that hosts the @container query. Wraps SortChip + Root
  // + Pagination so all three react to the same width. Root itself does
  // NOT carry containerType — keeping a single query target per Table.
  //
  // @deprecated Use Table.Root's sortChip/pagination slot props instead.
  // This style backs the deprecated <Table.Container> wrapper.
  container: {
    containerType: 'inline-size',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },

  // The same containment chrome, but applied by Root when responsive=true.
  // Mirrors `container` so consumers don't need to wrap manually.
  rootContainer: {
    containerType: 'inline-size',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },

  // Applied when Row receives an `onClick` handler. Cursor signals clickability;
  // the :focus-visible outline meets WCAG 2.4.7 for keyboard navigation.
  clickableRow: {
    cursor: 'pointer',
    outlineWidth: {
      default: 0,
      ':focus-visible': 2,
    },
    outlineStyle: 'solid',
    outlineColor: colors.accent,
    outlineOffset: -2,
  },

  // Root — the single grid container for the table itself
  root: {
    display: 'grid',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
    fontFamily: typography.fontFamily,
    color: colors.text,
  },

  // Stack-mode override: the Root's grid collapses to a single column so
  // each Row spans full width and stacks vertically.
  // NOTE: gridTemplateColumns is intentionally absent here. It is handled by
  // gridColumnsResponsive() so that StyleX conflict resolution does not remove
  // the explicit column template (a later style with the same property key
  // always wins, so combining gridColumns + rootResponsive in one array would
  // silently drop the column template).
  rootResponsive: {
    // Size the grid to its content so it can OVERFLOW the scroll wrapper
    // rather than shrink: `min-content` here is the sum of each column's
    // minimum track (the minmax() floor / its content), so a dense table
    // grows past the container and Root's `scrollX` wrapper scrolls sideways.
    // In stack mode the grid is a single column, so drop the floor to let the
    // card fill the width instead of forcing a horizontal scrollbar.
    minWidth: {
      default: 'min-content',
      [`@container (max-width: ${STACK_BP})`]: 0,
    },
    // The card-list look needs the outer border to disappear in stack
    // mode — each row paints its own border.
    borderWidth: {
      default: 1,
      [`@container (max-width: ${STACK_BP})`]: 0,
    },
    backgroundColor: {
      default: colors.bgCard,
      [`@container (max-width: ${STACK_BP})`]: 'transparent',
    },
    overflow: {
      default: 'hidden',
      [`@container (max-width: ${STACK_BP})`]: 'visible',
    },
    rowGap: {
      default: 0,
      [`@container (max-width: ${STACK_BP})`]: spacing.sm,
    },
  },

  // Header group — hidden entirely in stack mode
  header: {
    display: {
      default: 'grid',
      [`@container (max-width: ${STACK_BP})`]: 'none',
    },
    gridColumn: '1 / -1',
    gridTemplateColumns: 'subgrid',
    backgroundColor: colors.bgCard,
  },

  // Body group
  body: {
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: 'subgrid',
  },

  // Row — spans all columns. In stack mode its template flips to 1fr so
  // children stack as grid items in a single column (we keep grid context
  // so cells with `gridColumn` overrides still compute).
  row: {
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: {
      default: 'subgrid',
      [`@container (max-width: ${STACK_BP})`]: '1fr',
    },
    borderBottomWidth: {
      default: 1,
      [`@container (max-width: ${STACK_BP})`]: 0,
    },
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  bodyRow: {
    backgroundColor: {
      default: 'transparent',
      [`@container (max-width: ${STACK_BP})`]: colors.bgCard,
      ':hover': colors.bgCardHover,
    },
    transitionProperty: 'background-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    // Stack-mode card chrome
    padding: {
      default: 0,
      [`@container (max-width: ${STACK_BP})`]: spacing.sm,
    },
    borderRadius: {
      default: 0,
      [`@container (max-width: ${STACK_BP})`]: radii.sm,
    },
    borderWidth: {
      default: 0,
      [`@container (max-width: ${STACK_BP})`]: 1,
    },
    borderStyle: 'solid',
    borderColor: colors.border,
  },

  // Header cell — keeps headers on a single line in compact mode
  headerCell: {
    fontWeight: typography.fontWeightSemibold,
    color: colors.textMuted,
    textAlign: 'start',
    // Match the body cell: shrink inside the track + wrap, so header labels
    // don't overlap when many columns are cramped.
    minWidth: 0,
    overflowWrap: 'break-word',
    whiteSpace: {
      default: 'normal',
      [`@container (max-width: ${COMPACT_BP})`]: 'nowrap',
    },
  },

  // Body cell. Text wraps by default — preferring "wrap to a 2nd line" over
  // "truncate with ellipsis" matches BI/data-reporting conventions where
  // hiding content (even with a visual hint) is treated as data loss.
  // Consumers that explicitly want single-line truncation use Text's
  // `truncate` prop, which sets its own nowrap + overflow + ellipsis chain
  // on the Text element itself. Buttons and badges already enforce
  // `white-space: nowrap` internally, so they're unaffected by this
  // default. In stack mode the cell becomes a 2-column grid for
  // label / value.
  cell: {
    color: colors.text,
    display: {
      default: 'flex',
      [`@container (max-width: ${STACK_BP})`]: 'grid',
    },
    alignItems: 'center',
    // Always let the cell shrink inside its `minmax(0, 1fr)` track. Previously
    // this was `auto` in the default (wide) band on the assumption there's
    // "enough room" — but a table with many columns (or wide content) whose
    // combined intrinsic width exceeds the container then can't shrink, so
    // content spills its track and overlaps the next column. `0` + the
    // wrapping below keeps every cell inside its column at any width.
    minWidth: 0,
    overflow: {
      // Safety against pathological unbreakable content (long URLs,
      // dataless ids) at narrow widths.
      default: 'visible',
      [`@container (max-width: ${COMPACT_BP})`]: 'hidden',
    },
    whiteSpace: 'normal',
    // Break long unbreakable tokens (emails, UUIDs) so they wrap within the
    // column instead of forcing it wider / overflowing.
    overflowWrap: 'break-word',
    gridTemplateColumns: {
      default: null,
      [`@container (max-width: ${STACK_BP})`]: '1fr 2fr',
    },
    gap: {
      default: 0,
      [`@container (max-width: ${STACK_BP})`]: spacing.sm,
    },
  },

  // Wrapper around a (non-actions) cell's value. A raw text node is an
  // anonymous flex item with `min-width: auto`, so it refuses to shrink and
  // overflows its column even when the cell itself can shrink. Giving the value
  // its own `min-width: 0` flex item lets the text wrap inside the column.
  cellValue: {
    minWidth: 0,
    flexGrow: 1,
    overflowWrap: 'break-word',
  },

  // Label rendered as a real <span> inside each cell. Display:none in
  // default/compact, shown only in stack — matches StyleX guidance to
  // prefer real elements over ::before/::after for non-shadow-DOM cases.
  cellLabel: {
    display: {
      default: 'none',
      [`@container (max-width: ${STACK_BP})`]: 'block',
    },
    color: colors.textMuted,
    fontWeight: typography.fontWeightMedium,
    fontSize: typography.fontSizeXs,
  },

  // Actions cell. In default/compact behaves like any cell. In stack
  // mode: full-width footer of the card, right-aligned, with a top
  // separator. Label span is suppressed in JSX (Cell does not render it
  // when isActions=true).
  cellActions: {
    gridTemplateColumns: {
      default: null,
      [`@container (max-width: ${STACK_BP})`]: '1fr',
    },
    justifyContent: {
      default: null,
      [`@container (max-width: ${STACK_BP})`]: 'flex-end',
    },
    marginTop: {
      default: 0,
      [`@container (max-width: ${STACK_BP})`]: spacing.sm,
    },
    paddingTop: {
      default: null,
      [`@container (max-width: ${STACK_BP})`]: spacing.sm,
    },
    borderTopWidth: {
      default: 0,
      [`@container (max-width: ${STACK_BP})`]: 1,
    },
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },

  // Size: sm
  cellSm: {
    paddingTop: {
      default: spacing.xs,
      [`@container (max-width: ${COMPACT_BP})`]: spacing.xs,
    },
    paddingBottom: {
      default: spacing.xs,
      [`@container (max-width: ${COMPACT_BP})`]: spacing.xs,
    },
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    fontSize: typography.fontSizeXs,
  },
  // Size: md
  cellMd: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: {
      default: spacing.md,
      [`@container (max-width: ${COMPACT_BP})`]: spacing.sm,
    },
    paddingRight: {
      default: spacing.md,
      [`@container (max-width: ${COMPACT_BP})`]: spacing.sm,
    },
    fontSize: typography.fontSizeSm,
  },

  // Variant: striped (even body rows). Suppressed in stack — cards have
  // their own surface and zebra-striping reads as a bug there.
  stripedEven: {
    backgroundColor: {
      default: colors.bgCardHover,
      [`@container (max-width: ${STACK_BP})`]: colors.bgCard,
      ':hover': colors.bgCardHover,
    },
  },

  // Variant: bordered (cells get side borders). Suppressed in stack.
  borderedCell: {
    borderRightWidth: {
      default: 1,
      [`@container (max-width: ${STACK_BP})`]: 0,
    },
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
  },
  borderedCellLast: {
    borderRightWidth: 0,
  },

  // SortChip — visible only in stack mode
  sortChip: {
    display: {
      default: 'none',
      [`@container (max-width: ${STACK_BP})`]: 'inline-flex',
    },
    alignSelf: 'flex-start',
  },

  // Horizontal-scroll frame around the grid (responsive path). Above the
  // stack breakpoint the grid keeps each column at least `minColumnWidth`
  // wide (see the minmax() template), so a dense table overflows and this
  // wrapper scrolls sideways instead of crushing its cells — the standard
  // data-table behavior. In stack mode the grid collapses to one column, so
  // nothing overflows and no scrollbar appears.
  scrollX: {
    overflowX: 'auto',
    // Contain the scroll to this axis; vertical growth (rows) is natural.
    overflowY: 'visible',
    // Momentum scroll on touch + a stable gutter so the layout doesn't jump
    // when the scrollbar shows.
    WebkitOverflowScrolling: 'touch',
  },

  // Positioning context for the scroll-affordance edge fades, which sit on
  // top of the scroll port (not inside it, so they don't scroll away).
  scrollFrame: {
    position: 'relative',
  },
  // A soft fade pinned to a scroll edge that hints "there's more this way".
  // It fades the content into the surface colour, so it reads in any theme.
  // Toggled by opacity from JS scroll position; pointer-events off so it
  // never eats clicks. Sits just inside the rounded frame border.
  edgeFade: {
    position: 'absolute',
    top: 1,
    bottom: 1,
    width: spacing.xl,
    pointerEvents: 'none',
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  edgeFadeLeft: {
    left: 1,
    borderTopLeftRadius: radii.md,
    borderBottomLeftRadius: radii.md,
    backgroundImage: `linear-gradient(to left, transparent, ${colors.bgCard})`,
  },
  edgeFadeRight: {
    right: 1,
    borderTopRightRadius: radii.md,
    borderBottomRightRadius: radii.md,
    backgroundImage: `linear-gradient(to right, transparent, ${colors.bgCard})`,
  },
  edgeFadeVisible: {
    opacity: 1,
  },

  // Dynamic: grid columns applied on Root (non-responsive path only).
  gridColumns: (template: string) => ({
    gridTemplateColumns: template,
  }),

  // Dynamic: grid columns at three tiers (default / compact / stack) in
  // one style. Used instead of gridColumns() when responsive=true so that
  // every gridTemplateColumns rule lives in the same StyleX style object —
  // splitting them would let StyleX's conflict resolution drop the
  // earlier classes (the LAST style wins per property key).
  //
  // - default: balanced multi-column layout for desktop widths
  // - compact band (STACK_BP < width ≤ COMPACT_BP): consumer-supplied
  //   "compact" template. This is written as an explicit RANGE, not just
  //   `max-width: COMPACT_BP`, so it does NOT also match below STACK_BP —
  //   otherwise both the compact and the stack rule would set
  //   gridTemplateColumns at card widths and StyleX's ordering could let the
  //   (wider, 4-column) compact template shadow the single-column stack one.
  // - @container (max-width: STACK_BP): collapse to a single column so
  //   each row becomes a card
  gridColumnsResponsive: (template: string, compactTemplate: string) => ({
    gridTemplateColumns: {
      default: template,
      [`@container (${STACK_BP} < width <= ${COMPACT_BP})`]: compactTemplate,
      [`@container (max-width: ${STACK_BP})`]: '1fr',
    },
  }),
})
