import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Destructive-confirmation dialog with an optional type-a-phrase gate. DS owns layout + gating; the app owns the submit (confirmSlot) so it composes with form libraries.',
  whenToUse: [
    'Confirming an irreversible action (delete org, delete account, drop a record with cascades)',
    'High-impact actions that should require typing a phrase (the slug/name) before enabling confirm',
  ],
  whenNotToUse: [
    'Routine confirmations — use a Dialog with a plain confirm button',
    'Non-destructive flows — a Dialog or inline action is enough',
  ],
  anatomy: {
    required: ['title', 'children (warning body)'],
    optional: ['confirmPhrase', 'promptLabel', 'confirmSlot', 'onConfirm', 'confirmLabel'],
  },
  relatedTo: [
    {
      component: 'Dialog',
      kind: 'composition',
      relationship: 'Built on Dialog — ConfirmDialog adds the phrase gate + footer',
    },
    {
      component: 'Button',
      kind: 'composition',
      relationship: 'Button renders the confirm/cancel actions inside ConfirmDialog',
    },
  ],
  example: `<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Delete organization?"
  confirmPhrase={org.name}
  promptLabel={<>Type <b>{org.name}</b> to confirm</>}
  confirmSlot={({satisfied}) => (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="delete-org" />
      <Button type="submit" variant="danger" disabled={!satisfied}>Delete</Button>
    </fetcher.Form>
  )}
>
  This deletes the org and all its landscapes. This cannot be undone.
</ConfirmDialog>`,
}
