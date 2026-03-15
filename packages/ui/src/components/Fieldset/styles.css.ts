import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    // Reset native fieldset chrome
    borderWidth: 0,
    margin: 0,
    padding: 0,
    minWidth: 0,
  },
  legend: {
    // Reset native legend quirks
    padding: 0,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: colors.text,
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  gapXs: {gap: spacing.xs},
  gapSm: {gap: spacing.sm},
  gapMs: {gap: spacing.ms},
  gapMd: {gap: spacing.md},
  gapLg: {gap: spacing.lg},
  gapXl: {gap: spacing.xl},
})
