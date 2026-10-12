import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, waitFor} from 'storybook/test'
import {page} from 'vitest/browser'
import {SIZES_PX, SPACING_PX} from '@duro-app/tokens/keys'
import {SplitPane} from './SplitPane'
import {List} from '../List/List'
import {Panel} from '../Panel/Panel'
import {Heading} from '../Heading/Heading'
import {Text} from '../Text/Text'

const meta: Meta = {
  title: 'Components/SplitPane',
  parameters: {layout: 'fullscreen'},
}

export default meta
type Story = StoryObj

const SESSIONS = ['Refactor auth', 'Flaky e2e', 'Release notes', 'Docs pass', 'Perf trace']

/** The picked B0 direction (docs/mockups/split-pane/Hairline.dc.html). */
function Split() {
  return (
    <SplitPane.Root aria-label="Resize the session list" minSize="sidebarW" maxSize="panelLg">
      <SplitPane.Pane>
        <List.Root aria-label="Sessions">
          {SESSIONS.map((s) => (
            <List.Item key={s}>
              <List.Text>{s}</List.Text>
            </List.Item>
          ))}
        </List.Root>
      </SplitPane.Pane>
      <SplitPane.Handle />
      <SplitPane.Pane>
        <Panel.Root>
          <Panel.Header>
            <Heading level={2}>Refactor auth</Heading>
          </Panel.Header>
          <Panel.Body>
            <Text>The transcript of the selected session.</Text>
          </Panel.Body>
        </Panel.Root>
      </SplitPane.Pane>
    </SplitPane.Root>
  )
}

export const Default: Story = {
  render: () => <Split />,
}

const separator = () => document.querySelector<HTMLElement>('[role="separator"]')

export const KeyboardMovesTheSeparator: Story = {
  render: () => <Split />,
  beforeEach: async () => {
    await page.viewport(1200, 800)
  },
  play: async () => {
    await waitFor(() => expect(separator()).not.toBeNull())
    const handle = separator()!
    const primary = document.getElementById(handle.getAttribute('aria-controls')!)!
    await expect(handle).toHaveAttribute('aria-valuenow', String(SIZES_PX.sidebarW))
    await expect(handle).toHaveAttribute('aria-valuemin', String(SIZES_PX.sidebarW))
    await expect(handle).toHaveAttribute('aria-valuemax', String(SIZES_PX.panelLg))

    handle.focus()
    await userEvent.keyboard('{ArrowRight}')
    const after = SIZES_PX.sidebarW + SPACING_PX.md
    await expect(handle).toHaveAttribute('aria-valuenow', String(after))
    await waitFor(() => expect(primary.getBoundingClientRect().width).toBeCloseTo(after, 0))

    await userEvent.keyboard('{End}')
    await expect(handle).toHaveAttribute('aria-valuenow', String(SIZES_PX.panelLg))
    // the bound holds
    await userEvent.keyboard('{ArrowRight}')
    await expect(handle).toHaveAttribute('aria-valuenow', String(SIZES_PX.panelLg))

    await userEvent.keyboard('{Home}')
    await expect(handle).toHaveAttribute('aria-valuenow', String(SIZES_PX.sidebarW))
  },
}

export const NarrowStacksInOneColumn: Story = {
  render: () => <Split />,
  beforeEach: async () => {
    await page.viewport(390, 844)
  },
  play: async ({canvas}) => {
    await waitFor(() => expect(separator()).toBeNull())
    const list = canvas.getByRole('list', {name: 'Sessions'})
    const heading = canvas.getByRole('heading', {name: 'Refactor auth'})
    // one column: the detail sits below the list
    await expect(heading.getBoundingClientRect().top).toBeGreaterThan(
      list.getBoundingClientRect().bottom - 1,
    )
  },
}
