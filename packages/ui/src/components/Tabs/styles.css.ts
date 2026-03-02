import {css} from 'react-strict-dom'
import {colors, radii, spacing, typography} from '@duro-app/tokens'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  rootVertical: {
    flexDirection: 'row',
  },
  list: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  listVertical: {
    flexDirection: 'column',
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
    gap: 0,
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: {
      default: colors.textMuted,
      ':hover': colors.text,
    },
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    cursor: 'pointer',
    transitionProperty: 'color, border-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
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
    outlineOffset: {
      default: 0,
      ':focus-visible': -2,
    },
  },
  tabVertical: {
    justifyContent: 'flex-start',
    borderBottomWidth: 0,
    borderRightWidth: 2,
    borderRightStyle: 'solid',
    borderRightColor: 'transparent',
  },
  tabActiveHorizontal: {
    color: colors.text,
    borderBottomColor: colors.accent,
  },
  tabActiveVertical: {
    color: colors.text,
    borderRightColor: colors.accent,
  },
  tabDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    color: colors.textMuted,
  },
  panel: {
    paddingTop: spacing.md,
  },
  panelVertical: {
    paddingTop: 0,
    paddingLeft: spacing.md,
  },
})
