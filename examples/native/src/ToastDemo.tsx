import {Button, Dialog, Inline, Text, useToast} from '@duro-app/ui'

/**
 * Checkpoint B scenarios for Toast: one raised on the screen, one with an
 * Undo action, and one raised from inside a Dialog (it draws above it and
 * keeps its countdown when the Dialog closes).
 */
export function ToastDemo() {
  const {toast} = useToast()
  return (
    <Inline gap="sm">
      <Button variant="secondary" onClick={() => toast({message: 'Session archived'})}>
        Toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            variant: 'success',
            message: 'Session archived',
            action: {label: 'Undo', onClick: () => {}},
          })
        }
      >
        Toast + Undo
      </Button>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button variant="secondary">Toast in dialog</Button>
        </Dialog.Trigger>
        <Dialog.Portal size="sm">
          <Dialog.Header>
            <Dialog.Title>Raise a toast</Dialog.Title>
            <Dialog.Close />
          </Dialog.Header>
          <Dialog.Body>
            <Text>The toast draws above this dialog.</Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              onClick={() => toast({variant: 'error', message: 'Could not sync', duration: 20000})}
            >
              Raise
            </Button>
          </Dialog.Footer>
        </Dialog.Portal>
      </Dialog.Root>
    </Inline>
  )
}
