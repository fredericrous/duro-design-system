import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {microSpacing, radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  // The `role="group"` holding a branch's children: purely structural.
  group: {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  // The treeitem carries focus; its row draws the ring (the item also wraps
  // its children, so a ring on it would circle the whole branch).
  item: {
    display: 'flex',
    flexDirection: 'column',
    outlineWidth: 0,
    outlineStyle: 'none',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: microSpacing.px5,
    paddingBottom: microSpacing.px5,
    paddingRight: spacing.sm,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    borderRadius: radii.sm,
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    transitionProperty: 'background-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  // the row of an item with href: a real link that looks like the others
  rowLink: {
    textDecorationLine: 'none',
    outlineWidth: 0,
    outlineStyle: 'none',
  },
  // Native has no calc(): the same steps, in px from the spacing scale.
  indentPx: (px: number) => ({paddingLeft: px}),
  // one indent step per level below the top
  indent: (level: number) => ({
    paddingLeft: `calc(${spacing.sm} + ${Math.max(0, level - 1)} * ${spacing.lg})`,
  }),
  rowFocused: {
    outlineWidth: borders.focusRing,
    outlineStyle: 'solid',
    outlineColor: colors.accent,
    outlineOffset: `calc(-1 * ${borders.focusOffset})`,
  },
  rowSelected: {
    color: colors.accent,
    fontWeight: typography.fontWeightMedium,
    backgroundColor: colors.bgCardHover,
  },
  // Native: the outer row View, holding the chevron control and the press
  // target as siblings (the level indent is added by the row).
  nativeRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
    borderRadius: radii.sm,
  },
  // Native: the pressable part of the row.
  pressTarget: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    gap: spacing.xs,
    paddingTop: microSpacing.px5,
    paddingBottom: microSpacing.px5,
    borderRadius: radii.sm,
    backgroundColor: {
      default: 'transparent',
      ':active': colors.bgCardHover,
    },
  },
  // Native: the branch's chevron control, at least the WCAG 2.5.8 minimum.
  chevronControl: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: sizes.chip,
    minHeight: sizes.chip,
    flexShrink: 0,
  },
  chevronGlyph: {
    color: colors.textMuted,
  },
  // Native: a leaf's gutter, as wide as the chevron control, inside the press target.
  chevronSpacer: {
    width: sizes.chip,
    flexShrink: 0,
  },
  labelBox: {
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  metaBox: {
    display: 'flex',
    flexShrink: 0,
  },
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizes.glyphMd,
    flexShrink: 0,
    color: colors.textMuted,
    transitionProperty: 'transform',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  chevronOpen: {
    transform: 'rotate(90deg)',
  },
  // a leaf keeps the chevron's width (labels align) but shows nothing
  chevronLeaf: {
    visibility: 'hidden',
  },
  label: {
    flexGrow: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: {
    flexShrink: 0,
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
  },
})
