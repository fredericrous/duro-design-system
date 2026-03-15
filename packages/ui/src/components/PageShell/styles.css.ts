import {css} from 'react-strict-dom'
import {layoutSpacing} from '@duro-app/tokens/tokens/layout-spacing.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

export const styles = css.create({
  root: {
    width: '100%',
  },
  container: {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
  },
  // Max-width presets
  maxSm: {maxWidth: 600},
  maxMd: {maxWidth: 800},
  maxLg: {maxWidth: 1200},
  // Horizontal padding
  padSm: {paddingLeft: layoutSpacing.containerSm, paddingRight: layoutSpacing.containerSm},
  padMd: {paddingLeft: layoutSpacing.containerMd, paddingRight: layoutSpacing.containerMd},
  padLg: {paddingLeft: layoutSpacing.containerLg, paddingRight: layoutSpacing.containerLg},
  // Vertical spacing
  headerPadding: {paddingTop: spacing.lg},
  mainPadding: {paddingTop: spacing.xl, paddingBottom: spacing.xl},
})
