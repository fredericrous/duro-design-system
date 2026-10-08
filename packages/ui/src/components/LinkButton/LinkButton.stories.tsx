import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {LinkButton} from './LinkButton'
import {clickLink} from '../../docs/clickLink'
import {onThemeSurface} from '../../docs/themedSurface'
import type {OnNavigate} from '../../shared/navigate'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {withCoarsePointer, withFinePointer} from '../../docs/coarsePointer'

const meta: Meta<typeof LinkButton> = {
  title: 'Components/LinkButton',
  component: LinkButton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
    },
    fullWidth: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj<typeof LinkButton>

export const Primary: Story = {
  args: {href: '#', variant: 'primary', children: 'Get started'},
  play: async ({canvas}) => {
    const link = canvas.getByRole('link', {name: 'Get started'})
    await expect(link).toBeInTheDocument()
    await expect(link).toHaveAttribute('href', '#')
  },
}

export const Secondary: Story = {
  args: {href: '#', variant: 'secondary', children: 'Learn more'},
  play: async ({canvas}) => {
    await expect(canvas.getByRole('link', {name: 'Learn more'})).toBeInTheDocument()
  },
}

export const Small: Story = {
  args: {href: '#', size: 'small', children: 'Small link'},
}

export const FullWidth: Story = {
  args: {href: '#', fullWidth: true, children: 'Full width link'},
}

export const ExternalLink: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    children: 'External',
  },
  play: async ({canvas}) => {
    const link = canvas.getByRole('link', {name: 'External'})
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

const rowStyles = css.create({
  row: {display: 'flex', gap: spacing.ms, alignItems: 'center', flexWrap: 'wrap'},
  stack: {display: 'flex', flexDirection: 'column', gap: spacing.md},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={rowStyles.stack}>
      <html.div style={rowStyles.row}>
        <LinkButton href="#">Primary</LinkButton>
        <LinkButton href="#" variant="secondary">
          Secondary
        </LinkButton>
      </html.div>
      <html.div style={rowStyles.row}>
        <LinkButton href="#" size="small">
          Small Primary
        </LinkButton>
        <LinkButton href="#" variant="secondary" size="small">
          Small Secondary
        </LinkButton>
      </html.div>
    </html.div>
  ),
  play: async ({canvas}) => {
    const links = canvas.getAllByRole('link')
    await expect(links.length).toBe(4)
  },
}

/**
 * Client-side navigation: `onNavigate` gets a plain primary click (the app
 * calls `event.preventDefault()`, then its router's navigate); a modified
 * click, or a link with `target`, keeps the browser default.
 */
export const ClientNavigation: StoryObj<{onNavigate: OnNavigate}> = {
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
  args: {onNavigate: fn()},
  render: (args) => (
    <>
      <LinkButton href="#billing" onNavigate={args.onNavigate}>
        Get started
      </LinkButton>{' '}
      <LinkButton href="#help" target="_blank" onNavigate={args.onNavigate}>
        Help
      </LinkButton>
    </>
  ),
  play: async ({args, canvas}) => {
    const onNavigate = args.onNavigate as unknown as ReturnType<typeof fn>
    onNavigate.mockImplementation((_href: string, event: {preventDefault(): void}) =>
      event.preventDefault(),
    )
    const link = canvas.getByRole('link', {name: 'Get started'})
    await expect(clickLink(link).defaultPrevented).toBe(true)
    await expect(onNavigate).toHaveBeenCalledTimes(1)
    await expect(onNavigate.mock.calls[0][0]).toBe('#billing')
    for (const init of [{metaKey: true}, {ctrlKey: true}, {shiftKey: true}, {altKey: true}]) {
      await expect(clickLink(link, init).defaultPrevented).toBe(false)
    }
    // a target opens where it says, not through the router
    const help = canvas.getByRole('link', {name: 'Help'})
    await expect(clickLink(help).defaultPrevented).toBe(false)
    await expect(onNavigate).toHaveBeenCalledTimes(1)
  },
}

/**
 * A touch screen gets 44px links, default and small alike (5.6, as Button);
 * a mouse keeps the compact control.
 * It drives Chrome's touch emulation through Vitest's CDP session, so it runs
 * as a test and stays out of the dev sidebar (there is no Vitest there).
 */
export const TouchTargets: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <html.div>
      <LinkButton href="#a">Open runbook</LinkButton>
      <LinkButton href="#b" size="small">
        Edit
      </LinkButton>
    </html.div>
  ),
  play: async ({canvas}) => {
    const links = () => [
      canvas.getByRole('link', {name: 'Open runbook'}),
      canvas.getByRole('link', {name: 'Edit'}),
    ]
    await withFinePointer()
    for (const link of links()) {
      await expect(link.getBoundingClientRect().height).toBeLessThan(SIZES_PX.touchTarget)
    }
    await withCoarsePointer(async () => {
      for (const link of links()) {
        await waitFor(() =>
          expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(SIZES_PX.touchTarget),
        )
        await expect(link.getBoundingClientRect().width).toBeGreaterThanOrEqual(
          SIZES_PX.touchTarget,
        )
      }
    })
  },
}
