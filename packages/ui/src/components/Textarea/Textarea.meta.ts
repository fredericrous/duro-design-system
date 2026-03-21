import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Multi-line text input with automatic Field/Form integration. Same Field binding behavior as Input.',
  whenToUse: ['Multi-line text entry (comments, messages, descriptions)'],
  whenNotToUse: ['Single-line input — use Input'],
  relatedTo: [
    {component: 'Input', relationship: 'Single-line variant'},
    {component: 'Field', relationship: 'Wrap in Field.Root for label + error'},
  ],
  example: `<Field.Root name="message">
  <Field.Label>Message</Field.Label>
  <Textarea placeholder="Tell us what you think..." rows={4} />
  <Field.Description>At least 10 characters</Field.Description>
  <Field.Error />
</Field.Root>`,
}
