import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    width: sizes.colorPickerW,
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  rootDisabled: {
    opacity: 0.5,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  wrap: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  // The touch-sized area a pointer or finger drags in; the visual track sits inside it.
  hit: {
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
    touchAction: 'none',
    userSelect: 'none',
  },
  hitArea: {
    height: sizes.colorAreaH,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  hitTrack: {
    height: sizes.colorTrackH,
    borderRadius: radii.full,
  },
  hitDisabled: {
    cursor: 'not-allowed',
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  areaBase: (hueColor: string) => ({
    backgroundColor: hueColor,
  }),
  areaWhite: {
    backgroundImage: `linear-gradient(to right, ${colors.fixedLight}, transparent)`,
  },
  areaBlack: {
    backgroundImage: `linear-gradient(to bottom, transparent, ${colors.fixedDark})`,
  },
  hueTrack: (gradient: string) => ({
    borderRadius: radii.full,
    backgroundImage: gradient,
  }),
  alphaBase: {
    borderRadius: radii.full,
    backgroundColor: colors.bgInset,
  },
  alphaTrack: (opaque: string) => ({
    borderRadius: radii.full,
    backgroundImage: `linear-gradient(to right, transparent, ${opaque})`,
  }),
  thumb: {
    position: 'absolute',
    width: sizes.indicator,
    height: sizes.indicator,
    boxSizing: 'border-box',
    borderRadius: radii.full,
    borderWidth: borders.strong,
    borderStyle: 'solid',
    borderColor: colors.fixedLight,
    boxShadow: `0 0 0 ${borders.hairline} ${colors.fixedDark}`,
    transform: 'translate(-50%, -50%)',
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: 'solid',
    outlineColor: colors.accent,
    outlineOffset: borders.focusOffset,
  },
  thumbAt: (xPercent: number, yPercent: number) => ({
    left: `${xPercent}%`,
    top: `${yPercent}%`,
  }),
  swatch: {
    width: sizes.colorSwatch,
    height: sizes.colorSwatch,
    boxSizing: 'border-box',
    padding: 0,
    borderRadius: radii.xs,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    cursor: 'pointer',
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: 'solid',
    outlineColor: colors.accent,
    outlineOffset: borders.focusOffset,
  },
  swatchSelected: {
    borderColor: colors.accent,
    borderWidth: borders.strong,
  },
  swatchDisabled: {
    cursor: 'not-allowed',
  },
  swatchFill: (color: string) => ({
    backgroundColor: color,
  }),
  preview: {
    flexGrow: 0,
    flexShrink: 0,
    width: sizes.colorSwatch,
    height: sizes.colorPreviewH,
    boxSizing: 'border-box',
    borderRadius: radii.xs,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.bgInset,
  },
  previewFill: (color: string) => ({
    backgroundColor: color,
  }),
  field: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
})
