import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

/** Native Combobox additions to the shared styles: the closed field. */
export const nativeStyles = css.create({
  // RSD on native lays out only display: flex, not the web's inline-flex.
  nativeFlex: {
    display: 'flex',
  },
  // The closed field: the web input's padding, a down chevron at its end.
  field: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingRight: spacing.sm,
  },
  fieldText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
  },
  // SideNav's chevron points right; a picker's points down.
  chevronDown: {
    display: 'flex',
    transform: 'rotate(90deg)',
  },
  fieldPlaceholder: {
    color: colors.textMuted,
  },
})
