import {css} from 'react-strict-dom'

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
})
