import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.sm,
    cursor: 'pointer',
    fontSize: typography.fontSizeSm,
    color: colors.text,
    lineHeight: typography.lineHeight,
  },
  rootDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  track: {
    position: 'relative',
    width: 36,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 0,
    padding: 0,
    cursor: 'inherit',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    outlineWidth: {default: 0, ':focus-visible': 2},
    outlineStyle: 'solid',
    outlineColor: colors.accent,
    outlineOffset: 2,
    flexShrink: 0,
  },
  trackUnchecked: {
    backgroundColor: {
      default: colors.border,
      ':hover': colors.textMuted,
    },
  },
  trackChecked: {
    backgroundColor: {
      default: colors.success,
      ':hover': colors.successText,
    },
  },
  thumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: '#fff',
    transitionProperty: 'transform',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
  },
  thumbChecked: {
    transform: 'translateX(16px)',
  },
  input: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
})
