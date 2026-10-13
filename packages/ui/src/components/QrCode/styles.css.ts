import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'

export const styles = css.create({
  // Square, as wide as its container: the caller sizes the column it sits in. Dark modules on the
  // fixed light, in every theme: an inverted code does not scan on every camera.
  frame: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.fixedLight,
  },
})
