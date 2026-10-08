import {useState} from 'react'
import {css, html} from 'react-strict-dom'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, waitFor} from 'storybook/test'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {TableOfContents} from './TableOfContents'
import type {TableOfContentsVariant} from './TableOfContentsContext'
import {clickLink} from '../../docs/clickLink'
import {onThemeSurface} from '../../docs/themedSurface'
import type {OnNavigate} from '../../shared/navigate'

const meta: Meta = {
  title: 'Components/TableOfContents',
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
}

export default meta
type Story = StoryObj

const styles = css.create({
  aside: {width: sizes.gridColXs},
  phone: {width: sizes.pageXs},
})

function Sections(props: {
  value?: string | null
  variant?: TableOfContentsVariant
  onNavigate?: OnNavigate
}) {
  return (
    <TableOfContents.Root
      aria-label="On this page"
      label="On this page"
      value={props.value}
      variant={props.variant}
    >
      <TableOfContents.Item href="#components" onNavigate={props.onNavigate}>
        The components
      </TableOfContents.Item>
      <TableOfContents.Item href="#wiring" onNavigate={props.onNavigate}>
        Wiring
      </TableOfContents.Item>
      <TableOfContents.Item href="#webhooks" level={3} onNavigate={props.onNavigate}>
        Webhooks
      </TableOfContents.Item>
      <TableOfContents.Item href="#lifecycle" onNavigate={props.onNavigate}>
        Alert lifecycle
      </TableOfContents.Item>
      <TableOfContents.Item href="#next" onNavigate={props.onNavigate}>
        Where to read next
      </TableOfContents.Item>
    </TableOfContents.Root>
  )
}

export const List: Story = {
  render: () => (
    <html.div style={styles.aside}>
      <Sections value="wiring" />
    </html.div>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('navigation', {name: 'On this page'})).toBeInTheDocument()
    const active = canvas.getByRole('link', {name: 'Wiring'})
    await expect(active).toHaveAttribute('aria-current', 'location')
    await expect(canvas.getByRole('link', {name: 'The components'})).not.toHaveAttribute(
      'aria-current',
    )
    // not colour alone: the marker bar and a heavier weight
    await expect(getComputedStyle(active).boxShadow).toContain('inset')
    const other = canvas.getByRole('link', {name: 'The components'})
    await expect(Number(getComputedStyle(active).fontWeight)).toBeGreaterThan(
      Number(getComputedStyle(other).fontWeight),
    )
    // a level-3 item is indented under its H2
    const h3 = canvas.getByRole('link', {name: 'Webhooks'})
    await expect(parseFloat(getComputedStyle(h3).paddingLeft)).toBeGreaterThan(
      parseFloat(getComputedStyle(other).paddingLeft),
    )
  },
}

export const KeyboardOrder: Story = {
  render: () => (
    <html.div style={styles.aside}>
      <Sections value="components" />
    </html.div>
  ),
  play: async ({canvas, userEvent}) => {
    for (const name of [
      'The components',
      'Wiring',
      'Webhooks',
      'Alert lifecycle',
      'Where to read next',
    ]) {
      await userEvent.tab()
      await expect(canvas.getByRole('link', {name})).toHaveFocus()
    }
  },
}

/** The app owns the scroll-spy and passes the section being read as `value`. */
export const ControlledValue: Story = {
  render: function Render() {
    const [value, setValue] = useState('components')
    return (
      <html.div style={styles.aside}>
        <Sections
          value={value}
          onNavigate={(href, event) => {
            event.preventDefault()
            setValue(href.slice(1))
          }}
        />
      </html.div>
    )
  },
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('link', {name: 'Alert lifecycle'}))
    await expect(canvas.getByRole('link', {name: 'Alert lifecycle'})).toHaveAttribute(
      'aria-current',
      'location',
    )
    await expect(canvas.getByRole('link', {name: 'The components'})).not.toHaveAttribute(
      'aria-current',
    )
  },
}

export const Menu: Story = {
  render: () => (
    <html.div style={styles.phone}>
      <Sections value="wiring" variant="menu" />
    </html.div>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('button', {name: 'On this page'})
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.queryByRole('link')).toBeNull()

    // opens from the keyboard; the list follows the button in the tab order
    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(trigger).toHaveAttribute('aria-controls', canvas.getByRole('list').id)
    await expect(canvas.getByRole('link', {name: 'Wiring'})).toHaveAttribute(
      'aria-current',
      'location',
    )
    await userEvent.tab()
    await expect(canvas.getByRole('link', {name: 'The components'})).toHaveFocus()

    // Escape closes it and gives focus back to the button
    await userEvent.keyboard('{Escape}')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toHaveFocus()
    await expect(canvas.queryByRole('link')).toBeNull()

    // following an item closes it too
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    clickLink(canvas.getByRole('link', {name: 'Webhooks'}))
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))

    // a touch target: the button is at least 44px tall
    await expect(trigger.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
  },
}

export const ClientNavigation: StoryObj<{onNavigate: OnNavigate}> = {
  args: {onNavigate: fn()},
  render: (args) => (
    <html.div style={styles.aside}>
      <Sections value="components" onNavigate={args.onNavigate} />
    </html.div>
  ),
  play: async ({args, canvas}) => {
    const onNavigate = args.onNavigate as unknown as ReturnType<typeof fn>
    const link = canvas.getByRole('link', {name: 'Wiring'})
    // the part never prevents the default itself: with a handler that leaves
    // the event alone, the browser still follows the anchor
    await expect(clickLink(link).defaultPrevented).toBe(false)
    await expect(onNavigate).toHaveBeenCalledTimes(1)
    await expect(onNavigate.mock.calls[0][0]).toBe('#wiring')
    await expect(clickLink(link, {metaKey: true}).defaultPrevented).toBe(false)
    await expect(onNavigate).toHaveBeenCalledTimes(1)
  },
}
