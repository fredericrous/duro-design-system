import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {breakpoints} from '@duro-app/tokens/tokens/breakpoints.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

// Below this container width the two cards stack (Mobile.dc.html); above it
// they sit side by side, each in its own half (Reader.dc.html).
const STACK_BP = breakpoints.xs
const STACKED = `@container (max-width: ${STACK_BP})`

// The picked docs browser (docs/mockups/docs-nav/Reader.dc.html and
// Mobile.dc.html, `.pn .card`): two interactive cards, a small muted
// direction label over the title, Next aligned right.
export const styles = css.create({
  // hosts the container query: a container cannot query itself
  root: {
    containerType: 'inline-size',
    minWidth: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1fr) minmax(0, 1fr)',
      [STACKED]: 'minmax(0, 1fr)',
    },
    gap: spacing.md,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: spacing.md,
    fontFamily: typography.fontFamily,
    color: colors.text,
    textDecorationLine: 'none',
    backgroundColor: {
      default: colors.bgCard,
      ':hover': colors.bgCardHover,
    },
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
    cursor: 'pointer',
    transitionProperty: 'background-color',
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
  // each side keeps its slot: Next stays in the right half without a Prev
  prev: {
    gridColumn: {
      default: '1',
      [STACKED]: 'auto',
    },
    gridRow: {
      default: '1',
      [STACKED]: 'auto',
    },
  },
  next: {
    gridColumn: {
      default: '2',
      [STACKED]: 'auto',
    },
    gridRow: {
      default: '1',
      [STACKED]: 'auto',
    },
    textAlign: {
      default: 'right',
      [STACKED]: 'left',
    },
  },
  label: {
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
  },
  title: {
    fontSize: typography.fontSizeSm,
    overflowWrap: 'anywhere',
  },
})
