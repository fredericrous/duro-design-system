import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {ScrollArea} from './ScrollArea'

const meta: Meta = {
  title: 'Components/ScrollArea',
}

export default meta
type Story = StoryObj

const demoStyles = css.create({
  container: {
    width: 300,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#333333',
    borderRadius: 8,
  },
  item: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#1a1a1a',
    fontSize: 14,
    color: '#e5e5e5',
  },
})

const items = Array.from({length: 30}, (_, i) => `Item ${i + 1}`)

export const Default: Story = {
  render: () => (
    <html.div style={demoStyles.container}>
      <ScrollArea.Root>
        <ScrollArea.Viewport maxHeight={300}>
          <ScrollArea.Content>
            {items.map((item) => (
              <html.div key={item} style={demoStyles.item}>
                {item}
              </html.div>
            ))}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    // Content renders
    await expect(canvas.getByText('Item 1')).toBeInTheDocument()
    await expect(canvas.getByText('Item 10')).toBeInTheDocument()
  },
}

export const ShortContent: Story = {
  render: () => (
    <html.div style={demoStyles.container}>
      <ScrollArea.Root>
        <ScrollArea.Viewport maxHeight={300}>
          <ScrollArea.Content>
            <html.div style={demoStyles.item}>Only one item</html.div>
            <html.div style={demoStyles.item}>Two items</html.div>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByText('Only one item')).toBeInTheDocument()
    await expect(canvas.getByText('Two items')).toBeInTheDocument()
  },
}
