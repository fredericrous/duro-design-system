import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {microSpacing, radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration} from '@duro-app/tokens/tokens/motion.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  // --- Root ---
  root: {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
  },

  // --- Item ---
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.ms,
    paddingRight: spacing.ms,
    borderBottomWidth: borders.hairline,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    transitionProperty: 'background-color',
    transitionDuration: duration.quick,
    cursor: 'default',
  },
  itemSelected: {
    backgroundColor: {
      default: colors.bgCardHover,
      ':hover': colors.bgCardHover,
    },
  },
  itemClickable: {
    cursor: 'pointer',
  },
  itemDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  itemLast: {
    borderBottomWidth: 0,
  },

  // --- Item content area (text + description) ---
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: microSpacing.px2,
    minWidth: 0,
  },

  // The Content of a clickable Item: a button that reads as the row's text.
  contentButton: {
    alignItems: 'stretch',
    textAlign: 'start',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    font: 'inherit',
    color: 'inherit',
    cursor: 'inherit',
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineColor: {default: 'transparent', ':focus-visible': colors.accent},
    outlineOffset: {default: 0, ':focus-visible': borders.focusOffset},
    borderRadius: radii.xs,
  },

  // --- Primary text ---
  text: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeight,
    color: colors.text,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // --- Description text ---
  description: {
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeight,
    color: colors.textMuted,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // --- Actions slot ---
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },

  // --- Empty state ---
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    color: colors.textMuted,
    fontSize: typography.fontSizeSm,
  },
})
