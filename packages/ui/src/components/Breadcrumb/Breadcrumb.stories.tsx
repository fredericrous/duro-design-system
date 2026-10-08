import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, waitFor} from 'storybook/test'
import {Breadcrumb} from './Breadcrumb'
import {clickLink} from '../../docs/clickLink'
import {onThemeSurface} from '../../docs/themedSurface'
import {withCoarsePointer, withFinePointer} from '../../docs/coarsePointer'
import {SIZES_PX} from '@duro-app/tokens/keys'
import type {OnNavigate} from '../../shared/navigate'

const meta: Meta = {
  title: 'Components/Breadcrumb',
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
}

export default meta
type Story = StoryObj

function Trail({onNavigate}: {onNavigate?: OnNavigate}) {
  return (
    <Breadcrumb.Root aria-label="Breadcrumb">
      <Breadcrumb.Item href="#docs" onNavigate={onNavigate}>
        Docs
      </Breadcrumb.Item>
      <Breadcrumb.Item href="#architecture" onNavigate={onNavigate}>
        Architecture
      </Breadcrumb.Item>
      <Breadcrumb.Item current>AI-ops platform</Breadcrumb.Item>
    </Breadcrumb.Root>
  )
}

export const Default: Story = {
  render: () => <Trail />,
  play: async ({canvas}) => {
    const nav = canvas.getByRole('navigation', {name: 'Breadcrumb'})
    await expect(nav).toBeInTheDocument()
    // the list holds the three items only: the separators are aria-hidden
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
    await expect(canvas.getAllByRole('link').map((a) => a.textContent)).toEqual([
      'Docs',
      'Architecture',
    ])
    // the current page is text, not a link, and says so
    const current = canvas.getByText('AI-ops platform')
    await expect(current).toHaveAttribute('aria-current', 'page')
    await expect(current.closest('a')).toBeNull()
  },
}

export const KeyboardOrder: Story = {
  render: () => <Trail />,
  play: async ({canvas, userEvent}) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', {name: 'Docs'})).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', {name: 'Architecture'})).toHaveFocus()
    // the current page is not a tab stop
    await userEvent.tab()
    await expect(canvas.getByRole('link', {name: 'Architecture'})).not.toHaveFocus()
  },
}

export const ClientNavigation: StoryObj<{onNavigate: OnNavigate}> = {
  args: {onNavigate: fn()},
  render: (args) => <Trail onNavigate={args.onNavigate} />,
  play: async ({args, canvas}) => {
    const onNavigate = args.onNavigate as unknown as ReturnType<typeof fn>
    onNavigate.mockImplementation((_href: string, event: {preventDefault(): void}) =>
      event.preventDefault(),
    )
    const link = canvas.getByRole('link', {name: 'Architecture'})

    // a plain click goes to the router, which prevents the default
    await expect(clickLink(link).defaultPrevented).toBe(true)
    await expect(onNavigate).toHaveBeenCalledTimes(1)
    await expect(onNavigate.mock.calls[0][0]).toBe('#architecture')

    // a modified or non-primary click keeps the browser default
    for (const init of [{metaKey: true}, {ctrlKey: true}, {shiftKey: true}, {button: 1}]) {
      await expect(clickLink(link, init).defaultPrevented).toBe(false)
    }
    await expect(onNavigate).toHaveBeenCalledTimes(1)
  },
}

/**
 * A touch screen gets 44px links (coarse pointer); a mouse keeps the
 * artboard's text-height row.
 * It drives Chrome's touch emulation through Vitest's CDP session, so it runs
 * as a test and stays out of the dev sidebar (there is no Vitest there).
 */
export const TouchTargets: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <Trail />,
  play: async ({canvas}) => {
    await withFinePointer()
    const links = () => canvas.getAllByRole('link')
    for (const link of links()) {
      await expect(link.getBoundingClientRect().height).toBeLessThan(SIZES_PX.touchTarget)
    }
    await withCoarsePointer(async () => {
      for (const link of links()) {
        await waitFor(() =>
          expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(SIZES_PX.touchTarget),
        )
      }
    })
  },
}
