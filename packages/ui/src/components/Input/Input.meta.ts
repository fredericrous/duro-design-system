import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Text input with automatic Field/Form integration. Variant auto-switches to error when inside an invalid Field.',
  whenToUse: ['Single-line text entry (text, email, password, url, tel, number, search)'],
  whenNotToUse: ['Multi-line text — use Textarea', 'Picking from predefined options — use Select'],
  relatedTo: [
    {component: 'Field', kind: 'composition', relationship: 'Wrap in Field.Root for label + error'},
    {
      component: 'InputGroup',
      kind: 'composition',
      relationship: 'Wrap in InputGroup.Root for prefix/suffix addons',
    },
    {
      component: 'Textarea',
      kind: 'contrast',
      relationship: 'Input for single-line entry; Textarea for multi-line',
    },
  ],
  example: `<Field.Root name="email">
  <Field.Label>Email</Field.Label>
  <Input type="email" placeholder="you@example.com" autoComplete="email" />
  <Field.Error />
</Field.Root>`,
}
