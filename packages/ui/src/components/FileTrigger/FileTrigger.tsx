import {useEffect, useImperativeHandle, useRef} from 'react'
import type {ReactNode, Ref} from 'react'
import {css, html} from 'react-strict-dom'
import {Button, type ButtonSize, type ButtonVariant} from '../Button/Button'
import {openPicker, takeFiles} from './pick'

export interface FileTriggerHandle {
  /** Open the OS file picker programmatically. */
  open: () => void
}

export interface FileTriggerProps {
  /** Accepted types, as the native `accept` attribute (e.g. `image/*,.pdf`). */
  accept?: string
  multiple?: boolean
  /** Called with the chosen files. */
  onSelect: (files: File[]) => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  'aria-label'?: string
  /** Exposes `open()` so a caller can open the picker without the button. */
  ref?: Ref<FileTriggerHandle>
  children: ReactNode
}

// display:none, not visually hidden: the input is only ever opened by click(),
// which a hidden input still honours, and this keeps its "No file chosen" text
// out of the accessibility tree (axe flagged its contrast).
const styles = css.create({
  input: {display: 'none'},
})

/** A Button that opens the OS file picker. Web only: native has no file input. */
export function FileTrigger({
  accept,
  multiple = false,
  onSelect,
  variant,
  size,
  disabled,
  'aria-label': ariaLabel,
  ref,
  children,
}: FileTriggerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => ({open: () => openPicker(inputRef.current)}), [])

  // RSD's input props omit `accept`, so set the DOM attribute directly.
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    if (accept) input.setAttribute('accept', accept)
    else input.removeAttribute('accept')
  }, [accept])

  return (
    <>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={() => openPicker(inputRef.current)}
      >
        {children}
      </Button>
      <html.input
        ref={inputRef}
        type="file"
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden={true}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => takeFiles(e.target, onSelect)}
        style={styles.input}
      />
    </>
  )
}
