import {useState} from 'react'
import {Link} from 'expo-router'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Cluster,
  Field,
  Grid,
  Heading,
  Inline,
  Input,
  InputGroup,
  Stack,
  Switch,
  Text,
  Textarea,
  ThemeProvider,
  usePortalMount,
} from '@duro-app/ui'

/**
 * Renders every value export of the native barrel, so `expo export` bundles
 * each one. test/exports.test.ts fails when the barrel gains a name this file
 * does not render.
 */
export function AllExports() {
  const [on, setOn] = useState(false)
  const portalMount = usePortalMount()
  return (
    <Stack gap="md">
      <Heading level={1}>Duro native</Heading>
      <Text>Portal mount on native: {portalMount === null ? 'none' : 'present'}</Text>
      <Cluster gap="xs">
        <Badge>Badge</Badge>
        <Badge variant="success">Success</Badge>
      </Cluster>
      <Inline gap="sm">
        <Button onClick={() => setOn((value) => !value)}>Toggle</Button>
        <Link href="/modal">Open the modal route</Link>
      </Inline>
      <Card>
        <Text>Card</Text>
      </Card>
      <Checkbox checked={on} onChange={() => setOn((value) => !value)}>
        Checkbox
      </Checkbox>
      <Switch checked={on} onCheckedChange={setOn} aria-label="Switch" />
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Input placeholder="Input" />
        <Field.Description>Field description</Field.Description>
        <Field.Error />
      </Field.Root>
      <InputGroup.Root>
        <InputGroup.Addon>@</InputGroup.Addon>
        <Input placeholder="In a group" />
      </InputGroup.Root>
      <Textarea placeholder="Textarea" />
      <Grid columns={2} gap="sm">
        <Text>Grid cell 1</Text>
        <Text>Grid cell 2</Text>
      </Grid>
      <ThemeProvider theme="light">
        <Text>Nested light theme</Text>
      </ThemeProvider>
    </Stack>
  )
}
