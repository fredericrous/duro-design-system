import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  rootVertical: {
    flexDirection: 'row',
  },
  list: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    gap: spacing.xs,
    // Positioning context for the sliding indicator.
    position: 'relative',
  },
  listVertical: {
    flexDirection: 'column',
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
    gap: 0,
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: {
      default: colors.textMuted,
      ':hover': colors.text,
    },
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    cursor: 'pointer',
    transitionProperty: 'color, border-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    outlineWidth: {
      default: 0,
      ':focus-visible': 2,
    },
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus-visible': colors.accent,
    },
    outlineOffset: {
      default: 0,
      ':focus-visible': -2,
    },
  },
  tabVertical: {
    justifyContent: 'flex-start',
    borderBottomWidth: 0,
    borderRightWidth: 2,
    borderRightStyle: 'solid',
    borderRightColor: 'transparent',
  },
  tabActiveHorizontal: {
    color: colors.text,
    borderBottomColor: colors.accent,
  },
  tabActiveVertical: {
    color: colors.text,
    borderRightColor: colors.accent,
  },
  // Applied to the active tab once JS drives the sliding indicator: drop the
  // per-tab accent border so the single sliding bar is the only underline
  // (avoids a double line and an instant-pop that would undercut the slide).
  tabIndicatorActive: {
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // --- Sliding active indicator (positioned by measuring the active tab) ---
  indicator: {
    position: 'absolute',
    backgroundColor: colors.accent,
    pointerEvents: 'none',
    transitionProperty: 'transform, width, height',
    transitionDuration: duration.base,
    transitionTimingFunction: easing.easeOut,
  },
  indicatorHorizontal: {
    bottom: -1,
    left: 0,
    height: 2,
  },
  indicatorVertical: {
    right: -1,
    top: 0,
    width: 2,
  },
  // Dynamic transform/size from the measured active tab (StyleX dynamic style:
  // simple identifier params only).
  indicatorOffsetH: (offset: number, size: number) => ({
    transform: `translateX(${offset}px)`,
    width: size,
  }),
  indicatorOffsetV: (offset: number, size: number) => ({
    transform: `translateY(${offset}px)`,
    height: size,
  }),
  tabDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    color: colors.textMuted,
  },
  panel: {
    paddingTop: spacing.md,
  },
  panelVertical: {
    paddingTop: 0,
    paddingLeft: spacing.md,
  },
})
