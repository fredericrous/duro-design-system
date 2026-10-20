import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

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
    // The root draws the block; inside Prose its pre rule would add a second
    // border, background and rounded top, so this pre states its own.
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
    whiteSpace: 'pre',
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineColor: {default: 'transparent', ':focus-visible': colors.accent},
    outlineOffset: {default: 0, ':focus-visible': borders.focusOffset},
  },
  // A diff line fills the block's width, so its tint is a band, not a patch.
  line: {display: 'block'},
  added: {backgroundColor: colors.successBg},
  removed: {backgroundColor: colors.errorBg},
  hunk: {backgroundColor: colors.infoBg, color: colors.infoText},
  // Diff rows (a line action or content under lines): the block scrolls
  // sideways as a whole, each row as wide as the longest line so its tint
  // bands the full width.
  rows: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    overflowX: 'auto',
    color: colors.text,
  },
  row: {display: 'flex', alignItems: 'center', minWidth: 'max-content'},
  gutter: {
    display: 'flex',
    justifyContent: 'center',
    flexShrink: 0,
    width: sizes.iconButtonSm,
  },
  rowText: {whiteSpace: 'pre', paddingRight: spacing.md},
  lineAction: {
    width: sizes.chip,
    height: sizes.chip,
    padding: 0,
    borderWidth: 0,
    borderRadius: radii.xs,
    backgroundColor: {default: 'transparent', ':hover': colors.bgCardHover},
    color: colors.textMuted,
    font: 'inherit',
    cursor: 'pointer',
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineColor: {default: 'transparent', ':focus-visible': colors.accent},
  },
  // Content under a line spans the block, indented past the gutter.
  after: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    paddingLeft: sizes.iconButtonSm,
    paddingRight: spacing.md,
  },
  // Native: the code scrolls sideways inside the block.
  scroll: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
  text: {
    color: colors.text,
    userSelect: 'text',
    whiteSpace: 'pre',
  },
})
