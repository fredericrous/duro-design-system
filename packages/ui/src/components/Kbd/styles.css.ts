import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {microSpacing, radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  group: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
  },
  key: {
    display: 'inline-block',
    paddingTop: microSpacing.px1,
    paddingBottom: microSpacing.px1,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.xs,
    backgroundColor: colors.bgCardHover,
    color: colors.text,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    lineHeight: 1.2,
  },
})
