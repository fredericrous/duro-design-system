import {css} from 'react-strict-dom'
import {FONT_SIZE_REM, LINE_HEIGHT, ROOT_FONT_PX, SPACING_PX} from '@duro-app/tokens/keys'

// One row of text, in px: the Textarea's font size (fontSizeSm, rem) at the
// root size, times the typography line height. Native has no `lh` unit.
const ROW_PX = FONT_SIZE_REM.fontSizeSm * ROOT_FONT_PX * LINE_HEIGHT

export const nativeStyles = css.create({
  // A multiline field on native grows with its content on its own.
  autoGrow: {},
  // `maxRows` lines plus the vertical padding; a multiline field on native
  // already grows with its content, so only the cap is needed.
  maxRows: (rows: number) => ({
    maxHeight: rows * ROW_PX + 2 * SPACING_PX.sm,
  }),
})
