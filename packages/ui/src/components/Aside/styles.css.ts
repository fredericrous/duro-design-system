import {css} from 'react-strict-dom'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'

// Kept in step with `--duro-app-shell-bar`, which AppShell/styles.css.ts sets (StyleX needs
// the literal here, so the name is spelled out twice).
const BAR = 'var(--duro-app-shell-bar, 0px)'

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
  // The gap above it while stuck, and the same gap kept below it. Inside
  // AppShell below its collapse point the sticky bar covers the top of the
  // viewport, and AppShell sets `--duro-app-shell-bar` to the bar's height (appBarH)
  // so the aside sticks under it; anywhere else the property is unset and
  // the fallback 0 leaves the offset alone.
  offsetXs: {
    top: `calc(${BAR} + ${spacing.xs})`,
    maxHeight: `calc(100dvh - ${BAR} - 2 * ${spacing.xs})`,
  },
  offsetSm: {
    top: `calc(${BAR} + ${spacing.sm})`,
    maxHeight: `calc(100dvh - ${BAR} - 2 * ${spacing.sm})`,
  },
  offsetMs: {
    top: `calc(${BAR} + ${spacing.ms})`,
    maxHeight: `calc(100dvh - ${BAR} - 2 * ${spacing.ms})`,
  },
  offsetMd: {
    top: `calc(${BAR} + ${spacing.md})`,
    maxHeight: `calc(100dvh - ${BAR} - 2 * ${spacing.md})`,
  },
  offsetLg: {
    top: `calc(${BAR} + ${spacing.lg})`,
    maxHeight: `calc(100dvh - ${BAR} - 2 * ${spacing.lg})`,
  },
  offsetXl: {
    top: `calc(${BAR} + ${spacing.xl})`,
    maxHeight: `calc(100dvh - ${BAR} - 2 * ${spacing.xl})`,
  },
  offsetXxl: {
    top: `calc(${BAR} + ${spacing.xxl})`,
    maxHeight: `calc(100dvh - ${BAR} - 2 * ${spacing.xxl})`,
  },
  offsetXxxl: {
    top: `calc(${BAR} + ${spacing.xxxl})`,
    maxHeight: `calc(100dvh - ${BAR} - 2 * ${spacing.xxxl})`,
  },
})
