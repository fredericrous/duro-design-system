import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

// Container-query thresholds. Picked for typical 5-7 column admin tables —
// see Table.stories.tsx "Responsive" for the visual reasoning. Defined
// once here so it's clear they're a design-system constant, not a magic
// number sprinkled across files.
const COMPACT_BP = '720px'
const STACK_BP = '440px'

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

  // --- JS-measured force-stack variants ---
  //
  // A container query can only test the container's WIDTH — it can't know
  // "6 columns won't fit here". So a dense table can be wider than STACK_BP
  // yet still crush every cell to a few characters. Table.Root measures the
  // container with a ResizeObserver and, when `width < columnCount ×
  // minColumnWidth`, sets `stacked` in context; each component then also
  // applies its `*Stacked` variant here. These mirror the values in the
  // `@container (max-width: ${STACK_BP})` branches above, so JS-forced and
  // CSS-driven stacking render identically. The @container base is kept as
  // the SSR-safe path for genuinely narrow (mobile) widths — no JS, no
  // hydration flash — while these handle the cramped medium-width case.
  rootStacked: {
    gridTemplateColumns: '1fr',
    borderWidth: 0,
    backgroundColor: 'transparent',
    overflow: 'visible',
    rowGap: spacing.sm,
  },
  headerStacked: {
    display: 'none',
  },
  rowStacked: {
    gridTemplateColumns: '1fr',
    borderBottomWidth: 0,
  },
  bodyRowStacked: {
    backgroundColor: {
      default: colors.bgCard,
      ':hover': colors.bgCardHover,
    },
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  cellStacked: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: spacing.sm,
  },
  cellLabelStacked: {
    display: 'block',
  },
  cellActionsStacked: {
    gridTemplateColumns: '1fr',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  borderedCellStacked: {
    borderRightWidth: 0,
  },
  sortChipStacked: {
    display: 'inline-flex',
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
  // - @container (max-width: COMPACT_BP): consumer-supplied "compact"
  //   template, e.g. give a badge column max-content and let the action
  //   column absorb the slack so its hint text fits on one line
  // - @container (max-width: STACK_BP): collapse to a single column so
  //   each row becomes a card
  gridColumnsResponsive: (template: string, compactTemplate: string) => ({
    gridTemplateColumns: {
      default: template,
      [`@container (max-width: ${COMPACT_BP})`]: compactTemplate,
      [`@container (max-width: ${STACK_BP})`]: '1fr',
    },
  }),
})
