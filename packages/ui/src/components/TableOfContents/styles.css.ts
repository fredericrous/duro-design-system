import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {microSpacing, radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typeScale, typography} from '@duro-app/tokens/tokens/typography.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

// The picked docs browser: the list is Reader.dc.html's `.toc` / `.tocitem`
// (a hairline rail, the active item marked by the nav marker bar), the menu is
// Mobile.dc.html's `.mtoc` (docs/mockups/docs-nav/).
export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    fontFamily: typography.fontFamily,
  },
  caption: {
    marginBottom: spacing.sm,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    letterSpacing: typeScale.letterSpacingWide,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    borderLeftWidth: borders.hairline,
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
  },
  // the menu's list opens below its button, as a panel
  listMenu: {
    gap: 0,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.bgCard,
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
  },
  // On a touch screen (coarse pointer, as Toggle does) each item is a touch
  // target; a mouse keeps the artboard's compact rail.
  link: {
    display: 'flex',
    alignItems: 'center',
    minHeight: {default: null, '@media (pointer: coarse)': sizes.touchTarget},
    paddingTop: microSpacing.px2,
    paddingBottom: microSpacing.px2,
    paddingLeft: spacing.ms,
    paddingRight: spacing.ms,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightNormal,
    textDecorationLine: 'none',
    color: {
      default: colors.textMuted,
      ':hover': colors.text,
    },
    cursor: 'pointer',
    transitionProperty: 'color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  // a touch target per item when the menu is the narrow-screen form
  linkMenu: {
    minHeight: sizes.touchTarget,
  },
  level3: {
    paddingLeft: `calc(${spacing.ms} + ${spacing.md})`,
  },
  // not colour alone: the marker bar and a heavier weight
  linkActive: {
    color: colors.text,
    fontWeight: typography.fontWeightMedium,
    boxShadow: `inset ${sizes.navMarkerW} 0 0 ${colors.accent}`,
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    width: '100%',
    minHeight: sizes.touchTarget,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.ms,
    paddingRight: spacing.ms,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    textAlign: 'left',
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  // the keyboard ring, inset so a neighbour or the panel edge never clips it
  focusable: {
    outlineWidth: {
      default: 0,
      ':focus-visible': borders.focusRing,
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
      ':focus-visible': `calc(-1 * ${borders.focusOffset})`,
    },
  },
  chevron: {
    color: colors.textMuted,
    transitionProperty: 'transform',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
})
