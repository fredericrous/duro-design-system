import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
  },
  groupTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: {
      default: colors.textMuted,
      ':hover': colors.text,
    },
    backgroundColor: 'transparent',
    borderWidth: 0,
    cursor: 'pointer',
    transitionProperty: 'color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  groupTriggerActive: {
    color: colors.text,
  },
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    transitionProperty: 'transform',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  chevronOpen: {
    transform: 'rotate(90deg)',
  },
  // The `role="group"` wrapper around a Section's / an expanded Group's items.
  // Purely structural: it exists to carry the accessible name, so it must not
  // change how the items stack.
  items: {
    display: 'flex',
    flexDirection: 'column',
  },
  // Static (non-collapsible) section — see SideNav.Section.
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionLabel: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: colors.textMuted,
  },
  item: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightNormal,
    color: {
      default: colors.textMuted,
      ':hover': colors.text,
    },
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    borderWidth: 0,
    borderRadius: radii.sm,
    cursor: 'pointer',
    transitionProperty: 'color, background-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    textAlign: 'left' as const,
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
  },
  itemActive: {
    color: colors.accent,
    fontWeight: typography.fontWeightMedium,
    backgroundColor: colors.bgCardHover,
  },
  // Active indicator — a bar at the rail's left edge that grows in on select.
  marker: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: '3px',
    height: 0,
    transform: 'translateY(-50%)',
    borderTopRightRadius: radii.full,
    borderBottomRightRadius: radii.full,
    backgroundColor: colors.accent,
    transitionProperty: 'height',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  markerActive: {
    height: '18px',
  },
  itemIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '18px',
    height: '18px',
  },
  itemLabel: {
    flexGrow: 1,
    minWidth: 0,
  },
})
