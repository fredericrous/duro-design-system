import {css} from 'react-strict-dom'

/** The native list sits in a view that fills its parent or stops at a cap. */
export const nativeStyles = css.create({
  root: {
    width: '100%',
    height: '100%',
    minHeight: 0,
  },
  rootMax: (maxHeight: number | string) => ({
    height: 'auto',
    maxHeight,
  }),
})
