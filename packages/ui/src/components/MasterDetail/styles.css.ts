import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {breakpoints} from '@duro-app/tokens/tokens/breakpoints.css'

// Below this width the rail stacks above the detail (native: `stacked`, from the window width).
const STACK = `@media (max-width: ${breakpoints.sm})`

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: {default: 'row', [STACK]: 'column'},
    minWidth: 0,
    minHeight: 0,
    // Split, the rail and the detail scroll on their own; stacked, the Root
    // scrolls them as one, as Happier's stacked picker does.
    overflowX: 'hidden',
    overflowY: {default: 'hidden', [STACK]: 'auto'},
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
  },
  rootStacked: {
    flexDirection: 'column',
  },
  // Dynamic style: simple identifier params only (StyleX constraint)
  rootMaxHeight: (maxHeight: number | string) => ({
    maxHeight,
  }),
  rail: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    flexShrink: 0,
    minHeight: 0,
    overflowY: {default: 'auto', [STACK]: 'visible'},
    borderRightWidth: {default: borders.hairline, [STACK]: 0},
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
    borderBottomWidth: {default: 0, [STACK]: borders.hairline},
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  railStacked: {
    width: '100%',
    maxWidth: 'none',
    borderRightWidth: 0,
    borderBottomWidth: borders.hairline,
  },
  railWidth: (width: number | string) => ({
    width: {default: width, [STACK]: '100%'},
    maxWidth: {default: '30%', [STACK]: 'none'},
  }),
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.ms,
    paddingRight: spacing.ms,
  },
  sectionTitle: {
    margin: 0,
    minWidth: 0,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeight,
    color: colors.textMuted,
  },
  sectionCount: {
    flexShrink: 0,
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.xs,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
  },
  itemFocused: {
    backgroundColor: colors.bgCardHover,
  },
  itemDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  itemButton: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.ms,
    paddingRight: spacing.xs,
    textAlign: 'start',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: radii.xs,
    cursor: 'pointer',
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineColor: {default: 'transparent', ':focus-visible': colors.accent},
    outlineOffset: {default: 0, ':focus-visible': `calc(-1 * ${borders.focusOffset})`},
  },
  // One line, cut with an ellipsis: a narrow rail never breaks a name mid-word.
  itemLabel: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  itemCheck: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    color: colors.accent,
  },
  itemAction: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  detail: {
    flex: {default: 1, [STACK]: 'none'},
    minWidth: 0,
    minHeight: 0,
    overflowY: {default: 'auto', [STACK]: 'visible'},
    boxSizing: 'border-box',
    padding: spacing.md,
  },
  detailStacked: {
    flex: 'none',
  },
})
