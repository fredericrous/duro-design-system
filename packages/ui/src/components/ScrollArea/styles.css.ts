import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {microSpacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'

export const styles = css.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
  },
  viewport: {
    width: '100%',
    height: '100%',
    overflowX: 'auto',
    overflowY: 'auto',
    // Hide native scrollbar
    scrollbarWidth: 'none',
  },
  content: {
    minWidth: '100%',
    minHeight: '100%',
  },
  scrollbar: {
    position: 'absolute',
    zIndex: layers.raised,
    display: 'flex',
    touchAction: 'none',
    userSelect: 'none',
    transitionProperty: 'opacity',
    transitionDuration: duration.base,
    transitionTimingFunction: easing.standard,
  },
  scrollbarVertical: {
    top: 0,
    right: 0,
    bottom: 0,
    width: sizes.scrollbar,
    flexDirection: 'column',
    paddingTop: microSpacing.px2,
    paddingBottom: microSpacing.px2,
    paddingRight: microSpacing.px2,
  },
  scrollbarHorizontal: {
    left: 0,
    right: 0,
    bottom: 0,
    height: sizes.scrollbar,
    flexDirection: 'row',
    paddingLeft: microSpacing.px2,
    paddingRight: microSpacing.px2,
    paddingBottom: microSpacing.px2,
  },
  scrollbarHidden: {
    opacity: 0,
  },
  scrollbarVisible: {
    opacity: 1,
  },
  thumb: {
    position: 'relative',
    flex: 1,
    backgroundColor: {
      default: colors.border,
      ':hover': colors.textMuted,
    },
    borderRadius: radii.full,
    transitionProperty: 'background-color',
    transitionDuration: duration.fast,
  },
  // Dynamic styles — simple identifier params only (StyleX constraint)
  viewportMaxHeight: (maxHeight: number | string) => ({
    maxHeight,
  }),
  thumbVertical: (height: string, transform: string) => ({
    height,
    transform,
  }),
  thumbHorizontal: (width: string, transform: string) => ({
    width,
    transform,
  }),
})
