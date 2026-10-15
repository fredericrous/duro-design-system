import {useState} from 'react'
import {Link} from 'expo-router'
import {DialogDemo} from './DialogDemo'
import {SheetDemo} from './SheetDemo'
import {PickerDemo} from './PickerDemo'
import {FormDemo} from './FormDemo'
import {ThemeDemo} from './ThemeDemo'
import {OverlayDemo} from './OverlayDemo'
import {ToastDemo} from './ToastDemo'
import {
  Alert,
  Badge,
  Button,
  Callout,
  Card,
  Checkbox,
  Cluster,
  EmptyState,
  Field,
  Grid,
  Heading,
  Icon,
  Inline,
  Input,
  InputGroup,
  List,
  Meter,
  PageShell,
  Panel,
  QrCode,
  RadioGroup,
  Spinner,
  Stack,
  StatusIcon,
  Switch,
  Text,
  Textarea,
  TextLink,
  ThemeProvider,
  Toggle,
  usePortalMount,
  useResolvedColors,
} from '@duro-app/ui'

/**
 * Renders every value export of the native barrel, so `expo export` bundles
 * each one. scripts/test/native-example-exports.test.ts fails when the barrel
 * gains a name no example screen renders.
 */
export function AllExports() {
  const [on, setOn] = useState(false)
  const portalMount = usePortalMount()
  const resolved = useResolvedColors()
  const [plan, setPlan] = useState('team')
  return (
    <PageShell>
      <Stack gap="md">
        <Heading level={1}>Duro native</Heading>
        <ThemeDemo />
        <DialogDemo label="Open a dialog" />
        <SheetDemo />
        <PickerDemo />
        <FormDemo />
        <OverlayDemo />
        <ToastDemo />
        <Alert variant="success">Alert with its variant icon</Alert>
        <Callout variant="warning">Callout with its variant icon</Callout>
        <Inline gap="sm">
          <Icon name="server" />
          <StatusIcon name="check-circle" variant="success" size="lg" />
          <Spinner label="Loading" />
        </Inline>
        <Meter value={2} max={3} label="Work in progress" valueText="2 of 3" />
        <QrCode value="https://example.com/pair?key=abc" label="Scan to pair" />
        <RadioGroup.Root value={plan} onValueChange={setPlan} aria-label="Plan">
          <RadioGroup.Item value="solo">Solo</RadioGroup.Item>
          <RadioGroup.Item value="team">Team</RadioGroup.Item>
        </RadioGroup.Root>
        <Toggle aria-label="Bold">B</Toggle>
        <List.Root aria-label="Sessions">
          <List.Item>
            <List.Content>
              <List.Text>A list item</List.Text>
            </List.Content>
          </List.Item>
        </List.Root>
        <EmptyState message="Nothing here yet" icon={<Icon name="box" />} />
        <Text>Portal mount on native: {portalMount === null ? 'none' : 'present'}</Text>
        <Text>Resolved accent: {resolved.accent}</Text>
        <Cluster gap="xs">
          <Badge>Badge</Badge>
          <Badge variant="success">Success</Badge>
        </Cluster>
        <Inline gap="sm">
          <Button onClick={() => setOn((value) => !value)}>Toggle</Button>
          <Link href="/modal">Open the modal route</Link>
          <Link href="/shell">Open the app shell</Link>
        </Inline>
        <Card>
          <Text>Card</Text>
        </Card>
        <Panel.Root bordered>
          <Panel.Header>
            <Heading level={3}>Panel</Heading>
          </Panel.Header>
          <Panel.Body>
            <Text>
              Panel body with a <TextLink href="https://example.com">text link</TextLink>
            </Text>
          </Panel.Body>
        </Panel.Root>
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
    </PageShell>
  )
}
