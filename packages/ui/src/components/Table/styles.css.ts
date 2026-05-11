import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

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
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
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
    whiteSpace: {
      default: 'normal',
      [`@container (max-width: ${COMPACT_BP})`]: 'nowrap',
    },
  },

  // Body cell. In compact mode: nowrap + truncate. In stack mode:
  // becomes a 2-column grid for label / value.
  cell: {
    color: colors.text,
    display: {
      default: 'flex',
      [`@container (max-width: ${STACK_BP})`]: 'grid',
    },
    alignItems: 'center',
    minWidth: {
      default: 'auto',
      [`@container (max-width: ${COMPACT_BP})`]: 0,
    },
    overflow: {
      default: 'visible',
      [`@container (max-width: ${COMPACT_BP})`]: 'hidden',
    },
    textOverflow: {
      default: 'clip',
      [`@container (max-width: ${COMPACT_BP})`]: 'ellipsis',
    },
    whiteSpace: {
      default: 'normal',
      [`@container (max-width: ${COMPACT_BP})`]: 'nowrap',
      [`@container (max-width: ${STACK_BP})`]: 'normal',
    },
    gridTemplateColumns: {
      default: null,
      [`@container (max-width: ${STACK_BP})`]: '1fr 2fr',
    },
    gap: {
      default: 0,
      [`@container (max-width: ${STACK_BP})`]: spacing.sm,
    },
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

  // Dynamic: grid columns applied on Root (non-responsive path only).
  gridColumns: (template: string) => ({
    gridTemplateColumns: template,
  }),

  // Dynamic: grid columns + stack-mode collapse in one style.
  // Used instead of gridColumns() when responsive=true so that both the
  // explicit column template and the @container override live in the same
  // StyleX style object. If they were in separate styles (gridColumns +
  // rootResponsive), StyleX conflict resolution would keep only the LAST
  // style's gridTemplateColumns class and silently discard the earlier one.
  gridColumnsResponsive: (template: string) => ({
    gridTemplateColumns: {
      default: template,
      [`@container (max-width: ${STACK_BP})`]: '1fr',
    },
  }),
})
