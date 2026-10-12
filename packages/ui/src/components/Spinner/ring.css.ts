import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

/** The ring both platforms draw; each turns it its own way. */
export const ring = css.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // RSD-native only honors display:'flex' (not 'inline-flex').
  nativeRoot: {
    display: 'flex',
  },
  ring: {
    borderRadius: '50%',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderTopColor: colors.accent,
  },
  sm: {
    width: sizes.spinnerSm,
    height: sizes.spinnerSm,
    borderWidth: borders.strong,
  },
  md: {
    width: sizes.spinnerMd,
    height: sizes.spinnerMd,
    borderWidth: borders.strong,
  },
  lg: {
    width: sizes.spinnerLg,
    height: sizes.spinnerLg,
    borderWidth: borders.accent,
  },
  // Layered on visuallyHidden.base.
  srOnly: {
    clip: 'rect(0, 0, 0, 0)',
  },
})

/** One turn, in ms: the web animation's 0.6s. */
export const TURN_MS = 600
