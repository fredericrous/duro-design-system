import {css} from 'react-strict-dom'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'

export const styles = css.create({
  // Sticky within the viewport, and its own scroll box when taller than the
  // room it has, so a long table of contents never runs off the screen.
  // alignSelf: as a grid or flex item it would otherwise stretch to the
  // row's height and have nowhere to stick. The raised layer keeps it over
  // content that scrolls under it.
  root: {
    position: 'sticky',
    alignSelf: 'start',
    zIndex: layers.raised,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    minWidth: 0,
  },
  // The gap above it while stuck, and the same gap kept below it.
  offsetXs: {top: spacing.xs, maxHeight: `calc(100dvh - 2 * ${spacing.xs})`},
  offsetSm: {top: spacing.sm, maxHeight: `calc(100dvh - 2 * ${spacing.sm})`},
  offsetMs: {top: spacing.ms, maxHeight: `calc(100dvh - 2 * ${spacing.ms})`},
  offsetMd: {top: spacing.md, maxHeight: `calc(100dvh - 2 * ${spacing.md})`},
  offsetLg: {top: spacing.lg, maxHeight: `calc(100dvh - 2 * ${spacing.lg})`},
  offsetXl: {top: spacing.xl, maxHeight: `calc(100dvh - 2 * ${spacing.xl})`},
  offsetXxl: {top: spacing.xxl, maxHeight: `calc(100dvh - 2 * ${spacing.xxl})`},
  offsetXxxl: {top: spacing.xxxl, maxHeight: `calc(100dvh - 2 * ${spacing.xxxl})`},
})
