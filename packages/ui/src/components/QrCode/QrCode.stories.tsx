import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {QrCode} from './QrCode'

const styles = css.create({
  column: {width: sizes.dialogSm},
})

const meta: Meta<typeof QrCode> = {
  title: 'Components/QrCode',
  component: QrCode,
  args: {
    value: 'https://example.com/pair?key=0123456789abcdef',
    label: 'Scan to sign in on this device',
  },
  decorators: [
    (Story) => (
      <html.div style={styles.column}>
        <Story />
      </html.div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof QrCode>

export const Default: Story = {
  play: async ({canvas}) => {
    const code = canvas.getByRole('img', {name: 'Scan to sign in on this device'})
    await expect(code).toBeInTheDocument()
    const box = code.getBoundingClientRect()
    await expect(Math.round(box.width)).toBe(Math.round(box.height))
  },
}

export const LongValue: Story = {
  args: {
    value: 'happier://account?key=AbCdEfGhIjKlMnOpQrStUvWxYz0123456789-_AbCdEfGhIjKlMnOpQrStUvWxYz',
    label: 'Scan to connect',
  },
}
