import type {ReactNode} from 'react'

export interface SwitchProps {
  /** Controlled checked state. */
  checked?: boolean
  /** Initial checked state (uncontrolled). */
  defaultChecked?: boolean
  /** Callback fired when the checked state changes. */
  onCheckedChange?: (checked: boolean) => void
  /** Prevents user interaction. */
  disabled?: boolean
  /** Form field name for the hidden input. */
  name?: string
  /** Value submitted when checked. */
  value?: string
  /** Label content rendered beside the switch. */
  children?: ReactNode
  /** Names the switch when it has no visible label (`children`), e.g. a row whose title already shows it. */
  'aria-label'?: string
}
