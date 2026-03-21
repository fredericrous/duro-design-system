import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Groups related form controls with consistent gap spacing and an optional legend. Supports disabled cascade.',
  whenToUse: [
    'Grouping related fields within a form (e.g., "Personal Info", "Address")',
    'Applying consistent vertical gap between form fields',
  ],
  whenNotToUse: [
    'Non-form content grouping — use Stack or Card',
  ],
  anatomy: {
    required: ['Root'],
    optional: ['Legend'],
  },
  relatedTo: [
    {component: 'Form', relationship: 'Fieldset.Root goes inside Form'},
    {component: 'Field', relationship: 'Field.Root goes inside Fieldset.Root'},
    {component: 'Stack', relationship: 'Similar vertical spacing, but Fieldset has form semantics'},
  ],
  example: `<Form schema={schema} defaultValues={defaults} onSubmit={onSubmit}>
  <Fieldset.Root gap="md">
    <Fieldset.Legend>Account Details</Fieldset.Legend>
    <Field.Root name="email">
      <Field.Label>Email</Field.Label>
      <Input type="email" />
      <Field.Error />
    </Field.Root>
    <Field.Root name="password">
      <Field.Label>Password</Field.Label>
      <Input type="password" />
      <Field.Error />
    </Field.Root>
    <Button type="submit">Create account</Button>
  </Fieldset.Root>
</Form>`,
}
