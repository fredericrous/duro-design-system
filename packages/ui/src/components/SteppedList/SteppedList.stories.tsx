import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor, within} from 'storybook/test'
import {Popover} from '../Popover/Popover'
import {List} from '../List/List'
import {Input} from '../Input/Input'
import {SteppedList} from './SteppedList'

const meta: Meta = {
  title: 'Components/SteppedList',
}

export default meta
type Story = StoryObj

// The popup is portalled out of the story's canvas, so query the document.
const page = () => within(document.body)

const branches = Array.from({length: 30}, (_, index) => `branch-${index + 1}`)

function BranchPicker() {
  return (
    <Popover.Root>
      <Popover.Trigger>Pick a branch</Popover.Trigger>
      <Popover.Popup label="Branch picker">
        <SteppedList.Root defaultStep="repos" backLabel="Back" maxHeight="listMaxHSm">
          <SteppedList.Step id="repos" title="Repositories">
            <List.Root aria-label="Repositories">
              <SteppedList.Item to="branches">
                <List.Content>
                  <List.Text>duro</List.Text>
                </List.Content>
              </SteppedList.Item>
              <SteppedList.Item to="branches">
                <List.Content>
                  <List.Text>happier</List.Text>
                </List.Content>
              </SteppedList.Item>
            </List.Root>
          </SteppedList.Step>
          <SteppedList.Step
            id="branches"
            title="Branches"
            input={<Input aria-label="Filter branches" placeholder="Filter" />}
          >
            <List.Root aria-label="Branches">
              <List.Section title="All branches" accessory={String(branches.length)}>
                {branches.map((name) => (
                  <List.Item key={name} onClick={() => undefined}>
                    <List.Content>
                      <List.Text>{name}</List.Text>
                    </List.Content>
                  </List.Item>
                ))}
              </List.Section>
            </List.Root>
          </SteppedList.Step>
        </SteppedList.Root>
      </Popover.Popup>
    </Popover.Root>
  )
}

/** A row pushes a step, Back pops it, and focus follows both. */
export const PushAndPop: Story = {
  render: () => <BranchPicker />,
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Pick a branch'}))
    const popup = await page().findByRole('dialog', {name: 'Branch picker'})
    const inPopup = within(popup)
    await expect(inPopup.getByRole('group', {name: 'Repositories'})).toBeVisible()
    await expect(inPopup.queryByRole('button', {name: 'Back'})).toBeNull()

    await userEvent.click(inPopup.getByRole('button', {name: 'happier'}))
    const branchStep = await inPopup.findByRole('group', {name: 'Branches'})
    await expect(branchStep).toBeVisible()
    await expect(inPopup.queryByRole('group', {name: 'Repositories'})).toBeNull()
    // Focus lands on the new step's first row.
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(branchStep).getByRole('button', {name: 'branch-1'}),
      ),
    )

    await userEvent.click(inPopup.getByRole('button', {name: 'Back'}))
    await expect(await inPopup.findByRole('group', {name: 'Repositories'})).toBeVisible()
    await expect(inPopup.queryByRole('group', {name: 'Branches'})).toBeNull()
    // Focus returns to the row that opened the step.
    await waitFor(() =>
      expect(document.activeElement).toBe(inPopup.getByRole('button', {name: 'happier'})),
    )
  },
}

/** The rows grow with their content up to the cap, then scroll. */
export const CapsItsHeight: Story = {
  render: () => <BranchPicker />,
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Pick a branch'}))
    const popup = await page().findByRole('dialog', {name: 'Branch picker'})
    const inPopup = within(popup)
    const shortRows = inPopup
      .getByRole('group', {name: 'Repositories'})
      .querySelector<HTMLElement>('[data-duro-stepped-rows]')!
    const cap = parseFloat(getComputedStyle(shortRows).maxHeight)
    await expect(cap).toBeGreaterThan(0)
    // Two rows fit under the cap: the step is as tall as they are.
    await expect(shortRows.scrollHeight).toBeLessThan(cap)
    await expect(shortRows.clientHeight).toBe(shortRows.scrollHeight)

    await userEvent.click(inPopup.getByRole('button', {name: 'duro'}))
    const longRows = (
      await inPopup.findByRole('group', {name: 'Branches'})
    ).querySelector<HTMLElement>('[data-duro-stepped-rows]')!
    await expect(longRows.clientHeight).toBeLessThanOrEqual(cap)
    await expect(longRows.scrollHeight).toBeGreaterThan(longRows.clientHeight)
  },
}
