import {css} from 'react-strict-dom'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

// Web only: native has no field-sizing or lh unit (see native.css.ts).
export const growCss = css.create({
  // The height follows the content (CSS field-sizing, or autoGrow.ts where
  // it is missing); the rows attribute is the floor.
  autoGrow: {
    fieldSizing: 'content',
    resize: 'none' as const,
    overflowY: 'auto',
  },
  // `maxRows` lines of text plus the vertical padding and border (border-box).
  maxRows: (rows: number) => ({
    maxHeight: `calc(${rows}lh + ${spacing.sm} + ${spacing.sm} + ${borders.hairline} + ${borders.hairline})`,
  }),
})
