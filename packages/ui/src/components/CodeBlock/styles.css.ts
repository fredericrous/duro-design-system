import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  // One bordered block: a row for the copy button, then the code. The button
  // never sits over the code, which scrolls sideways under a long line.
  root: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    backgroundColor: colors.bgCard,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  bar: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: spacing.xs,
    paddingRight: spacing.xs,
    paddingLeft: spacing.xs,
  },
  pre: {
    margin: 0,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    overflowX: 'auto',
    color: colors.text,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
    whiteSpace: 'pre',
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineColor: {default: 'transparent', ':focus-visible': colors.accent},
    outlineOffset: {default: 0, ':focus-visible': borders.focusOffset},
  },
})
