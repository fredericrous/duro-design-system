import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor, within} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {renderToString} from 'react-dom/server'
import {hydrateRoot} from 'react-dom/client'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {AppShell} from './AppShell'
import {SideNav} from '../SideNav/SideNav'
import {Heading} from '../Heading/Heading'
import {Text} from '../Text/Text'
import {Input} from '../Input/Input'

const meta: Meta = {
  title: 'Layout/AppShell',
  parameters: {
    a11y: {
      test: 'error',
      // holds-until: https://github.com/fredericrous/duro-design-system/issues/79
      // — the selected item's accent on bgCardHover is 6.76:1, under AAA's
      // 7:1 (AA passes). Re-enable this rule when that pair reaches 7:1.
      options: {rules: {'color-contrast-enhanced': {enabled: false}}},
    },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

const styles = css.create({
  // The shell measures its own width: these frames stand for a desktop
  // window and a phone, whatever the test browser's size.
  desktop: {width: sizes.pageLg},
  phone: {width: sizes.panelSm},
})

const page = () => within(document.body)

function Shell() {
  const [path, setPath] = useState('/docs')
  return (
    <AppShell.Root menuLabel="Menu" closeLabel="Close navigation">
      <AppShell.Rail aria-label="Navigation">
        {({close}) => (
          <SideNav.Root
            aria-label="Sections"
            value={path}
            onValueChange={(value) => {
              close()
              setPath(value)
            }}
          >
            <SideNav.Section label="Content">
              <SideNav.Item value="/">Dashboard</SideNav.Item>
              <SideNav.Item value="/docs">Docs</SideNav.Item>
              <SideNav.Item value="/articles">Articles</SideNav.Item>
            </SideNav.Section>
          </SideNav.Root>
        )}
      </AppShell.Rail>
      <AppShell.Header>
        <Input type="search" aria-label="Search the docs" placeholder="Search the docs" />
      </AppShell.Header>
      <AppShell.Main id="main">
        <Heading level={1}>Docs</Heading>
        <Text>Current page: {path}</Text>
      </AppShell.Main>
    </AppShell.Root>
  )
}

/** Desktop: the rail beside the header and the page; no Menu button. */
export const Desktop: Story = {
  render: () => (
    <html.div style={styles.desktop}>
      <Shell />
    </html.div>
  ),
  play: async ({canvas}) => {
    const rail = canvas.getByRole('navigation', {name: 'Navigation'})
    const banner = canvas.getByRole('banner')
    const main = canvas.getByRole('main')
    await expect(rail).toBeVisible()
    await expect(rail.getBoundingClientRect().width).toBe(SIZES_PX.sidebarW)
    await expect(main.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      rail.getBoundingClientRect().right,
    )
    await expect(banner.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      rail.getBoundingClientRect().right,
    )
    // landmarks are named and distinct: one main, one banner, each nav its own name
    await expect(canvas.getAllByRole('main')).toHaveLength(1)
    await expect(canvas.getAllByRole('banner')).toHaveLength(1)
    const names = canvas.getAllByRole('navigation').map((nav) => nav.getAttribute('aria-label'))
    await expect(new Set(names).size).toBe(names.length)
    await expect(canvas.queryByRole('button', {name: 'Menu'})).toBeNull()
  },
}

/**
 * Phone: the rail is hidden and the Menu button opens it in a Drawer. Focus
 * moves into the drawer, and back to the Menu button when it closes —
 * by Escape, and after a pick.
 */
export const Phone: Story = {
  render: () => (
    <html.div style={styles.phone}>
      <Shell />
    </html.div>
  ),
  play: async ({canvas, userEvent}) => {
    await expect(canvas.queryByRole('navigation', {name: 'Navigation'})).toBeNull()
    const menu = canvas.getByRole('button', {name: 'Menu'})
    await expect(menu).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(menu)
    const dialog = await page().findByRole('dialog', {name: 'Navigation'})
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    const drawerNav = within(dialog).getByRole('navigation', {name: 'Navigation'})
    await waitFor(() => expect(drawerNav.contains(document.activeElement)).toBe(true))

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(page().queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(menu).toHaveFocus())

    // a pick closes the drawer through close(), and focus comes back too
    await userEvent.click(menu)
    const again = await page().findByRole('dialog', {name: 'Navigation'})
    await userEvent.click(within(again).getByRole('button', {name: 'Articles'}))
    await waitFor(() => expect(page().queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(menu).toHaveFocus())
    await expect(canvas.getByText('Current page: /articles')).toBeInTheDocument()
  },
}

/**
 * The server renders the shell once, for every width: CSS picks the rail or
 * the Menu button before any script runs, and hydration reports nothing.
 */
export const ServerRender: Story = {
  render: () => <html.div style={styles.desktop} data-ssr-host="" />,
  play: async ({canvasElement}) => {
    const host = canvasElement.querySelector('[data-ssr-host]') as HTMLElement
    host.innerHTML = renderToString(<Shell />)
    const shell = within(host)
    // before hydration: the desktop shell, from CSS alone
    await expect(shell.getByRole('navigation', {name: 'Navigation'})).toBeVisible()
    await expect(shell.getByRole('button', {name: 'Menu', hidden: true})).not.toBeVisible()

    const errors: unknown[] = []
    const consoleError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args)
      consoleError(...args)
    }
    const root = hydrateRoot(host, <Shell />, {
      onRecoverableError: (error) => errors.push(error),
    })
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))
      await expect(shell.getByRole('navigation', {name: 'Navigation'})).toBeVisible()
      await expect(errors).toEqual([])
    } finally {
      console.error = consoleError
      root.unmount()
    }
  },
}
