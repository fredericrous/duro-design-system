import {css} from 'react-strict-dom'

// The visually-hidden technique: a 1×1 box clipped by overflow, still in the
// accessibility tree and still focusable where the element is. The 1px is the
// technique, not a design measure, so this module is the one file the
// every-measure-is-a-token rule exempts (ADR-0027; `exemptFiles` in
// eslint.config.js). Components layer their own extras on top (`opacity: 0`
// for a native input, `clip` for a label).
export const visuallyHidden = css.create({
  base: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
  // For text (VisuallyHidden): clipped to nothing, kept on one line so a
  // screen reader reads it whole.
  text: {
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
    padding: 0,
  },
})
