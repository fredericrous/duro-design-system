import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor} from 'storybook/test'
import {VirtualList} from './VirtualList'
import {Text} from '../Text/Text'

const meta: Meta = {
  title: 'Components/VirtualList',
}

export default meta
type Story = StoryObj

const ITEMS = Array.from({length: 10_000}, (_, i) => ({id: i, text: `Message ${i + 1}`}))

function Rows({anchor}: {anchor?: 'start' | 'end'}) {
  return (
    <VirtualList
      aria-label="Transcript"
      items={ITEMS}
      getKey={(m) => m.id}
      estimateSize="controlLg"
      anchor={anchor}
      maxHeight="previewMaxH"
      renderItem={(m) => <Text>{m.text}</Text>}
    />
  )
}

export const TenThousand: Story = {
  render: () => <Rows />,
  play: async ({canvas}) => {
    const list = canvas.getByRole('list', {name: 'Transcript'})
    await waitFor(() => expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(0))
    const rows = canvas.getAllByRole('listitem')
    await expect(rows.length).toBeLessThan(50)
    await expect(rows[0]).toHaveAttribute('aria-setsize', '10000')
    await expect(rows[0]).toHaveAttribute('aria-posinset', '1')
    await expect(list.scrollHeight).toBeGreaterThan(list.clientHeight * 100)
  },
}

export const AnchoredToTheEnd: Story = {
  render: () => <Rows anchor="end" />,
  play: async ({canvas}) => {
    await waitFor(() => expect(canvas.getByText('Message 10000')).toBeInTheDocument())
    const rows = canvas.getAllByRole('listitem')
    await expect(rows.length).toBeLessThan(50)
    const last = rows.find((r) => r.getAttribute('aria-posinset') === '10000')
    await expect(last).toBeDefined()
  },
}
