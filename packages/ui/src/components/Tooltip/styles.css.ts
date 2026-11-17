import {css} from 'react-strict-dom'
import {colors} from '@greenharness/greenrack-tokens/tokens/colors.css'
import {spacing, radii} from '@greenharness/greenrack-tokens/tokens/spacing.css'
import {typography} from '@greenharness/greenrack-tokens/tokens/typography.css'
import {shadows} from '@greenharness/greenrack-tokens/tokens/shadows.css'
import {borders} from '@greenharness/greenrack-tokens/tokens/borders.css'
import {layers} from '@greenharness/greenrack-tokens/tokens/layers.css'

export const styles = css.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
  },
  popup: {
    position: 'absolute',
    zIndex: layers.floating,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    backgroundColor: colors.bgCard,
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeight,
    borderRadius: radii.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    boxShadow: shadows.md,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  top: {
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: spacing.xs,
  },
  bottom: {
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: spacing.xs,
  },
  left: {
    right: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginRight: spacing.xs,
  },
  right: {
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginLeft: spacing.xs,
  },
})
