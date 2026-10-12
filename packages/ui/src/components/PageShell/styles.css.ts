import {css} from 'react-strict-dom'
import {layoutSpacing} from '@duro-app/tokens/tokens/layout-spacing.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

export const styles = css.create({
  root: {
    width: '100%',
    // Native has no border-box reset (the web's global-reset.css); declare it.
    boxSizing: 'border-box',
  },
  container: {
    width: '100%',
    // Native has no border-box reset (the web's global-reset.css); declare it.
    boxSizing: 'border-box',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  // Max-width presets
  maxSm: {maxWidth: sizes.pageSm},
  maxMd: {maxWidth: sizes.pageMd},
  maxLg: {maxWidth: sizes.pageLg},
  // Horizontal padding
  padSm: {paddingLeft: layoutSpacing.containerSm, paddingRight: layoutSpacing.containerSm},
  padMd: {paddingLeft: layoutSpacing.containerMd, paddingRight: layoutSpacing.containerMd},
  padLg: {paddingLeft: layoutSpacing.containerLg, paddingRight: layoutSpacing.containerLg},
  // Vertical spacing
  headerPadding: {paddingTop: spacing.lg},
  mainPadding: {paddingTop: spacing.xl, paddingBottom: spacing.xl},
})
