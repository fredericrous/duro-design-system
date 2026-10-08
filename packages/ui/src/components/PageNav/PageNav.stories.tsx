import {css, html} from 'react-strict-dom'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {PageNav} from './PageNav'
import {clickLink} from '../../docs/clickLink'
import {onThemeSurface} from '../../docs/themedSurface'
import type {OnNavigate} from '../../shared/navigate'

const meta: Meta = {
  title: 'Components/PageNav',
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
}

export default meta
type Story = StoryObj

const styles = css.create({
  column: {width: sizes.panelLg},
  narrow: {width: sizes.panelSm},
})

function Pages(props: {prev?: boolean; next?: boolean; onNavigate?: OnNavigate}) {
  const {prev = true, next = true, onNavigate} = props
  return (
    <PageNav.Root aria-label="Pages">
      {prev ? (
        <PageNav.Prev
          href="#clusters"
          label="Previous"
          title="Clusters and bootstrap"
          onNavigate={onNavigate}
        />
      ) : null}
      {next ? (
        <PageNav.Next
          href="#secrets"
          label="Next"
          title="Secrets and Vault"
          onNavigate={onNavigate}
        />
      ) : null}
    </PageNav.Root>
  )
}

export const Default: Story = {
  render: () => (
    <html.div style={styles.column}>
      <Pages />
    </html.div>
  ),
  play: async ({canvas, userEvent}) => {
    await expect(canvas.getByRole('navigation', {name: 'Pages'})).toBeInTheDocument()
    // the arrows are decorative: the name is the label and the title
    const prev = canvas.getByRole('link', {name: 'Previous Clusters and bootstrap'})
    const next = canvas.getByRole('link', {name: 'Next Secrets and Vault'})
    // side by side, Next on the right
    await expect(next.getBoundingClientRect().left).toBeGreaterThan(
      prev.getBoundingClientRect().right,
    )
    await userEvent.tab()
    await expect(prev).toHaveFocus()
    await userEvent.tab()
    await expect(next).toHaveFocus()
  },
}

/** The first page of a section: no Prev, and Next keeps the right half. */
export const OnlyNext: Story = {
  render: () => (
    <html.div style={styles.column}>
      <Pages prev={false} />
    </html.div>
  ),
  play: async ({canvas}) => {
    const nav = canvas.getByRole('navigation', {name: 'Pages'})
    const next = canvas.getByRole('link', {name: 'Next Secrets and Vault'})
    const navBox = nav.getBoundingClientRect()
    const nextBox = next.getBoundingClientRect()
    await expect(nextBox.left).toBeGreaterThan(navBox.left + navBox.width / 3)
    await expect(Math.round(nextBox.right)).toBe(Math.round(navBox.right))
    await expect(getComputedStyle(next).textAlign).toBe('right')
  },
}

export const OnlyPrev: Story = {
  render: () => (
    <html.div style={styles.column}>
      <Pages next={false} />
    </html.div>
  ),
}

/** Below the xs container width the cards stack, Prev first. */
export const Stacked: Story = {
  render: () => (
    <html.div style={styles.narrow}>
      <Pages />
    </html.div>
  ),
  play: async ({canvas}) => {
    const prev = canvas.getByRole('link', {name: 'Previous Clusters and bootstrap'})
    const next = canvas.getByRole('link', {name: 'Next Secrets and Vault'})
    await expect(next.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      prev.getBoundingClientRect().bottom,
    )
    await expect(Math.round(next.getBoundingClientRect().left)).toBe(
      Math.round(prev.getBoundingClientRect().left),
    )
  },
}

export const ClientNavigation: StoryObj<{onNavigate: OnNavigate}> = {
  args: {onNavigate: fn()},
  render: (args) => (
    <html.div style={styles.column}>
      <Pages onNavigate={args.onNavigate} />
    </html.div>
  ),
  play: async ({args, canvas}) => {
    const onNavigate = args.onNavigate as unknown as ReturnType<typeof fn>
    onNavigate.mockImplementation((_href: string, event: {preventDefault(): void}) =>
      event.preventDefault(),
    )
    const next = canvas.getByRole('link', {name: 'Next Secrets and Vault'})
    await expect(clickLink(next).defaultPrevented).toBe(true)
    await expect(onNavigate).toHaveBeenCalledTimes(1)
    await expect(onNavigate.mock.calls[0][0]).toBe('#secrets')
    await expect(clickLink(next, {metaKey: true}).defaultPrevented).toBe(false)
    await expect(clickLink(next, {altKey: true}).defaultPrevented).toBe(false)
    await expect(onNavigate).toHaveBeenCalledTimes(1)
  },
}
