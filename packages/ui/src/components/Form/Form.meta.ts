import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Form wrapper with Effect Schema validation and react-hook-form integration. Provides FormContext to child Field components.',
  whenToUse: ['Any form that needs validation', 'Multi-field forms with submit handling'],
  whenNotToUse: [
    'Single standalone field without validation — use Field.Root directly',
    'Non-form interactive UIs — use individual components',
  ],
  relatedTo: [
    {component: 'Field', relationship: 'Field.Root auto-binds to Form via name prop'},
    {component: 'Fieldset', relationship: 'Groups fields visually within a Form'},
  ],
  example: `import {Schema} from 'effect'

const MySchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.pattern(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, {message: () => 'Invalid email'}),
  ),
})

<Form schema={MySchema} defaultValues={{email: ''}} onSubmit={handleSubmit}>
  {({formState}) => (
    <Fieldset.Root gap="md">
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" />
        <Field.Error />
      </Field.Root>
      <Button type="submit" disabled={!formState.isValid}>Submit</Button>
    </Fieldset.Root>
  )}
</Form>`,
}
