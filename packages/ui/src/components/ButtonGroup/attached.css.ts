import {css} from 'react-strict-dom'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'

// The styles a control takes in an attached ButtonGroup, by its position.
// Borders collapse into the neighbour's with a negative hairline margin; only
// the outer corners keep the control's own radius.
const overlap = `calc(-1 * ${borders.hairline})`

export const attached = css.create({
  // A focused control rises above its neighbours, so their borders never
  // cover its focus ring. Position makes the z-index apply to a trigger that
  // is not itself the flex item (Select and Menu triggers sit in a Root).
  item: {
    position: 'relative',
    zIndex: {default: null, ':focus-visible': layers.raised},
  },
  horizontalFirst: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  horizontalMiddle: {
    borderRadius: 0,
    marginLeft: overlap,
  },
  horizontalLast: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginLeft: overlap,
  },
  verticalFirst: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalMiddle: {
    borderRadius: 0,
    marginTop: overlap,
  },
  verticalLast: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: overlap,
  },
})
