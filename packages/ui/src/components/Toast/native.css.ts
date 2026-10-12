import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

/**
 * The native toast, the picked B0 direction (docs/mockups/native-toast/
 * Tinted.dc.html): a card with a status-coloured edge, one row of message,
 * action and close. Motion is Reanimated's.
 */
export const nativeStyles = css.create({
  region: {
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
  // The bottom safe-area inset and the keyboard, plus the edge spacing.
  regionBottom: (bottom: number) => ({bottom}),
  toast: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: sizes.toastMaxW,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingRight: spacing.sm,
    paddingLeft: spacing.md,
    borderRadius: radii.md,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderLeftWidth: borders.accent,
    backgroundColor: colors.bgCard,
    boxShadow: shadows.md,
  },
  success: {borderLeftColor: colors.successBorder},
  error: {borderLeftColor: colors.errorBorder},
  info: {borderLeftColor: colors.infoBorder},
  warning: {borderLeftColor: colors.warningBorder},
  message: {
    flexGrow: 1,
    flexShrink: 1,
    color: colors.text,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
  },
  action: {
    display: 'flex',
    padding: spacing.sm,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: colors.accent,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
  },
  close: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radii.sm,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
})
