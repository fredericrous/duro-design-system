import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {ToastProvider, useToast} from './ToastProvider'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

const s = css.create({
  row: {display: 'flex', flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap'},
  btn: {
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    cursor: 'pointer',
  },
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
      <html.button
        style={s.btn}
        onClick={() =>
          toast({
            variant: 'warning',
            message: 'In progress is over its WIP limit (4/3)',
            duration: 0,
          })
        }
      >
        Show warning
      </html.button>
      <html.button
        style={s.btn}
        onClick={() =>
          toast({
            variant: 'success',
            message: 'Moved to Done',
            duration: 600,
            action: {label: 'Undo', onClick: () => {}},
          })
        }
      >
        Show short
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

/** The WIP-limit shape: a warning, announced politely, with its own tone. */
export const Warning: Story = {
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByText('Show warning'))
    const toast = await waitFor(() => canvas.getByRole('status'))
    await expect(toast).toHaveTextContent('In progress is over its WIP limit (4/3)')
  },
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** The countdown stops while the pointer is on the toast and resumes with
 *  what was left when it leaves. */
export const PausesOnHover: Story = {
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByText('Show short'))
    const toast = await waitFor(() => canvas.getByRole('status'))
    await userEvent.hover(toast)
    await wait(1000)
    await expect(canvas.getByRole('status')).toHaveTextContent('Moved to Done')
    await userEvent.unhover(toast)
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument(), {
      timeout: 2000,
    })
  },
}

/** Focus inside the toast (its Undo, its close button) holds it too. */
export const PausesOnFocus: Story = {
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByText('Show short'))
    await waitFor(() => canvas.getByRole('status'))
    canvas.getByRole('button', {name: 'Undo'}).focus()
    await wait(1000)
    // Moving between the toast's own buttons keeps it paused.
    canvas.getByRole('button', {name: 'Dismiss'}).focus()
    await wait(300)
    await expect(canvas.getByRole('status')).toHaveTextContent('Moved to Done')
    canvas.getByText('Show short').focus()
    await waitFor(() => expect(canvas.queryByText('Moved to Done')).not.toBeInTheDocument(), {
      timeout: 2000,
    })
  },
}

/** The close button's name comes from the app (dismissLabel). */
export const LocalisedClose: Story = {
  render: () => (
    <ToastProvider dismissLabel="Fermer">
      <Triggers />
    </ToastProvider>
  ),
  play: async ({canvas}) => {
    await userEvent.click(canvas.getByText('Show warning'))
    await userEvent.click(await canvas.findByRole('button', {name: 'Fermer'}))
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument())
  },
}
