import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Block-level informational message with icon and colored background. More prominent than Alert. Use for important notices, onboarding tips, or contextual guidance that should stand out.',
  whenToUse: [
    'Important notices that need visual prominence',
    'Onboarding tips or contextual guidance',
    'Warning messages before destructive actions',
  ],
  whenNotToUse: [
    'Compact inline feedback — use Alert',
    'Form field errors — use Field.Error',
    'Toast notifications — use a toast system',
  ],
  relatedTo: [
    {
      component: 'Alert',
      relationship: 'Alert for compact inline; Callout for block-level prominent',
    },
  ],
  example: `<Callout variant="warning">
  Your subscription expires in 3 days. Renew now to avoid service interruption.
</Callout>`,
}
