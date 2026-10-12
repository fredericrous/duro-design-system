import {useState} from 'react'
import {Button, Card, ConfirmDialog, Dialog, Icon, Inline, Text, ThemeProvider} from '@duro-app/ui'

/** Checkpoint A scenarios: a Dialog, a nested theme inside it, ConfirmDialog's phrase input. */
export function DialogDemo({label}: {label: string}) {
  const [confirming, setConfirming] = useState(false)
  return (
    <Inline gap="sm">
      <Dialog.Root>
        <Dialog.Trigger>
          <Button>{label}</Button>
        </Dialog.Trigger>
        <Dialog.Portal size="sm">
          <Dialog.Header>
            <Dialog.Title>Native dialog</Dialog.Title>
            <Dialog.Close />
          </Dialog.Header>
          <Dialog.Description>Backdrop, Android back and Close each close it.</Dialog.Description>
          <Dialog.Body>
            <ThemeProvider theme="light">
              <Card>
                <Inline gap="sm">
                  <Icon name="sun" />
                  <Text>Light theme inside the dialog</Text>
                </Inline>
              </Card>
            </ThemeProvider>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close>
              <Button variant="secondary">Done</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Portal>
      </Dialog.Root>
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Delete…
      </Button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Delete the project?"
        confirmPhrase="delete"
        promptLabel="Type delete to confirm"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => setConfirming(false)}
      >
        <Text>This cannot be undone.</Text>
      </ConfirmDialog>
    </Inline>
  )
}
