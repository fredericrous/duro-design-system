import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

// The picked docs browser (docs/mockups/docs-nav/Reader.dc.html, `.crumbs`):
// small muted text, accent links, a `›` between items, the current page plain.
export const styles = css.create({
  root: {
    minWidth: 0,
  },
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.textMuted,
  },
  item: {
    display: 'inline-flex',
    minWidth: 0,
  },
  separator: {
    display: 'inline-flex',
    color: colors.textMuted,
    userSelect: 'none',
  },
  link: {
    color: {
      default: colors.accent,
      ':hover': colors.accentHover,
    },
    textDecorationLine: {
      default: 'none',
      ':hover': 'underline',
    },
    borderRadius: radii.xs,
    transitionProperty: 'color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
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
      ':focus-visible': borders.focusOffset,
    },
  },
  // the artboard keeps the current page in the list's muted colour; it is
  // told apart by not being a link (and by aria-current for assistive tech)
  current: {
    color: 'inherit',
  },
})
