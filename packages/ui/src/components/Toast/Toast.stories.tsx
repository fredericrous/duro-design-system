import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {ToastProvider, useToast} from './ToastProvider'

const s = css.create({
  row: {display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
  btn: {padding: 8, borderRadius: 6, borderWidth: 1, borderStyle: 'solid', cursor: 'pointer'},
})

function Triggers() {
  const {toast} = useToast()
  return (
    <html.div style={s.row}>
      <html.button
        style={s.btn}
        onClick={() => toast({variant: 'success', message: 'Grant revoked', duration: 0})}
      >
        Show success
      </html.button>
      <html.button
        style={s.btn}
        onClick={() =>
          toast({variant: 'error', message: 'Couldn’t revoke: SMTP down', duration: 0})
        }
      >
        Show error
      </html.button>
      <html.button
        style={s.btn}
        onClick={() =>
          toast({
            variant: 'success',
            message: 'Mapping deleted',
            duration: 0,
            action: {label: 'Undo', onClick: () => {}},
          })
        }
      >
        Show with undo
      </html.button>
    </html.div>
  )
}

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Toast',
  component: ToastProvider,
  render: () => (
    <ToastProvider>
      <Triggers />
    </ToastProvider>
  ),
}
export default meta
type Story = StoryObj<typeof ToastProvider>

export const Success: Story = {
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByText('Show success'))
    const toast = await waitFor(() => canvas.getByRole('status'))
    await expect(toast).toHaveTextContent('Grant revoked')
  },
}

export const Error: Story = {
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByText('Show error'))
    const toast = await waitFor(() => canvas.getByRole('alert'))
    await expect(toast).toHaveTextContent('Couldn’t revoke: SMTP down')
  },
}

export const Dismiss: Story = {
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByText('Show success'))
    await waitFor(() => canvas.getByRole('status'))
    await userEvent.click(canvas.getByRole('button', {name: 'Dismiss'}))
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument())
  },
}
