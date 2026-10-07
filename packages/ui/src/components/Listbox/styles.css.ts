import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {duration} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  popup: {
    // Fixed, with top/left (and width) applied inline from the anchor's rect,
    // so the list escapes any ancestor with overflow: hidden or a transform.
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
    overflowY: 'auto',
    // Above Dialog/Drawer (1000/1001): they portal into the same mount.
    zIndex: 1050,
    // The portal mount is pointer-events: none; the list takes them back.
    pointerEvents: 'auto',
  },
  // A list that does not take the anchor's width (an editor typeahead).
  ownWidth: {
    minWidth: sizes.popupMinW,
  },
  maxHeightListMaxH: {
    maxHeight: sizes.listMaxH,
  },
  maxHeightListMaxHSm: {
    maxHeight: sizes.listMaxHSm,
  },
  position: (top: number, left: number) => ({
    top,
    left,
  }),
  width: (width: number) => ({
    width,
  }),
  option: {
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
  optionSelected: {
    color: colors.accent,
    fontWeight: typography.fontWeightMedium,
  },
  // The fill is the highlight; the transparent outline is what forced-colors
  // mode paints, where fills are dropped.
  optionHighlighted: {
    backgroundColor: colors.bgCardHover,
    outlineStyle: 'solid',
    outlineWidth: borders.focusRing,
    outlineColor: 'transparent',
    outlineOffset: `calc(-1 * ${borders.focusRing})`,
  },
  optionDisabled: {
    color: colors.textMuted,
    cursor: 'default',
  },
  empty: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontSize: typography.fontSizeSm,
    fontFamily: typography.fontFamily,
    color: colors.textMuted,
  },
})
