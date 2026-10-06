import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor, within} from 'storybook/test'
import {userEvent} from '@testing-library/user-event'
import {html} from 'react-strict-dom'
import {Popover} from './Popover'
import {Select} from '../Select/Select'
import {Combobox} from '../Combobox/Combobox'
import {Menu} from '../Menu/Menu'
import {Stack} from '../Stack/Stack'

const meta: Meta = {
  title: 'Components/Popover/Layers',
}

export default meta
type Story = StoryObj

// Nested popups are portalled out of the canvas, so query the document.
const page = () => within(document.body)

const dialog = () => page().queryByRole('dialog', {name: 'Style'})

function SelectItems() {
  return (
    <Select.Popup>
      <Select.Item value="primary">
        <Select.ItemText>Primary</Select.ItemText>
      </Select.Item>
      <Select.Item value="secondary">
        <Select.ItemText>Secondary</Select.ItemText>
      </Select.Item>
    </Select.Popup>
  )
}

function VariantSelect() {
  return (
    <Select.Root defaultValue="primary">
      <Select.Trigger aria-label="Variant">
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <SelectItems />
    </Select.Root>
  )
}

function FruitCombobox() {
  return (
    <Combobox.Root>
      <Combobox.Input placeholder="Search fruit...">
        <Combobox.Trigger />
      </Combobox.Input>
      <Combobox.Popup>
        <Combobox.Item value="apple">
          <Combobox.ItemText>Apple</Combobox.ItemText>
        </Combobox.Item>
        <Combobox.Item value="banana">
          <Combobox.ItemText>Banana</Combobox.ItemText>
        </Combobox.Item>
      </Combobox.Popup>
    </Combobox.Root>
  )
}

function Host({children}: {children: React.ReactNode}) {
  return (
    <Stack gap="md">
      <Popover.Root>
        <Popover.Trigger>Style</Popover.Trigger>
        <Popover.Popup label="Style">{children}</Popover.Popup>
      </Popover.Root>
      <html.button type="button">Elsewhere</html.button>
    </Stack>
  )
}

export const SelectOutsideField: Story = {
  render: () => (
    <Host>
      <VariantSelect />
    </Host>
  ),
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Style'}))
    const trigger = page().getByRole('combobox', {name: 'Variant'})
    await userEvent.click(trigger)
    await userEvent.click(page().getByRole('option', {name: 'Secondary'}))
    await expect(trigger).toHaveTextContent('Secondary')
    await expect(dialog()).toBeInTheDocument()
  },
}

export const ComboboxOutsideField: Story = {
  render: () => (
    <Host>
      <FruitCombobox />
    </Host>
  ),
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Style'}))
    const input = page().getByRole('combobox')
    await userEvent.click(input)
    await userEvent.click(await page().findByRole('option', {name: 'Banana'}))
    await waitFor(() => expect(input).toHaveValue('Banana'))
    await expect(dialog()).toBeInTheDocument()
  },
}

export const SelectBackdropPress: Story = {
  render: () => (
    <Host>
      <VariantSelect />
    </Host>
  ),
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Style'}))
    const trigger = page().getByRole('combobox', {name: 'Variant'})
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // The backdrop covers the viewport: a press at the corner lands on it.
    const backdrop = document.elementFromPoint(2, 2) as HTMLElement
    await userEvent.click(backdrop)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(dialog()).toBeInTheDocument()

    // With the Select closed, an outside press closes the Popover.
    await userEvent.click(canvas.getByRole('button', {name: 'Elsewhere'}))
    await expect(dialog()).not.toBeInTheDocument()
  },
}

export const SelectOutsidePopover: Story = {
  render: () => (
    <Stack gap="md">
      <Popover.Root>
        <Popover.Trigger>Style</Popover.Trigger>
        <Popover.Popup label="Style">
          <Popover.Close>Done</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
      <VariantSelect />
    </Stack>
  ),
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Style'}))
    await expect(dialog()).toBeInTheDocument()
    // The Select is not inside the Popover: choosing from it is an outside press.
    await userEvent.click(canvas.getByRole('combobox', {name: 'Variant'}))
    await userEvent.click(page().getByRole('option', {name: 'Secondary'}))
    await expect(dialog()).not.toBeInTheDocument()
  },
}

export const EscapeInNestedSelect: Story = {
  render: () => (
    <Host>
      <VariantSelect />
    </Host>
  ),
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Style'}))
    const trigger = page().getByRole('combobox', {name: 'Variant'})
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Escape}')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(dialog()).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await expect(dialog()).not.toBeInTheDocument()
  },
}

export const EscapeInNestedMenu: Story = {
  render: () => (
    <Host>
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Copy</Menu.Item>
          <Menu.Item>Paste</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </Host>
  ),
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Style'}))
    await userEvent.click(page().getByRole('button', {name: 'Actions'}))
    await expect(await page().findByRole('menu')).toBeVisible()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(page().queryByRole('menu')).not.toBeInTheDocument())
    await expect(dialog()).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await expect(dialog()).not.toBeInTheDocument()
  },
}

export const EscapeInNestedCombobox: Story = {
  render: () => (
    <Host>
      <FruitCombobox />
    </Host>
  ),
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Style'}))
    const input = page().getByRole('combobox')
    await userEvent.click(input)
    await expect(await page().findByRole('listbox')).toBeVisible()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(page().queryByRole('listbox')).not.toBeInTheDocument())
    await expect(dialog()).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await expect(dialog()).not.toBeInTheDocument()
  },
}

export const TabFromNestedSelect: Story = {
  render: () => (
    <Host>
      <VariantSelect />
      <html.button type="button">After</html.button>
    </Host>
  ),
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Style'}))
    const trigger = page().getByRole('combobox', {name: 'Variant'})
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.tab()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => expect(trigger).not.toHaveFocus())
  },
}
