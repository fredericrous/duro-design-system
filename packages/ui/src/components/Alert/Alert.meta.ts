import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Inline status message with icon. Compact, single-line feedback for form validation results, API responses, or status updates. For block-level prominent messages, use Callout instead.',
  whenToUse: [
    'Form submission feedback (success, error)',
    'API response status messages',
    'Inline warnings or info notices',
  ],
  whenNotToUse: [
    'Block-level prominent messages — use Callout',
    'Toast notifications — use a toast system',
    'Form field errors — use Field.Error',
  ],
  relatedTo: [
    {
      component: 'Callout',
      relationship: 'Callout for larger block-level messages; Alert for compact inline',
    },
  ],
  example: `<Stack gap="sm">
  <Alert variant="success">Settings saved successfully.</Alert>
  <Alert variant="error">Failed to connect. Please retry.</Alert>
  <Alert variant="warning">Your session expires in 5 minutes.</Alert>
  <Alert variant="info">New version available.</Alert>
</Stack>`,
}
