import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

/** Native Select additions to the shared styles. */
export const nativeStyles = css.create({
  // RSD on native lays out only display: flex, not the web's inline-flex.
  nativeFlex: {
    display: 'flex',
  },
  // SideNav's chevron points right; a picker's points down.
  iconDown: {
    transform: 'rotate(90deg)',
  },
  // An option row with a leading slot or a description line.
  optionLeading: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  optionBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  optionDescription: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
  },
})
