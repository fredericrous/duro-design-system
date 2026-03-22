import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Modal dialog with backdrop overlay. Centered on screen with scale+fade animation. Traps focus, dismisses on backdrop click or Escape. Use for confirmations, forms, or content that requires user attention before continuing.',
  whenToUse: [
    'Confirmation prompts (delete, revoke, destructive actions)',
    'Short forms or data entry that blocks the main flow',
    'Viewing detail content in a focused overlay (e.g. certificate details)',
    'Any modal interaction that requires user acknowledgment',
  ],
  whenNotToUse: [
    'Non-modal side panels — use DetailPanel',
    'Sliding panels from screen edges — use Drawer',
    'Inline content expansion — use disclosure or accordion patterns',
    'Toast/notification messages — use Alert or a toast system',
  ],
  anatomy: {
    required: ['Root', 'Portal'],
    optional: ['Trigger', 'Header', 'Title', 'Description', 'Body', 'Footer', 'Close'],
  },
  relatedTo: [
    {
      component: 'Drawer',
      relationship: 'Drawer slides from an edge; Dialog is centered with scale animation',
    },
    {
      component: 'DetailPanel',
      relationship: 'DetailPanel is non-modal and in-flow; Dialog is modal with backdrop',
    },
  ],
  example: `<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger>
    <Button>Open dialog</Button>
  </Dialog.Trigger>
  <Dialog.Portal size="md">
    <Dialog.Header>
      <Dialog.Title>Confirm action</Dialog.Title>
      <Dialog.Close />
    </Dialog.Header>
    <Dialog.Body>
      <Text>Are you sure you want to proceed?</Text>
    </Dialog.Body>
    <Dialog.Footer>
      <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="danger" onClick={handleConfirm}>Confirm</Button>
    </Dialog.Footer>
  </Dialog.Portal>
</Dialog.Root>`,
}
