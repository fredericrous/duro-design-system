import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Compound form field with label, description, and error display. Inside Form, auto-binds to react-hook-form via name prop. Works standalone with manual invalid prop.',
  whenToUse: [
    'Any form input that needs a label and/or error message',
    'Standalone labeled input (without Form) with manual error display',
  ],
  whenNotToUse: [
    'Bare input without label — use Input directly (rare)',
  ],
  anatomy: {
    required: ['Root'],
    optional: ['Label', 'Description', 'Error'],
  },
  relatedTo: [
    {component: 'Form', relationship: 'Field.Root auto-binds when name matches schema key'},
    {component: 'Input', relationship: 'Place Input inside Field.Root'},
    {component: 'Textarea', relationship: 'Place Textarea inside Field.Root'},
    {component: 'Select', relationship: 'Place Select inside Field.Root'},
  ],
  example: `// Inside Form (auto-binds validation)
<Field.Root name="email">
  <Field.Label>Email</Field.Label>
  <Input type="email" placeholder="you@example.com" />
  <Field.Description>We'll never share your email.</Field.Description>
  <Field.Error />
</Field.Root>

// Standalone (manual error)
<Field.Root invalid>
  <Field.Label>Email</Field.Label>
  <Input variant="error" />
  <Field.Error>This email is already taken.</Field.Error>
</Field.Root>`,
}
