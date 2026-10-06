import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
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
  box: {
    width: sizes.indicator,
    height: sizes.indicator,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderRadius: radii.xs,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transitionProperty: 'background-color, border-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  boxUnchecked: {
    backgroundColor: colors.bg,
    borderColor: {
      default: colors.border,
      ':hover': colors.textMuted,
    },
  },
  boxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  // Native-only checkmark: a small box showing just its right + bottom border,
  // rotated 45° into a tick. Pure CSS (RSD translates the transform string to
  // an RN transform), so no SVG / react-native-svg weight reaches web.
  checkmark: {
    width: sizes.checkMarkW,
    height: sizes.checkMarkH,
    borderRightWidth: borders.strong,
    borderRightStyle: 'solid',
    borderRightColor: colors.accentContrast,
    borderBottomWidth: borders.strong,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.accentContrast,
    transform: 'rotate(45deg)',
    marginTop: -2,
  },
  checkmarkVisible: {
    opacity: 1,
  },
  checkmarkHidden: {
    opacity: 0,
  },
  // Native label text — RN <Text> doesn't inherit color/size from the button
  // ancestor the way web inherits from <label>, so set it explicitly.
  labelText: {
    fontSize: typography.fontSizeSm,
    color: colors.text,
  },
  // Strip the default button chrome RSD gives <button> on native (border/bg/
  // padding mimic the browser default) so the row matches the web checkbox.
  nativeButton: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
  },
  // Layered on visuallyHidden.base: a native input is also made transparent.
  input: {
    opacity: 0,
  },
  // RSD-native only honors display:'flex' (not 'inline-flex'). Layered on
  // native via `isNative` (on both .root and .box); web keeps inline-flex.
  nativeFlex: {
    display: 'flex',
  },
})
