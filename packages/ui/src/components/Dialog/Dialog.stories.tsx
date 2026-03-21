import type {Meta, StoryObj} from '@storybook/react'
import {expect, within, userEvent} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {useState} from 'react'
import {Dialog} from './Dialog'
import {Button} from '../Button/Button'
import {Text} from '../Text/Text'
import {Inline} from '../Inline/Inline'
import {Stack} from '../Stack/Stack'
import {Input} from '../Input/Input'
import {Field} from '../Field/Field'
import {Heading} from '../Heading/Heading'

const meta: Meta = {
  title: 'Components/Dialog',
}

export default meta
type Story = StoryObj

// --- Default ---

export const Default: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Open dialog</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Header>
          <Dialog.Title>Confirm action</Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <Text>Are you sure you want to proceed? This action cannot be undone.</Text>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Button variant="primary">Confirm</Button>
        </Dialog.Footer>
      </Dialog.Portal>
    </Dialog.Root>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByText('Open dialog')
    await expect(trigger).toBeInTheDocument()

    // Dialog should not be visible initially
    expect(canvasElement.ownerDocument.querySelector('[role="dialog"]')).toBeNull()
  },
}

// --- WithDescription ---

export const WithDescription: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="danger">Delete account</Button>
      </Dialog.Trigger>
      <Dialog.Portal size="sm">
        <Dialog.Header>
          <Dialog.Title>Delete account</Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Description>
          This will permanently delete your account and all associated data.
        </Dialog.Description>
        <Dialog.Body>
          <Text>Please type "DELETE" to confirm.</Text>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Button variant="danger">Delete</Button>
        </Dialog.Footer>
      </Dialog.Portal>
    </Dialog.Root>
  ),
}

// --- Sizes ---

function SizeDemo() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | null>(null)

  return (
    <Inline gap="sm">
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <Dialog.Root key={s} open={size === s} onOpenChange={(open) => setSize(open ? s : null)}>
          <Dialog.Trigger>
            <Button variant="secondary">{s.toUpperCase()}</Button>
          </Dialog.Trigger>
          <Dialog.Portal size={s}>
            <Dialog.Header>
              <Dialog.Title>Size: {s}</Dialog.Title>
              <Dialog.Close />
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                This dialog uses the <html.strong>{s}</html.strong> size preset.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close>
                <Button variant="secondary">Close</Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Portal>
        </Dialog.Root>
      ))}
    </Inline>
  )
}

export const Sizes: Story = {
  render: () => <SizeDemo />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('SM')).toBeInTheDocument()
    await expect(canvas.getByText('MD')).toBeInTheDocument()
    await expect(canvas.getByText('LG')).toBeInTheDocument()
  },
}

// --- Controlled ---

function ControlledDemo() {
  const [open, setOpen] = useState(false)

  return (
    <Stack gap="md">
      <Inline gap="sm">
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Text variant="caption">Status: {open ? 'Open' : 'Closed'}</Text>
      </Inline>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Header>
            <Dialog.Title>Controlled dialog</Dialog.Title>
            <Dialog.Close />
          </Dialog.Header>
          <Dialog.Body>
            <Text>This dialog is controlled via the open prop.</Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close programmatically
            </Button>
          </Dialog.Footer>
        </Dialog.Portal>
      </Dialog.Root>
    </Stack>
  )
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

// --- WithForm ---

function FormDialogDemo() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button>Edit profile</Button>
      </Dialog.Trigger>
      <Dialog.Portal size="md">
        <Dialog.Header>
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Description>
          Update your display name and email address.
        </Dialog.Description>
        <Dialog.Body>
          <Stack gap="md">
            <Field.Root>
              <Field.Label>Display name</Field.Label>
              <Input placeholder="Enter your name" />
            </Field.Root>
            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input type="email" placeholder="you@example.com" />
            </Field.Root>
          </Stack>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Button onClick={() => setOpen(false)}>Save changes</Button>
        </Dialog.Footer>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export const WithForm: Story = {
  render: () => <FormDialogDemo />,
}

// --- Danger confirmation ---

function DangerDialogDemo() {
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  return (
    <Stack gap="md">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <Button variant="danger">Revoke certificate</Button>
        </Dialog.Trigger>
        <Dialog.Portal size="sm">
          <Dialog.Header>
            <Dialog.Title>Revoke certificate</Dialog.Title>
            <Dialog.Close />
          </Dialog.Header>
          <Dialog.Description>
            This will immediately invalidate the certificate. Connected devices will lose access.
          </Dialog.Description>
          <Dialog.Body>
            <Text variant="bodySm">Certificate: web-server-prod-2024.pem</Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmed(true)
                setOpen(false)
              }}
            >
              Revoke
            </Button>
          </Dialog.Footer>
        </Dialog.Portal>
      </Dialog.Root>
      {confirmed && <Text variant="bodySm">Certificate revoked.</Text>}
    </Stack>
  )
}

export const DangerConfirmation: Story = {
  render: () => <DangerDialogDemo />,
}

// --- Non-dismissable (modal) ---

export const NonDismissable: Story = {
  render: () => (
    <Dialog.Root dismissable={false}>
      <Dialog.Trigger>
        <Button>Open non-dismissable</Button>
      </Dialog.Trigger>
      <Dialog.Portal size="sm">
        <Dialog.Header>
          <Dialog.Title>Terms of service</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Stack gap="md">
            <Text>
              You must accept the terms of service to continue. This dialog cannot be
              dismissed by clicking outside or pressing Escape.
            </Text>
            <Text variant="bodySm" color="muted">
              Try clicking the backdrop or pressing Escape — the dialog stays open.
            </Text>
          </Stack>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="secondary">Decline</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button>Accept</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Portal>
    </Dialog.Root>
  ),
}

// --- Backdrop dismiss ---

function BackdropDismissDemo() {
  const [lastAction, setLastAction] = useState('')

  return (
    <Stack gap="md">
      <Dialog.Root onOpenChange={(open) => !open && setLastAction('Dismissed')}>
        <Dialog.Trigger>
          <Button variant="secondary">Open dialog</Button>
        </Dialog.Trigger>
        <Dialog.Portal size="sm">
          <Dialog.Header>
            <Dialog.Title>Click outside to close</Dialog.Title>
            <Dialog.Close />
          </Dialog.Header>
          <Dialog.Body>
            <Text>
              Click the dark backdrop behind this dialog to dismiss it.
              You can also press Escape or use the close button.
            </Text>
          </Dialog.Body>
        </Dialog.Portal>
      </Dialog.Root>
      {lastAction && <Text variant="bodySm">Last action: {lastAction}</Text>}
    </Stack>
  )
}

export const BackdropDismiss: Story = {
  render: () => <BackdropDismissDemo />,
}
