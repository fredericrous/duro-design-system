import type {ComponentProps} from 'react'
import {html} from 'react-strict-dom'

export type ButtonHostProps = ComponentProps<typeof html.button>

/**
 * The host element of Button and Toggle. On the web it is the <button>
 * itself, with no component in between (a wrapper changed what a Form's
 * submit focuses); the native variant (ButtonHost.native.tsx) can swap in an
 * RN Pressable to carry a Tooltip's accessibility hint.
 */
export const ButtonHost: typeof html.button = html.button
