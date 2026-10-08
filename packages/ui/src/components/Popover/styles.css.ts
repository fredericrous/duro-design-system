import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {duration} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'

export const styles = css.create({
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color',
    transitionDuration: duration.fast,
  },
  // size="small": Toggle sizeSmall's values, as longhands so they win over the
  // trigger's own longhands. Every small control is at least controlSm tall,
  // whatever it holds, and the touch target under a coarse pointer.
  triggerSmall: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    fontSize: typography.fontSizeXs,
    minHeight: {default: sizes.controlSm, '@media (pointer: coarse)': sizes.touchTarget},
  },
  // Inside a Dialog or Drawer: above that modal (same portal mount), below a
  // Select or Menu opened from inside the Popover.
  popupInModal: {
    zIndex: layers.popover,
  },
  // `raised`: over another floating surface, outside a modal (still under a
  // Dialog or Drawer opened later) and inside one (still under its popups).
  popupRaised: {
    zIndex: layers.floatingRaised,
  },
  popupInModalRaised: {
    zIndex: layers.popoverRaised,
  },
  popup: {
    position: 'fixed',
    top: 0,
    left: 0,
    boxSizing: 'border-box',
    backgroundColor: colors.bgCard,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    boxShadow: shadows.md,
    padding: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    // Outside a modal: floating chrome, so a Dialog or Drawer opened later
    // (even from inside this Popover) covers it.
    zIndex: layers.floating,
    // The portal layer is pointer-events: none so clicks fall through it;
    // the popup takes them back.
    pointerEvents: 'auto',
  },
  close: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    borderWidth: 0,
    borderRadius: radii.sm,
    cursor: 'pointer',
  },
  // Dynamic position — applied at runtime from the measured anchor.
  popupPosition: (top: number, left: number) => ({
    top,
    left,
  }),
})
