import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

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
  // The safe-area insets (and a snap sheet's overshoot skirt), as padding.
  insets: (top: number, bottom: number) => ({paddingTop: top, paddingBottom: bottom}),
  // The Body's padding inside its ScrollView (no flex: it sizes to content).
  bodyContent: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
  },
  // A snap sheet resting below its largest detent: its lower part is off
  // screen, so the list scrolls that far further to show its end.
  hiddenBelow: (height: number) => ({paddingBottom: height}),
})
