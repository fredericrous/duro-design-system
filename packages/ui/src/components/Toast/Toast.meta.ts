import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Transient, self-dismissing notification for the RESULT of an action (saved, sent, revoked, failed). Mount <ToastProvider> once at the app root and call useToast().toast() from anywhere. Toasts stack and portal above dialogs.',
  whenToUse: [
    'Confirming an action succeeded (e.g. "Grant revoked")',
    'Reporting an action failed, with the reason',
    'Reversible actions that benefit from an inline Undo',
  ],
  whenNotToUse: [
    'In-form validation errors — use Field.Error or an inline Alert',
    'Persistent block-level messages — use Callout',
    'Confirming a destructive action before it runs — use ConfirmDialog / Dialog',
  ],
  relatedTo: [
    {
      component: 'Alert',
      kind: 'contrast',
      relationship: 'Alert for inline/in-form status; Toast for action results',
    },
    {
      component: 'ConfirmDialog',
      kind: 'contrast',
      relationship: 'ConfirmDialog gates a destructive action; Toast reports the outcome',
    },
  ],
  example: `function Example() {
  const {toast} = useToast()
  return (
    <Button onClick={() => toast({variant: 'success', message: 'Grant revoked', action: {label: 'Undo', onClick: restore}})}>
      Revoke
    </Button>
  )
}`,
}
