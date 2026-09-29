import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, spyOn} from 'storybook/test'
import {Menu} from './Menu'
import {Button} from '../Button/Button'

const meta: Meta = {
  title: 'Components/Menu',
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const handleSettings = fn()
    const handleProfile = fn()
    return (
      <Menu.Root>
        <Menu.Trigger>
          Options{' '}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{verticalAlign: 'middle'}}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </Menu.Trigger>
        <Menu.Popup>
          <Menu.Item onClick={handleSettings}>Settings</Menu.Item>
          <Menu.Item onClick={handleProfile}>Profile</Menu.Item>
          <Menu.Item>Logout</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    )
  },
  play: async ({canvas}) => {
    const trigger = canvas.getByRole('button', {name: /Options/})
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
  },
}

export const OpenClose: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>Options</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>Settings</Menu.Item>
        <Menu.Item>Profile</Menu.Item>
        <Menu.Item>Logout</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('button', {name: /Options/})

    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const items = canvas.getAllByRole('menuitem')
    await expect(items.length).toBe(3)

    await userEvent.keyboard('{Escape}')
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
  },
}

export const KeyboardNavigation: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>
        Navigate{' '}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{verticalAlign: 'middle'}}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>First</Menu.Item>
        <Menu.Item>Second</Menu.Item>
        <Menu.Item>Third</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('button', {name: /Navigate/})
    await userEvent.click(trigger)
    await expect(canvas.getByRole('menu')).toBeInTheDocument()
  },
}

export const WithLinks: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>
        Account{' '}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{verticalAlign: 'middle'}}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </Menu.Trigger>
      <Menu.Popup>
        <Menu.LinkItem href="#admin">Admin</Menu.LinkItem>
        <Menu.LinkItem href="#settings">Settings</Menu.LinkItem>
        <Menu.LinkItem href="#logout">Logout</Menu.LinkItem>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: /Account/}))

    const items = canvas.getAllByRole('menuitem')
    await expect(items.length).toBe(3)

    // Link items should be anchor elements with href
    await expect(items[0].tagName).toBe('A')
    await expect(items[0]).toHaveAttribute('href', '#admin')
  },
}

export const WithSeparator: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>History</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>Added SCADA to Operations</Menu.Item>
        <Menu.Item>Renamed 2 capabilities</Menu.Item>
        <Menu.Separator />
        <Menu.Item>See full history</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: /History/}))
    const menu = canvas.getByRole('menu')
    const separator = canvas.getByRole('separator')
    await expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    // The separator is not an item: three items, and arrows pass over it.
    const items = canvas.getAllByRole('menuitem')
    await expect(items.length).toBe(3)
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await expect(menu).toHaveAttribute('aria-activedescendant', items[2].id)
  },
}

// Misuse on purpose, so it runs as a test but stays out of the sidebar:
// Menu.Trigger is the button, and a Button inside it earns a dev warning.
export const NestedControlWarns: Story = {
  tags: ['!dev', '!autodocs'],
  beforeEach: () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {})
    return () => warn.mockRestore()
  },
  render: () => (
    <Menu.Root>
      <Menu.Trigger>
        <Button variant="secondary">Nested</Button>
      </Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>Edit</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async () => {
    await expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Menu.Trigger is itself the button'),
    )
  },
}
