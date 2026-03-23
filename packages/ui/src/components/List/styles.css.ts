import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

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
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    transitionProperty: 'background-color',
    transitionDuration: '120ms',
    cursor: 'default',
  },
  itemSelected: {
    backgroundColor: {
      default: colors.bgCardHover,
      ':hover': colors.bgCardHover,
    },
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
    gap: 2,
    minWidth: 0,
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
