import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    lineHeight: typography.lineHeight,
  },
  rootDisabled: {
    opacity: 0.5,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  valueText: {
    color: colors.textMuted,
  },
  // The touch-sized area a pointer or finger drags in; the bar sits in its middle.
  hit: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: sizes.touchTarget,
    cursor: 'pointer',
    touchAction: 'none',
    userSelect: 'none',
  },
  hitDisabled: {
    cursor: 'not-allowed',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: sizes.barH,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    pointerEvents: 'none',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: sizes.barH,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    pointerEvents: 'none',
  },
  fillWidth: (percent: number) => ({
    width: `${percent}%`,
  }),
  thumb: {
    position: 'absolute',
    width: sizes.indicator,
    height: sizes.indicator,
    borderRadius: radii.full,
    backgroundColor: colors.fixedLight,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.accent,
    transform: 'translateX(-50%)',
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: 'solid',
    outlineColor: colors.accent,
    outlineOffset: borders.focusOffset,
  },
  thumbAt: (percent: number) => ({
    left: `${percent}%`,
  }),
})
