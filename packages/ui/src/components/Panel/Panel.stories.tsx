import type {Meta, StoryObj} from '@storybook/react'
import {Panel} from './Panel'
import {Button} from '../Button/Button'
import {Text} from '../Text/Text'
import {Heading} from '../Heading/Heading'
import {Stack} from '../Stack/Stack'
import {Inline} from '../Inline/Inline'
import {Field} from '../Field/Field'
import {Input} from '../Input/Input'

const meta: Meta = {
  title: 'Components/Panel',
  argTypes: {
    bordered: {
      control: 'boolean',
      description: 'Whether the panel has an outer border for visual separation',
    },
  },
}

export default meta
type Story = StoryObj

// --- Default ---

export const Default: Story = {
  render: () => (
    <Panel.Root>
      <Panel.Header>
        <Heading level={3}>Section Title</Heading>
      </Panel.Header>
      <Panel.Body>
        <Text>
          Panel is a structural primitive for grouping content with header, body, and footer slots.
          It fills the gap between Card and page-level layout.
        </Text>
      </Panel.Body>
      <Panel.Footer>
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </Panel.Footer>
    </Panel.Root>
  ),
}

// --- Bordered ---

export const Bordered: Story = {
  render: () => (
    <Panel.Root bordered>
      <Panel.Header>
        <Heading level={3}>Bordered Panel</Heading>
        <Button variant="secondary" size="small">
          Action
        </Button>
      </Panel.Header>
      <Panel.Body>
        <Text>
          The bordered variant adds an outer border, useful when the panel needs visual separation
          from its surroundings.
        </Text>
      </Panel.Body>
      <Panel.Footer>
        <Button>Confirm</Button>
      </Panel.Footer>
    </Panel.Root>
  ),
}

// --- Body Only ---

export const BodyOnly: Story = {
  render: () => (
    <Panel.Root bordered>
      <Panel.Body>
        <Text>
          Panel sub-components can be used independently. This panel only has a Body — no Header or
          Footer.
        </Text>
      </Panel.Body>
    </Panel.Root>
  ),
}

// --- Unpadded Body ---

export const UnpaddedBody: Story = {
  render: () => (
    <Panel.Root bordered>
      <Panel.Header>
        <Heading level={3}>Full-bleed Content</Heading>
      </Panel.Header>
      <Panel.Body padded={false}>
        <Text>
          Setting padded=false removes body padding, useful for content that needs to extend
          edge-to-edge (tables, images, etc).
        </Text>
      </Panel.Body>
    </Panel.Root>
  ),
}

// --- With Form ---

export const WithForm: Story = {
  render: () => (
    <Panel.Root bordered>
      <Panel.Header>
        <Heading level={3}>Profile Settings</Heading>
      </Panel.Header>
      <Panel.Body>
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
      </Panel.Body>
      <Panel.Footer>
        <Inline gap="sm">
          <Button variant="secondary">Cancel</Button>
          <Button>Save changes</Button>
        </Inline>
      </Panel.Footer>
    </Panel.Root>
  ),
}
