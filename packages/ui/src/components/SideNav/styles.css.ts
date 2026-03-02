import {css} from 'react-strict-dom'
import {colors, spacing, radii, typography} from '@duro-app/tokens'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
  },
  groupTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: {
      default: colors.textMuted,
      ':hover': colors.text,
    },
    backgroundColor: 'transparent',
    borderWidth: 0,
    cursor: 'pointer',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
  },
  groupTriggerActive: {
    color: colors.text,
  },
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    transitionProperty: 'transform',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
  },
  chevronOpen: {
    transform: 'rotate(90deg)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightNormal,
    color: {
      default: colors.textMuted,
      ':hover': colors.text,
    },
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    borderWidth: 0,
    borderRadius: radii.sm,
    cursor: 'pointer',
    transitionProperty: 'color, background-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    textAlign: 'left' as const,
    outlineWidth: {
      default: 0,
      ':focus-visible': 2,
    },
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus-visible': colors.accent,
    },
  },
  itemActive: {
    color: colors.accent,
    fontWeight: typography.fontWeightMedium,
  },
})
