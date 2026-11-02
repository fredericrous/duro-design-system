import {css} from 'react-strict-dom'

export const styles = css.create({
  // In the header's space-between row the button would sit mid-way; it joins the Close at the end.
  expand: {
    marginLeft: 'auto',
  },
  // The header of a movable pane: a grab cursor says it can be dragged.
  handle: {
    cursor: 'grab',
  },
  // The move control sits before Expand, at the same end of the header.
  move: {
    marginLeft: 'auto',
  },
})
