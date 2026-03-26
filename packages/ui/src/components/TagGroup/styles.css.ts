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
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':focus-within': colors.accent,
    },
    borderRadius: radii.sm,
    backgroundColor: colors.bg,
    minHeight: 40,
    transitionProperty: 'border-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    outlineWidth: {
      default: 0,
      ':focus-within': 2,
    },
    outlineStyle: {
      default: 'none',
      ':focus-within': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus-within': colors.accent,
    },
    outlineOffset: {
      default: 0,
      ':focus-within': 1,
    },
  },
  containerError: {
    borderColor: {
      default: colors.error,
      ':focus-within': colors.error,
    },
  },
  containerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // Static display (no Input) — no input-field border
  containerStatic: {
    borderWidth: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    minHeight: 0,
    backgroundColor: 'transparent',
    outlineWidth: 0,
  },
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 120,
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
    color: colors.text,
    outlineWidth: 0,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
  },
  liveRegion: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
})
