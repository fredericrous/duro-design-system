import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, waitFor, within} from 'storybook/test'
import {html} from 'react-strict-dom'
import {Button} from '../Button/Button'
import {Popover} from '../Popover/Popover'
import {setViewport} from '../Drawer/touchInput'
import {MasterDetail} from './MasterDetail'

const meta: Meta = {
  title: 'Components/MasterDetail',
}

export default meta
type Story = StoryObj

// The popup is portalled out of the story's canvas, so query the document.
const page = () => within(document.body)

const AGENTS = ['Claude', 'Codex', 'Gemini']
const MODELS = Array.from({length: 12}, (_, index) => `Model ${index + 1}`)
const LONG_DETAIL = Array.from({length: 40}, (_, index) => `Setting ${index + 1}`)

function Picker({maxHeight}: {maxHeight?: 'pickerMaxH' | 'listMaxH'}) {
  return (
    <MasterDetail.Root defaultFocusedValue="Claude" maxHeight={maxHeight}>
      <MasterDetail.Rail aria-label="Agents">
        <MasterDetail.Section title="Agents" count={AGENTS.length}>
          {AGENTS.map((name, index) => (
            <MasterDetail.Item
              key={name}
              value={name}
              selected={index === 0}
              action={<Button size="small" variant="secondary">{`Remove ${name}`}</Button>}
            >
              {name}
            </MasterDetail.Item>
          ))}
        </MasterDetail.Section>
        <MasterDetail.Section title="Models">
          {MODELS.map((name) => (
            <MasterDetail.Item key={name} value={name}>
              {name}
            </MasterDetail.Item>
          ))}
        </MasterDetail.Section>
      </MasterDetail.Rail>
      <MasterDetail.Detail>
        {(value) => (
          <html.div>
            <html.p>{`Details of ${value}`}</html.p>
            {LONG_DETAIL.map((line) => (
              <html.p key={line}>{line}</html.p>
            ))}
          </html.div>
        )}
      </MasterDetail.Detail>
    </MasterDetail.Root>
  )
}

/** A press focuses the item and shows its detail; the check stays on the selected item. */
export const FocusFollowsPress: Story = {
  render: () => <Picker />,
  play: async ({canvas, userEvent}) => {
    const claude = canvas.getByRole('tab', {name: 'Claude'})
    const codex = canvas.getByRole('tab', {name: 'Codex'})
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Details of Claude')
    await userEvent.click(codex)
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Details of Codex')
    await expect(canvas.getByRole('tabpanel')).toHaveAccessibleName('Codex')
    await expect(codex).toHaveAttribute('aria-selected', 'true')
    await expect(claude).toHaveAttribute('aria-current', 'true')
    await expect(codex).not.toHaveAttribute('aria-current')
    await expect(canvas.getByRole('group', {name: 'Agents'})).toBeVisible()
  },
}

const activated = fn()

/** onActivate is a press (click, Enter, Space): the arrows move the detail without it. */
export const ActivateIsAPress: Story = {
  render: () => (
    <MasterDetail.Root defaultFocusedValue="Claude">
      <MasterDetail.Rail aria-label="Agents">
        {AGENTS.map((name) => (
          <MasterDetail.Item key={name} value={name} onActivate={() => activated(name)}>
            {name}
          </MasterDetail.Item>
        ))}
      </MasterDetail.Rail>
      <MasterDetail.Detail>
        {(value) => <html.p>{`Details of ${value}`}</html.p>}
      </MasterDetail.Detail>
    </MasterDetail.Root>
  ),
  play: async ({canvas, userEvent}) => {
    activated.mockClear()
    canvas.getByRole('tab', {name: 'Claude'}).focus()
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(canvas.getByRole('tab', {name: 'Codex'})).toHaveFocus())
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Details of Codex')
    await expect(activated).not.toHaveBeenCalled()
    await userEvent.keyboard('{Enter}')
    await expect(activated).toHaveBeenCalledTimes(1)
    await expect(activated).toHaveBeenCalledWith('Codex')
    await userEvent.click(canvas.getByRole('tab', {name: 'Gemini'}))
    await expect(activated).toHaveBeenLastCalledWith('Gemini')
  },
}

/** Arrow keys move between items; Enter shows the focused item's detail. */
export const Keyboard: Story = {
  render: () => <Picker />,
  play: async ({canvas, userEvent}) => {
    canvas.getByRole('tab', {name: 'Claude'}).focus()
    await userEvent.keyboard('{ArrowDown}')
    const codex = canvas.getByRole('tab', {name: 'Codex'})
    await waitFor(() => expect(codex).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Details of Codex')
    await userEvent.keyboard('{ArrowUp}')
    await waitFor(() => expect(canvas.getByRole('tab', {name: 'Claude'})).toHaveFocus())
  },
}

/** The detail scrolls without moving the rail. */
export const ScrollsIndependently: Story = {
  render: () => <Picker />,
  play: async ({canvas}) => {
    const rail = canvas.getByRole('tablist', {name: 'Agents'})
    const detail = canvas.getByRole('tabpanel')
    await expect(detail.scrollHeight).toBeGreaterThan(detail.clientHeight)
    detail.scrollTop = 200
    await waitFor(() => expect(detail.scrollTop).toBeGreaterThan(0))
    await expect(rail.scrollTop).toBe(0)
  },
}

/** In a flush Popover.Popup capped at the picker size. */
export const InPopover: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger>Pick an agent</Popover.Trigger>
      <Popover.Popup
        label="Agent picker"
        maxWidth="pickerMaxW"
        maxHeight="pickerMaxH"
        padding="flush"
      >
        <Picker />
      </Popover.Popup>
    </Popover.Root>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Pick an agent'}))
    const popup = await page().findByRole('dialog', {name: 'Agent picker'})
    await expect(within(popup).getByRole('tabpanel')).toHaveTextContent('Details of Claude')
    const rect = popup.getBoundingClientRect()
    await expect(rect.width).toBeLessThanOrEqual(720)
    await expect(rect.height).toBeLessThanOrEqual(420)
    await expect(getComputedStyle(popup).paddingTop).toBe('0px')
  },
}

/** Below 640px the rail sits above the detail. */
export const Stacked: Story = {
  render: () => <Picker />,
  play: async ({canvas}) => {
    await setViewport(500, 800)
    try {
      const rail = canvas.getByRole('tablist', {name: 'Agents'})
      const detail = canvas.getByRole('tabpanel')
      await waitFor(() =>
        expect(rail.getBoundingClientRect().bottom).toBeLessThanOrEqual(
          detail.getBoundingClientRect().top + 1,
        ),
      )
    } finally {
      await setViewport(1200, 800)
    }
  },
}
