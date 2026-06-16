import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, screen} from 'storybook/test'
import {Dialog} from '../Dialog/Dialog'
import {Select} from './Select'

const meta: Meta = {
  title: 'Components/Select',
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Select.Root defaultValue="en">
      <Select.Trigger aria-label="Language">
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Popup>
        <Select.Item value="en">
          <Select.ItemText>English</Select.ItemText>
        </Select.Item>
        <Select.Item value="fr">
          <Select.ItemText>Francais</Select.ItemText>
        </Select.Item>
        <Select.Item value="es">
          <Select.ItemText>Espanol</Select.ItemText>
        </Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({canvas}) => {
    const trigger = canvas.getByRole('combobox')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    await expect(trigger).toHaveTextContent(/English/)
  },
}

export const OpenAndSelect: Story = {
  render: () => (
    <Select.Root defaultValue="en">
      <Select.Trigger aria-label="Language">
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Popup>
        <Select.Item value="en">
          <Select.ItemText>English</Select.ItemText>
        </Select.Item>
        <Select.Item value="fr">
          <Select.ItemText>Francais</Select.ItemText>
        </Select.Item>
        <Select.Item value="es">
          <Select.ItemText>Espanol</Select.ItemText>
        </Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('combobox')

    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    // The popup portals to the ThemeProvider mount (outside the story canvas),
    // so query the whole document via `screen`.
    const options = screen.getAllByRole('option')
    await expect(options.length).toBe(3)
    await expect(options[0]).toHaveAttribute('aria-selected', 'true')

    await userEvent.click(options[1])
    await expect(trigger).toHaveTextContent(/Francais/)
    // Closed listbox is aria-hidden, so it's no longer exposed by role.
    await expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  },
}

export const WithPlaceholder: Story = {
  render: () => (
    <Select.Root>
      <Select.Trigger aria-label="Language">
        <Select.Value placeholder="Choose a language..." />
        <Select.Icon />
      </Select.Trigger>
      <Select.Popup>
        <Select.Item value="react">
          <Select.ItemText>React</Select.ItemText>
        </Select.Item>
        <Select.Item value="vue">
          <Select.ItemText>Vue</Select.ItemText>
        </Select.Item>
        <Select.Item value="svelte">
          <Select.ItemText>Svelte</Select.ItemText>
        </Select.Item>
        <Select.Item value="angular">
          <Select.ItemText>Angular</Select.ItemText>
        </Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('combobox')

    // Shows placeholder when nothing selected
    await expect(trigger).toHaveTextContent(/Choose a language\.\.\./)

    // Open and select (options portal to the ThemeProvider mount → use screen)
    await userEvent.click(trigger)
    const options = screen.getAllByRole('option')
    await expect(options.length).toBe(4)

    // None selected initially
    for (const opt of options) {
      await expect(opt).toHaveAttribute('aria-selected', 'false')
    }

    await userEvent.click(screen.getByText('Vue'))
    await expect(trigger).toHaveTextContent(/Vue/)
  },
}

export const KeyboardNavigation: Story = {
  render: () => (
    <Select.Root>
      <Select.Trigger aria-label="Language">
        <Select.Value placeholder="Select..." />
        <Select.Icon />
      </Select.Trigger>
      <Select.Popup>
        <Select.Item value="a">
          <Select.ItemText>Alpha</Select.ItemText>
        </Select.Item>
        <Select.Item value="b">
          <Select.ItemText>Bravo</Select.ItemText>
        </Select.Item>
        <Select.Item value="c">
          <Select.ItemText>Charlie</Select.ItemText>
        </Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)
    await expect(screen.getByRole('listbox')).toBeInTheDocument()
  },
}

// Regression: a Select inside a Dialog. The Dialog clips its content
// (overflow: hidden + body overflowY: auto), so an in-tree absolutely
// positioned popup would be cropped. The popup must portal to the
// ThemeProvider mount (z-index above the Dialog) and render in full.
export const InsideDialog: Story = {
  render: () => (
    <Dialog.Root open onOpenChange={() => {}}>
      <Dialog.Portal>
        <Dialog.Header>
          <Dialog.Title>Add a zone</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Select.Root defaultValue="">
            <Select.Trigger aria-label="Macro-zone">
              <Select.Value placeholder="— No macro-zone —" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Popup>
              <Select.Item value="">
                <Select.ItemText>— No macro-zone —</Select.ItemText>
              </Select.Item>
              <Select.Item value="north">
                <Select.ItemText>North</Select.ItemText>
              </Select.Item>
              <Select.Item value="south">
                <Select.ItemText>South</Select.ItemText>
              </Select.Item>
            </Select.Popup>
          </Select.Root>
        </Dialog.Body>
      </Dialog.Portal>
    </Dialog.Root>
  ),
  play: async ({userEvent}) => {
    // Both the trigger and the (portaled) popup live outside the story canvas:
    // the Dialog itself portals. Query the whole document.
    const trigger = screen.getByRole('combobox', {name: 'Macro-zone'})
    await userEvent.click(trigger)
    const options = screen.getAllByRole('option')
    await expect(options.length).toBe(3)
    // The popup escapes the Dialog: it renders into the portal mount, which is
    // a sibling of (and stacks above) the Dialog — not clipped by it.
    const listbox = screen.getByRole('listbox')
    await expect(listbox).toBeInTheDocument()
    await expect(listbox.closest('[role="dialog"]')).toBeNull()
  },
}
