import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

/**
 * Native Drawer surfaces. Motion is Reanimated's (plan N0, Decision 4): these
 * styles draw the panel and backdrop, the animated views around them move them.
 */
export const nativeStyles = css.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrim: {
    backgroundColor: colors.scrim,
  },
  // The ramp scrim: bands stacked at the bottom edge, each a step more opaque than the last.
  rampStack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  rampBand: (height: number, opacity: number) => ({
    height,
    opacity,
    backgroundColor: colors.scrim,
  }),
  panel: {
    flexGrow: 1,
    backgroundColor: colors.bgCard,
    boxShadow: shadows.lg,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  panelBottom: {
    borderTopWidth: borders.hairline,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  panelRight: {
    borderLeftWidth: borders.hairline,
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
  },
  panelLeft: {
    borderRightWidth: borders.hairline,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
  },
  // A floating panel: a border and rounded corners all round, a lighter shadow than a modal's.
  panelFloating: {
    boxShadow: shadows.md,
    borderTopWidth: borders.hairline,
    borderRightWidth: borders.hairline,
    borderBottomWidth: borders.hairline,
    borderLeftWidth: borders.hairline,
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderTopColor: colors.borderStrong,
    borderRightColor: colors.borderStrong,
    borderBottomColor: colors.borderStrong,
    borderLeftColor: colors.borderStrong,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },
  // The side grabber's hit area and its vertical bar (the bottom grabber's, turned).
  grabberHitSide: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    paddingLeft: spacing.ms,
    paddingRight: spacing.ms,
  },
  grabberVertical: {
    width: sizes.sheetGrabberH,
    height: sizes.sheetGrabberW,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  // The safe-area insets (and a snap sheet's overshoot skirt), as padding.
  insets: (top: number, bottom: number) => ({paddingTop: top, paddingBottom: bottom}),
  // The Body's padding inside its ScrollView (no flex: it sizes to content).
  bodyContent: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
  },
  bodyFlush: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  // A snap sheet resting below its largest detent: its lower part is off
  // screen, so the list scrolls that far further to show its end.
  hiddenBelow: (height: number) => ({paddingBottom: height}),
})
