import type {ComponentProps} from 'react'
import {html} from 'react-strict-dom'

export type ButtonHostProps = ComponentProps<typeof html.button>

/**
 * The host element of Button and Toggle. On the web it is the <button>; the
 * native variant (ButtonHost.native.tsx) can swap in an RN Pressable to carry
 * a Tooltip's accessibility hint.
 */
export function ButtonHost({style, ...props}: ButtonHostProps) {
  // `style` stays a named prop: react-strict-dom's compiler resolves it on
  // the html.* element and cannot see it through a spread.
  return <html.button {...props} style={style} />
}
