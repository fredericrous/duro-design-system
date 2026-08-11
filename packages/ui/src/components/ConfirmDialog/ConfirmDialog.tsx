import {type ReactNode, useState} from 'react'
import {Dialog, type DialogSize} from '../Dialog/Dialog'
import {Button} from '../Button/Button'
import {Input} from '../Input/Input'
import {Field} from '../Field/Field'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  /** Warning / cascade body. */
  children?: ReactNode
  /** When set, the confirm action stays DISABLED until the user types this
   *  exact phrase (org name, slug…). The typed value is a client-side gate
   *  only — it is never submitted. */
  confirmPhrase?: string
  /** Prompt shown above the phrase input. */
  promptLabel?: ReactNode
  cancelLabel?: ReactNode
  /**
   * App-owned confirm control. Receives whether the phrase gate is satisfied,
   * so the app can render its OWN <Button type="submit"> INSIDE its form
   * (e.g. a react-router fetcher.Form with hidden intent fields) — the DS does
   * NOT own the submit, avoiding a fight with the app's form flow. Takes
   * precedence over onConfirm/confirmLabel.
   */
  confirmSlot?: (gate: {satisfied: boolean}) => ReactNode
  /** Simple case (no app form): the DS renders a danger Button calling this. */
  onConfirm?: () => void
  confirmLabel?: ReactNode
  size?: DialogSize
}

/**
 * Generic destructive-confirmation dialog: layout + an optional type-a-phrase
 * gate. The DS owns the shell and the gate; the APP owns the actual submit
 * (via `confirmSlot`) so it composes with form libraries instead of forcing a
 * callback. Domain warning text goes in `children`.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  children,
  confirmPhrase,
  promptLabel,
  cancelLabel = 'Cancel',
  confirmSlot,
  onConfirm,
  confirmLabel = 'Confirm',
  size = 'sm',
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('')
  const satisfied = !confirmPhrase || typed.trim() === confirmPhrase

  const handleOpenChange = (next: boolean) => {
    if (!next) setTyped('') // reset the gate when the dialog closes
    onOpenChange(next)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal size={size}>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          {children}
          {confirmPhrase ? (
            <Field.Root>
              {promptLabel ? <Field.Label>{promptLabel}</Field.Label> : null}
              <Input
                font="mono"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoFocus
                aria-label="confirmation phrase"
              />
            </Field.Root>
          ) : null}
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            {cancelLabel}
          </Button>
          {confirmSlot ? (
            confirmSlot({satisfied})
          ) : onConfirm ? (
            <Button variant="danger" disabled={!satisfied} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          ) : null}
        </Dialog.Footer>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
