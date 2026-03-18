import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'

export const styles = css.create({
  overlay: {
    position: 'fixed',
    bottom: spacing.lg,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
    boxShadow: shadows.lg,
    zIndex: 50,
    maxWidth: 'calc(100vw - 48px)',
  },
  overlayEmphasized: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  selectedCount: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    fontFamily: typography.fontFamily,
    color: colors.text,
    whiteSpace: 'nowrap',
  },
  selectedCountEmphasized: {
    color: colors.accentContrast,
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  closeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: radii.sm,
    color: {
      default: colors.textMuted,
      ':hover': colors.text,
    },
    cursor: 'pointer',
    transitionProperty: 'color, background-color',
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
      ':focus-visible': 2,
    },
  },
  closeButtonEmphasized: {
    color: {
      default: colors.accentContrast,
      ':hover': colors.accentContrast,
    },
    opacity: {
      default: 0.7,
      ':hover': 1,
    },
  },
  separator: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  separatorEmphasized: {
    backgroundColor: colors.accentContrast,
    opacity: 0.3,
  },
})
