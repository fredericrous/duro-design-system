import type {Meta, StoryObj} from '@storybook/react'
import {expect, within} from 'storybook/test'
import {useState} from 'react'
import {Drawer} from './Drawer'
import {Button} from '../Button/Button'
import {Text} from '../Text/Text'
import {Inline} from '../Inline/Inline'
import {Stack} from '../Stack/Stack'
import {Input} from '../Input/Input'
import {Field} from '../Field/Field'

const meta: Meta = {
  title: 'Components/Drawer',
}

export default meta
type Story = StoryObj

// --- Default (right anchor) ---

export const Default: Story = {
  render: () => (
    <Drawer.Root>
      <Drawer.Trigger>
        <Button>Open drawer</Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Header>
          <Drawer.Title>Details</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <Text>
            This drawer slides in from the right edge. It's useful for showing details, settings
            panels, or supplementary content without leaving the current page.
          </Text>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button>Save</Button>
        </Drawer.Footer>
      </Drawer.Portal>
    </Drawer.Root>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Open drawer')).toBeInTheDocument()
    expect(canvasElement.ownerDocument.querySelector('[role="dialog"]')).toBeNull()
  },
}

// --- Left anchor ---

export const LeftAnchor: Story = {
  render: () => (
    <Drawer.Root anchor="left">
      <Drawer.Trigger>
        <Button variant="secondary">Open left drawer</Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Header>
          <Drawer.Title>Navigation</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <Stack gap="md">
            <Text variant="label">Menu</Text>
            <Text>Dashboard</Text>
            <Text>Users</Text>
            <Text>Settings</Text>
            <Text>Certificates</Text>
          </Stack>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  ),
}

// --- Bottom anchor (mobile-style) ---

export const BottomAnchor: Story = {
  render: () => (
    <Drawer.Root anchor="bottom">
      <Drawer.Trigger>
        <Button variant="secondary">Open bottom drawer</Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Header>
          <Drawer.Title>Actions</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <Stack gap="sm">
            <Button variant="secondary" fullWidth>
              Share
            </Button>
            <Button variant="secondary" fullWidth>
              Duplicate
            </Button>
            <Button variant="danger" fullWidth>
              Delete
            </Button>
          </Stack>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  ),
}

// --- Sizes ---

function SizesDemo() {
  const [active, setActive] = useState<'sm' | 'md' | 'lg' | null>(null)

  return (
    <Inline gap="sm">
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <Drawer.Root
          key={s}
          open={active === s}
          onOpenChange={(open) => setActive(open ? s : null)}
        >
          <Drawer.Trigger>
            <Button variant="secondary">{s.toUpperCase()}</Button>
          </Drawer.Trigger>
          <Drawer.Portal size={s}>
            <Drawer.Header>
              <Drawer.Title>Size: {s}</Drawer.Title>
              <Drawer.Close />
            </Drawer.Header>
            <Drawer.Body>
              <Text>
                This drawer uses the {s} size preset (
                {s === 'sm' ? '360' : s === 'md' ? '480' : '640'}px max-width).
              </Text>
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close>
                <Button variant="secondary">Close</Button>
              </Drawer.Close>
            </Drawer.Footer>
          </Drawer.Portal>
        </Drawer.Root>
      ))}
    </Inline>
  )
}

export const Sizes: Story = {
  render: () => <SizesDemo />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('SM')).toBeInTheDocument()
    await expect(canvas.getByText('MD')).toBeInTheDocument()
    await expect(canvas.getByText('LG')).toBeInTheDocument()
  },
}

// --- With Form ---

function FormDrawerDemo() {
  const [open, setOpen] = useState(false)

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger>
        <Button>Edit profile</Button>
      </Drawer.Trigger>
      <Drawer.Portal size="md">
        <Drawer.Header>
          <Drawer.Title>Edit profile</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Description>Update your account information below.</Drawer.Description>
        <Drawer.Body>
          <Stack gap="md">
            <Field.Root>
              <Field.Label>Display name</Field.Label>
              <Input placeholder="Enter your name" />
            </Field.Root>
            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input type="email" placeholder="you@example.com" />
            </Field.Root>
            <Field.Root>
              <Field.Label>Bio</Field.Label>
              <Input placeholder="Tell us about yourself" />
            </Field.Root>
          </Stack>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button onClick={() => setOpen(false)}>Save changes</Button>
        </Drawer.Footer>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export const WithForm: Story = {
  render: () => <FormDrawerDemo />,
}

// --- Right anchor (use case) ---

function CertDetailDemo() {
  const [open, setOpen] = useState(false)

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger>
        <Button variant="secondary">View certificate</Button>
      </Drawer.Trigger>
      <Drawer.Portal size="md">
        <Drawer.Header>
          <Drawer.Title>Certificate details</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <Stack gap="md">
            <Stack gap="xs">
              <Text variant="label">Subject</Text>
              <Text variant="bodySm">web-server-prod-2024.pem</Text>
            </Stack>
            <Stack gap="xs">
              <Text variant="label">Issuer</Text>
              <Text variant="bodySm">Duro Internal CA</Text>
            </Stack>
            <Stack gap="xs">
              <Text variant="label">Serial number</Text>
              <Text variant="code">3A:F2:9B:C1:DE:04:71:88</Text>
            </Stack>
            <Stack gap="xs">
              <Text variant="label">Valid from</Text>
              <Text variant="bodySm">Jan 15, 2024</Text>
            </Stack>
            <Stack gap="xs">
              <Text variant="label">Expires</Text>
              <Text variant="bodySm">Jan 15, 2025</Text>
            </Stack>
          </Stack>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close>
            <Button variant="secondary">Close</Button>
          </Drawer.Close>
          <Button variant="danger" onClick={() => setOpen(false)}>
            Revoke
          </Button>
        </Drawer.Footer>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export const RightAnchor: Story = {
  render: () => <CertDetailDemo />,
}

// --- Non-dismissable ---

export const NonDismissable: Story = {
  render: () => (
    <Drawer.Root dismissable={false}>
      <Drawer.Trigger>
        <Button>Open non-dismissable drawer</Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Header>
          <Drawer.Title>Required action</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <Stack gap="md">
            <Text>
              This drawer cannot be dismissed by clicking the backdrop or pressing Escape. You must
              use the explicit close action below.
            </Text>
            <Text variant="bodySm" color="muted">
              Try clicking outside or pressing Escape — nothing happens.
            </Text>
          </Stack>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close>
            <Button>I understand, close</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Portal>
    </Drawer.Root>
  ),
}

// --- No swipe dismiss ---

export const NoSwipeDismiss: Story = {
  render: () => (
    <Drawer.Root swipeDismiss={false} anchor="bottom">
      <Drawer.Trigger>
        <Button variant="secondary">Open (swipe disabled)</Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Header>
          <Drawer.Title>Swipe disabled</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <Text>
            This bottom drawer has swipe-to-dismiss disabled. On mobile, you cannot swipe down to
            close it — use the close button or tap the backdrop instead.
          </Text>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  ),
}

// --- Swipe dismiss demo (bottom) ---

export const SwipeDismiss: Story = {
  render: () => (
    <Drawer.Root anchor="bottom">
      <Drawer.Trigger>
        <Button variant="secondary">Open bottom (swipeable)</Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Header>
          <Drawer.Title>Swipe to dismiss</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <Stack gap="md">
            <Text>Drag this drawer downward to dismiss it. The backdrop fades as you drag.</Text>
            <Text variant="bodySm" color="muted">
              Swipe past 30% of the panel height or flick quickly to dismiss. Otherwise it snaps
              back.
            </Text>
          </Stack>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  ),
}

// --- Swipe dismiss demo (right) ---

export const SwipeDismissRight: Story = {
  render: () => (
    <Drawer.Root anchor="right">
      <Drawer.Trigger>
        <Button variant="secondary">Open right (swipeable)</Button>
      </Drawer.Trigger>
      <Drawer.Portal size="sm">
        <Drawer.Header>
          <Drawer.Title>Swipe right to dismiss</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <Text>Drag this panel to the right to dismiss it. Works with touch and mouse.</Text>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  ),
}
