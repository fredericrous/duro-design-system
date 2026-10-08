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
  root: {
    position: 'relative',
    display: 'inline-flex',
  },
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
  // Toolbar trigger: no border or fill until hover, at least icon-button size.
  triggerGhost: {
    justifyContent: 'center',
    minWidth: sizes.iconButton,
    minHeight: sizes.iconButton,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    borderColor: 'transparent',
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
  // A small ghost trigger keeps the ghost's xs padding at the small icon-button size.
  triggerGhostSmall: {
    fontSize: typography.fontSizeXs,
    minWidth: sizes.iconButtonSm,
    minHeight: {default: sizes.iconButtonSm, '@media (pointer: coarse)': sizes.touchTarget},
  },
  popup: {
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: colors.bgCard,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    boxShadow: shadows.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    minWidth: sizes.popupMinW,
    maxHeight: sizes.listMaxH,
    overflowY: 'auto',
    // Above Dialog/Drawer (1000/1001), like Select and Combobox: they portal
    // into the same mount, so a menu opened inside a dialog must out-rank it.
    zIndex: layers.popup,
    // The portal layer is pointer-events: none so clicks fall through it;
    // the popup takes them back.
    pointerEvents: 'auto',
    outlineStyle: 'none',
  },
  popupPosition: (top: number, left: number) => ({
    top,
    left,
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
  // The fill is the highlight; the transparent outline is what forced-colors
  // mode paints, where fills are dropped.
  itemHighlighted: {
    backgroundColor: colors.bgCardHover,
    outlineStyle: 'solid',
    outlineWidth: borders.focusRing,
    outlineColor: 'transparent',
    outlineOffset: `calc(-1 * ${borders.focusRing})`,
  },
  separator: {
    height: 0,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    borderTopWidth: borders.hairline,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  linkItem: {
    textDecoration: 'none',
    color: {
      default: colors.text,
      ':hover': colors.text,
    },
  },
})
