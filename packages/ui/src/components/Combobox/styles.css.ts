import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {duration} from '@duro-app/tokens/tokens/motion.css'

export const styles = css.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
  },
  inputWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':hover': colors.accent,
    },
    borderRadius: radii.sm,
    transitionProperty: 'border-color',
    transitionDuration: duration.fast,
  },
  inputWrapperFocused: {
    borderColor: colors.accent,
  },
  input: {
    flex: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    backgroundColor: 'transparent',
    borderWidth: 0,
    outline: 'none',
    minWidth: 0,
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: colors.textMuted,
    cursor: 'pointer',
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 49,
  },
  popup: {
    // Position is `fixed` and the top/left/width are applied inline by Popup
    // (computed from the root's bounding rect) so the dropdown can escape any
    // ancestor with `overflow: hidden` or `transform` (e.g. inside a Dialog).
    position: 'fixed',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    boxShadow: shadows.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    maxHeight: 200,
    overflowY: 'auto',
    // Re-enable pointer events: the portal mount is pointer-events: none so
    // clicks fall through except on the popup itself.
    pointerEvents: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontSize: typography.fontSizeSm,
    fontFamily: typography.fontFamily,
    color: colors.text,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    transitionProperty: 'background-color',
    transitionDuration: duration.fast,
  },
  itemSelected: {
    color: colors.accent,
    fontWeight: typography.fontWeightMedium,
  },
  itemHighlighted: {
    backgroundColor: colors.bgCardHover,
  },
  itemHidden: {
    display: 'none',
  },
  empty: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontSize: typography.fontSizeSm,
    color: colors.textMuted,
  },
  hidden: {
    display: 'none',
  },
  // Dynamic position — applied at runtime from the input's bounding rect.
  popupPosition: (top: number, left: number, width: number) => ({
    top,
    left,
    width,
  }),
})
