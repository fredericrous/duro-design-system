import {useState} from 'react'
import {Schema} from 'effect'
import {Button, Field, Input, ScrollArea, Stack, Text} from '@duro-app/ui'
import {Form} from '@duro-app/ui/form'

const NameSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.minLength(2, {message: () => 'Name must be at least 2 characters'}),
  ),
})

const LINES = Array.from({length: 30}, (_, i) => `Log line ${i + 1}`)

/**
 * Checkpoint C scenarios for C2: a Form submitted by a type="submit" Button
 * (no DOM submit event on native), and a ScrollArea capped at listMaxHSm.
 */
export function FormDemo() {
  const [submitted, setSubmitted] = useState<string | null>(null)
  return (
    <Stack gap="sm">
      <Form
        schema={NameSchema}
        defaultValues={{name: ''}}
        onSubmit={(data) => setSubmitted(data.name)}
      >
        <Stack gap="sm">
          <Field.Root name="name">
            <Field.Label>Project name</Field.Label>
            <Input placeholder="At least 2 characters" />
            <Field.Error />
          </Field.Root>
          <Button type="submit">Create project</Button>
        </Stack>
      </Form>
      <Text>Submitted: {submitted ?? 'nothing yet'}</Text>
      <ScrollArea.Root>
        <ScrollArea.Viewport maxHeight="listMaxHSm">
          <ScrollArea.Content>
            {LINES.map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </Stack>
  )
}
