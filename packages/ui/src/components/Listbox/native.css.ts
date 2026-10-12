import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

/**
 * A picker sheet's rows on native (plan N0, C0 direction A "Check"): a
 * touch-target row per option, the chosen one filled and checked.
 */
export const sheetStyles = css.create({
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  option: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    borderBottomWidth: borders.hairline,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  // The chosen option, and a row under the finger.
  optionFilled: {
    backgroundColor: colors.bgCardHover,
  },
  label: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
  check: {
    color: colors.accent,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    textAlign: 'center',
  },
  // The search field pinned at a Combobox sheet's top, under its header.
  search: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
    marginLeft: spacing.md,
    marginRight: spacing.md,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    backgroundColor: 'transparent',
    borderWidth: 0,
    '::placeholder': {
      color: colors.textMuted,
    },
  },
})
