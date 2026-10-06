import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {ScrollArea} from './ScrollArea'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

const meta: Meta = {
  title: 'Components/ScrollArea',
}

export default meta
type Story = StoryObj

const demoStyles = css.create({
  container: {
    width: sizes.gridColMd,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
  },
  item: {
    paddingTop: spacing.ms,
    paddingBottom: spacing.ms,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    borderBottomWidth: borders.hairline,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.bgCard,
    fontSize: typography.fontSizeSm,
    color: colors.text,
  },
})

const items = Array.from({length: 30}, (_, i) => `Item ${i + 1}`)

export const Default: Story = {
  render: () => (
    <html.div style={demoStyles.container}>
      <ScrollArea.Root>
        <ScrollArea.Viewport maxHeight="listMaxH">
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
        <ScrollArea.Viewport maxHeight="listMaxH">
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
