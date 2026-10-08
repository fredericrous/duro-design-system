import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  // Anchors the copy button to the block's top-right corner.
  root: {
    position: 'relative',
    minWidth: 0,
  },
  pre: {
    margin: 0,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    overflowX: 'auto',
    color: colors.text,
    backgroundColor: colors.bgCard,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
    whiteSpace: 'pre',
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineColor: {default: 'transparent', ':focus-visible': colors.accent},
    outlineOffset: {default: 0, ':focus-visible': borders.focusOffset},
  },
  copy: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
})
