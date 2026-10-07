import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {TextLink} from './TextLink'
import {Text} from '../Text/Text'
import {Inline} from '../Inline/Inline'

const meta: Meta<typeof TextLink> = {
  title: 'Components/TextLink',
  component: TextLink,
  args: {href: '#guide', children: 'migration guide'},
}

export default meta
type Story = StoryObj<typeof TextLink>

export const InRunningText: Story = {
  render: () => (
    <Text>
      Your workspace moved to the new plan. Read the{' '}
      <TextLink href="#guide">migration guide</TextLink> before you change seats, or{' '}
      <TextLink href="#plans" variant="subtle">
        compare plans
      </TextLink>{' '}
      first.
    </Text>
  ),
  play: async ({canvas}) => {
    for (const name of ['migration guide', 'compare plans']) {
      const link = canvas.getByRole('link', {name})
      // Underlined in both variants: colour is never the only cue.
      await expect(getComputedStyle(link).textDecorationLine).toContain('underline')
    }
  },
}

export const Standalone: Story = {
  render: () => (
    <Inline gap="lg">
      <TextLink href="#all">View all requests</TextLink>
      <TextLink href="#profile" variant="subtle">
        Edit profile
      </TextLink>
      <TextLink href="https://example.com/docs" target="_blank">
        Documentation
      </TextLink>
    </Inline>
  ),
  play: async ({canvas}) => {
    const external = canvas.getByRole('link', {name: 'Documentation'})
    await expect(external).toHaveAttribute('target', '_blank')
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

export const KeyboardFocus: Story = {
  render: () => <TextLink href="#billing">Billing settings</TextLink>,
  play: async ({canvas, userEvent}) => {
    await userEvent.tab()
    const link = canvas.getByRole('link', {name: 'Billing settings'})
    await expect(link).toHaveFocus()
    await expect(getComputedStyle(link).outlineStyle).toBe('solid')
  },
}
