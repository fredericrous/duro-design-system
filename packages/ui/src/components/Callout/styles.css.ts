import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  base: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
  },
  // Vertically centres the icon with the message — the right default for the
  // short, single/two-line messages callouts usually carry.
  alignCenter: {
    alignItems: 'center',
  },
  // Aligns the icon to the first line — for long, multi-paragraph messages.
  alignStart: {
    alignItems: 'flex-start',
  },
  icon: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    minWidth: 0,
  },
  error: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
    color: colors.errorText,
  },
  success: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
    color: colors.successText,
  },
  warning: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    color: colors.warningText,
  },
  info: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    color: colors.infoText,
  },
})
