import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {microSpacing, radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

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
    width: sizes.switchTrackW,
    height: sizes.switchTrackH,
    borderRadius: radii.full,
    borderWidth: 0,
    padding: 0,
    cursor: 'inherit',
    transitionProperty: 'background-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: 'solid',
    outlineColor: colors.accent,
    outlineOffset: borders.focusOffset,
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
      default: colors.accent,
      ':hover': colors.accentHover,
    },
  },
  thumb: {
    position: 'absolute',
    top: microSpacing.px2,
    left: microSpacing.px2,
    width: sizes.switchThumb,
    height: sizes.switchThumb,
    borderRadius: radii.full,
    backgroundColor: colors.fixedLight,
    transitionProperty: 'transform',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  thumbChecked: {
    // Travel: the track less the thumb and both insets.
    transform: `translateX(calc(${sizes.switchTrackW} - ${sizes.switchThumb} - 2 * ${microSpacing.px2}))`,
  },
  // Layered on visuallyHidden.base: a native input is also made transparent.
  input: {
    opacity: 0,
  },
  // RSD-native only honors display:'flex' (not 'inline-flex'). Layered on
  // native via `isNative` so the flex container applies; web keeps inline-flex.
  nativeFlex: {
    display: 'flex',
  },
})
