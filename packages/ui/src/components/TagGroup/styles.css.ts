import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  containerError: {},
  containerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // Static display (no Input) — no gap needed
  containerStatic: {
    gap: 0,
  },
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':focus': colors.accent,
    },
    borderRadius: radii.sm,
    backgroundColor: colors.bg,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
    color: colors.text,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    minHeight: 40,
    transitionProperty: 'border-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    outlineWidth: {
      default: 0,
      ':focus': 2,
    },
    outlineStyle: {
      default: 'none',
      ':focus': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus': colors.accent,
    },
    outlineOffset: {
      default: 0,
      ':focus': 1,
    },
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: {
      default: colors.error,
      ':focus': colors.error,
    },
  },
  liveRegion: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
})
