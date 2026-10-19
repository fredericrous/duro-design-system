import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

/**
 * SplitPane, the picked B0 direction (docs/mockups/split-pane/Hairline.dc.html):
 * a hairline between the panes inside a wider hit area; hover, keyboard
 * focus or a drag thicken it to the accent and show a grip.
 */
export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
    height: '100%',
  },
  // Below `collapseBelow`: one column, the panes stacked, no handle.
  rootStacked: {
    flexDirection: 'column',
    height: 'auto',
  },
  primary: {
    flexShrink: 0,
    minWidth: 0,
    overflow: 'auto',
  },
  // Collapsed: only a strip is left, so nothing spills out of it.
  primaryStrip: {
    position: 'relative',
    overflow: 'hidden',
  },
  // The collapsed pane's own children: mounted, so their state is kept, but
  // out of sight, out of the tab order (with `inert`) and unclickable.
  stowed: {
    position: 'absolute',
    top: 0,
    left: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
  },
  // The primary pane's children wrapper, unstowed: it fills the pane.
  fill: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  primarySize: (px: number) => ({width: px}),
  secondary: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0,
    overflow: 'auto',
  },
  stackedPane: {
    width: '100%',
    overflow: 'visible',
  },
  handle: {
    position: 'relative',
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    width: spacing.sm,
    cursor: 'col-resize',
    touchAction: 'none',
    userSelect: 'none',
    outlineStyle: 'none',
  },
  line: {
    width: borders.hairline,
    height: '100%',
    backgroundColor: colors.border,
    transitionProperty: 'background-color, width',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  lineActive: {
    width: borders.strong,
    backgroundColor: colors.accent,
  },
  grip: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: spacing.xs,
    height: spacing.xl,
    borderRadius: radii.full,
    backgroundColor: colors.textMuted,
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: duration.fast,
  },
  gripShown: {
    opacity: 1,
  },
})
