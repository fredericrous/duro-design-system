import {useRef, useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, waitFor, within} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {Popover, type PopoverHandle} from './Popover'
import {Button} from '../Button/Button'
import {Field} from '../Field/Field'
import {Input} from '../Input/Input'
import {Select} from '../Select/Select'
import {Stack} from '../Stack/Stack'

const meta: Meta = {
  title: 'Components/Popover',
}

export default meta
type Story = StoryObj

// The popup is portalled out of the story's canvas, so query the document.
const page = () => within(document.body)

const styles = css.create({
  stage: {
    position: 'relative',
    height: 320,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: spacing.md,
  },
  spot: {
    position: 'absolute',
    top: 120,
    left: 160,
    width: 120,
    padding: spacing.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.accent,
  },
  shifted: {
    transform: 'translateX(120px)',
  },
})

export const Default: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger>Rename</Popover.Trigger>
      <Popover.Popup label="Rename">
        <Stack gap="sm">
          <Field.Root>
            <Field.Label>Label</Field.Label>
            <Input defaultValue="Get started" />
          </Field.Root>
          <Popover.Close>Done</Popover.Close>
        </Stack>
      </Popover.Popup>
    </Popover.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('button', {name: 'Rename'})
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const dialog = page().getByRole('dialog', {name: 'Rename'})
    await expect(dialog).toBeVisible()
    // Focus moves to the first field.
    await waitFor(() => expect(page().getByRole('textbox', {name: 'Label'})).toHaveFocus())

    await userEvent.keyboard('{Escape}')
    await expect(page().queryByRole('dialog')).not.toBeInTheDocument()
    // ...and comes back to the trigger.
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const CloseButton: Story = {
  render: Default.render,
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('button', {name: 'Rename'})
    await userEvent.click(trigger)
    await userEvent.click(page().getByRole('button', {name: 'Done'}))
    await expect(page().queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

function WithIgnored({onOpenChange}: {onOpenChange: (open: boolean) => void}) {
  const ignored = useRef<HTMLButtonElement | null>(null)
  return (
    <Stack gap="md">
      <Popover.Root onOpenChange={onOpenChange} ignore={[() => ignored.current]}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup label="Item">
          <Popover.Close>Close</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
      <html.button ref={ignored} type="button">
        Grip (ignored)
      </html.button>
      <html.button type="button">Elsewhere</html.button>
    </Stack>
  )
}

export const OutsidePress: Story = {
  render: () => <WithIgnored onOpenChange={fn()} />,
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Open'}))
    await expect(page().getByRole('dialog', {name: 'Item'})).toBeVisible()

    // A press on an ignored element keeps it open.
    await userEvent.click(canvas.getByRole('button', {name: 'Grip (ignored)'}))
    await expect(page().getByRole('dialog', {name: 'Item'})).toBeVisible()

    // A press anywhere else closes it.
    await userEvent.click(canvas.getByRole('button', {name: 'Elsewhere'}))
    await expect(page().queryByRole('dialog')).not.toBeInTheDocument()
  },
}

export const NestedSelectOwnsEscape: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger>Style</Popover.Trigger>
      <Popover.Popup label="Style">
        <Select.Root defaultValue="primary">
          <Select.Trigger aria-label="Variant">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Popup>
            <Select.Item value="primary">
              <Select.ItemText>Primary</Select.ItemText>
            </Select.Item>
            <Select.Item value="secondary">
              <Select.ItemText>Secondary</Select.ItemText>
            </Select.Item>
          </Select.Popup>
        </Select.Root>
      </Popover.Popup>
    </Popover.Root>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Style'}))
    const variant = page().getByRole('combobox', {name: 'Variant'})
    await userEvent.click(variant)
    await expect(variant).toHaveAttribute('aria-expanded', 'true')

    // The first Esc closes only the Select...
    await userEvent.keyboard('{Escape}')
    await expect(variant).toHaveAttribute('aria-expanded', 'false')
    await expect(page().getByRole('dialog', {name: 'Style'})).toBeVisible()

    // ...the second closes the popover.
    await userEvent.keyboard('{Escape}')
    await expect(page().queryByRole('dialog')).not.toBeInTheDocument()
  },
}

function VirtualAnchorDemo() {
  const spot = useRef<HTMLDivElement | null>(null)
  const handle = useRef<PopoverHandle | null>(null)
  const [open, setOpen] = useState(false)
  const [shifted, setShifted] = useState(false)
  return (
    <Stack gap="sm">
      <Button onClick={() => setOpen(true)}>Edit the spot</Button>
      <html.div style={styles.stage}>
        <html.div ref={spot} style={[styles.spot, shifted && styles.shifted]}>
          Spot
        </html.div>
      </html.div>
      <Popover.Root
        ref={handle}
        open={open}
        onOpenChange={setOpen}
        anchor={() => spot.current!.getBoundingClientRect()}
      >
        <Popover.Popup label="Spot">
          <Stack gap="sm">
            <Button
              variant="secondary"
              onClick={() => {
                setShifted((s) => !s)
                // The anchor moved without a scroll or resize: re-measure.
                requestAnimationFrame(() => handle.current?.reposition())
              }}
            >
              Move the spot
            </Button>
            <Popover.Close>Done</Popover.Close>
          </Stack>
        </Popover.Popup>
      </Popover.Root>
    </Stack>
  )
}

export const VirtualAnchor: Story = {
  render: () => <VirtualAnchorDemo />,
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Edit the spot'}))
    const dialog = page().getByRole('dialog', {name: 'Spot'})
    const spot = canvas.getByText('Spot')
    await waitFor(() =>
      expect(dialog.getBoundingClientRect().left).toBeCloseTo(spot.getBoundingClientRect().left, 0),
    )
    // Below the spot (side bottom).
    await expect(dialog.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      spot.getBoundingClientRect().bottom,
    )

    const before = spot.getBoundingClientRect().left
    await userEvent.click(page().getByRole('button', {name: 'Move the spot'}))
    await waitFor(() => expect(spot.getBoundingClientRect().left).toBeGreaterThan(before))
    await waitFor(() =>
      expect(dialog.getBoundingClientRect().left).toBeCloseTo(spot.getBoundingClientRect().left, 0),
    )
  },
}
