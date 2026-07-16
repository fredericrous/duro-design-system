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
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':hover': colors.accent,
    },
    borderRadius: radii.sm,
    cursor: 'pointer',
    transitionProperty: 'border-color',
    transitionDuration: duration.fast,
  },
  value: {
    color: colors.text,
  },
  placeholder: {
    color: colors.textMuted,
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    color: colors.textMuted,
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 49,
    // The portal mount is pointer-events: none, so re-enable here to catch
    // outside clicks that close the popup.
    pointerEvents: 'auto',
  },
  popup: {
    // Position is `fixed` and top/left/minWidth are applied inline by Popup
    // (computed from the trigger's bounding rect) so the dropdown escapes any
    // ancestor with `overflow: hidden` / `transform` (notably inside a Dialog).
    position: 'fixed',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    boxShadow: shadows.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    minWidth: 120,
    maxHeight: 280,
    overflowY: 'auto',
    zIndex: 50,
    // Re-enable pointer events: the portal mount is pointer-events: none.
    pointerEvents: 'auto',
  },
  popupPosition: (top: number, left: number, minWidth: number) => ({
    top,
    left,
    minWidth,
  }),
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
    borderRadius: radii.sm,
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
  hidden: {
    display: 'none',
  },
})
