import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {SideNav} from './SideNav'

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

    const activeItem = canvas.getByText('Dashboard')
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
    const aboutItem = canvas.getByText('About')
    await userEvent.click(aboutItem)
    await expect(args.onValueChange).toHaveBeenCalledWith('about')
    await expect(aboutItem).toHaveAttribute('aria-current', 'page')
  },
}
