import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {SideNav} from './SideNav'
import {Icon} from '../Icon/Icon'

const meta: Meta<typeof SideNav.Root> = {
  title: 'Components/SideNav',
  component: SideNav.Root,
  args: {
    onValueChange: fn(),
  },
}

export default meta
type Story = StoryObj<typeof SideNav.Root>

export const Default: Story = {
  render: (args) => (
    <SideNav.Root {...args} defaultValue="dashboard">
      <SideNav.Group label="Overview" defaultExpanded>
        <SideNav.Item value="dashboard">Dashboard</SideNav.Item>
        <SideNav.Item value="analytics">Analytics</SideNav.Item>
      </SideNav.Group>
      <SideNav.Group label="Settings">
        <SideNav.Item value="profile">Profile</SideNav.Item>
        <SideNav.Item value="security">Security</SideNav.Item>
        <SideNav.Item value="notifications">Notifications</SideNav.Item>
      </SideNav.Group>
    </SideNav.Root>
  ),
  play: async ({canvas}) => {
    const nav = canvas.getByRole('navigation')
    await expect(nav).toBeInTheDocument()

    const activeItem = canvas.getByRole('button', {name: 'Dashboard'})
    await expect(activeItem).toHaveAttribute('aria-current', 'page')
  },
}

export const Collapsed: Story = {
  render: (args) => (
    <SideNav.Root {...args}>
      <SideNav.Group label="Section A">
        <SideNav.Item value="a1">Item A1</SideNav.Item>
        <SideNav.Item value="a2">Item A2</SideNav.Item>
      </SideNav.Group>
      <SideNav.Group label="Section B">
        <SideNav.Item value="b1">Item B1</SideNav.Item>
      </SideNav.Group>
    </SideNav.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByText('Section A')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText('Item A1')).toBeInTheDocument()
  },
}

// Regression: a `defaultExpanded` group that ALSO contains the active item used
// to be toggled twice on mount (once by defaultExpanded, once by auto-expand of
// the active group) and end up collapsed, hiding the active item. It must stay
// open.
export const DefaultExpandedWithActiveItem: Story = {
  render: (args) => (
    <SideNav.Root {...args} defaultValue="security">
      <SideNav.Group label="Settings" defaultExpanded>
        <SideNav.Item value="profile">Profile</SideNav.Item>
        <SideNav.Item value="security">Security</SideNav.Item>
      </SideNav.Group>
    </SideNav.Root>
  ),
  play: async ({canvas}) => {
    const trigger = canvas.getByText('Settings')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const active = canvas.getByRole('button', {name: 'Security'})
    await expect(active).toBeInTheDocument()
    await expect(active).toHaveAttribute('aria-current', 'page')
  },
}

export const Interactive: Story = {
  render: (args) => (
    <SideNav.Root {...args}>
      <SideNav.Group label="Pages" defaultExpanded>
        <SideNav.Item value="home">Home</SideNav.Item>
        <SideNav.Item value="about">About</SideNav.Item>
        <SideNav.Item value="contact">Contact</SideNav.Item>
      </SideNav.Group>
    </SideNav.Root>
  ),
  play: async ({canvas, userEvent, args}) => {
    const aboutItem = canvas.getByRole('button', {name: 'About'})
    await userEvent.click(aboutItem)
    await expect(args.onValueChange).toHaveBeenCalledWith('about')
    await expect(aboutItem).toHaveAttribute('aria-current', 'page')
  },
}

// Flat menu: static (non-collapsible) Section headers + per-item icons + the
// active left-marker. This is the AppChrome-style layout — no chevrons, every
// section always open.
export const FlatWithIcons: Story = {
  render: (args) => (
    <SideNav.Root {...args} defaultValue="grants">
      <SideNav.Section label="People & access">
        <SideNav.Item value="identities" icon={<Icon name="users" size={18} />}>
          Identities
        </SideNav.Item>
        <SideNav.Item value="grants" icon={<Icon name="key" size={18} />}>
          Grants
        </SideNav.Item>
      </SideNav.Section>
      <SideNav.Section label="Requests & invites">
        <SideNav.Item value="invitations" icon={<Icon name="mail" size={18} />}>
          Invitations
        </SideNav.Item>
        <SideNav.Item value="invites" icon={<Icon name="user-plus" size={18} />}>
          User Invites
        </SideNav.Item>
      </SideNav.Section>
    </SideNav.Root>
  ),
  play: async ({canvas, userEvent, args}) => {
    // Static section headers render as plain text (no toggle button).
    await expect(canvas.getByText('People & access')).toBeInTheDocument()
    await expect(canvas.queryByRole('button', {name: 'People & access'})).toBeNull()

    // All items are visible immediately (nothing is collapsed).
    const grants = canvas.getByRole('button', {name: 'Grants'})
    await expect(grants).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('button', {name: 'Identities'})).toBeInTheDocument()
    await expect(canvas.getByRole('button', {name: 'User Invites'})).toBeInTheDocument()

    // Selecting another item moves the active state.
    const identities = canvas.getByRole('button', {name: 'Identities'})
    await userEvent.click(identities)
    await expect(args.onValueChange).toHaveBeenCalledWith('identities')
    await expect(identities).toHaveAttribute('aria-current', 'page')
  },
}
