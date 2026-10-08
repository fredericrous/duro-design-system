import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {TextLink} from './TextLink'
import {clickLink} from '../../docs/clickLink'
import {onThemeSurface} from '../../docs/themedSurface'
import type {OnNavigate} from '../../shared/navigate'
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

/**
 * Client-side navigation: `onNavigate` gets a plain primary click (the app
 * calls `event.preventDefault()`, then its router's navigate); a modified
 * click, or a link with `target`, keeps the browser default.
 */
export const ClientNavigation: StoryObj<{onNavigate: OnNavigate}> = {
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
  args: {onNavigate: fn()},
  render: (args) => (
    <>
      <TextLink href="#billing" onNavigate={args.onNavigate}>
        Billing settings
      </TextLink>{' '}
      <TextLink href="#help" target="_blank" onNavigate={args.onNavigate}>
        Help
      </TextLink>
    </>
  ),
  play: async ({args, canvas}) => {
    const onNavigate = args.onNavigate as unknown as ReturnType<typeof fn>
    onNavigate.mockImplementation((_href: string, event: {preventDefault(): void}) =>
      event.preventDefault(),
    )
    const link = canvas.getByRole('link', {name: 'Billing settings'})
    await expect(clickLink(link).defaultPrevented).toBe(true)
    await expect(onNavigate).toHaveBeenCalledTimes(1)
    await expect(onNavigate.mock.calls[0][0]).toBe('#billing')
    for (const init of [{metaKey: true}, {ctrlKey: true}, {shiftKey: true}, {altKey: true}]) {
      await expect(clickLink(link, init).defaultPrevented).toBe(false)
    }
    // a target opens where it says, not through the router
    const help = canvas.getByRole('link', {name: 'Help'})
    await expect(clickLink(help).defaultPrevented).toBe(false)
    await expect(onNavigate).toHaveBeenCalledTimes(1)
  },
}
