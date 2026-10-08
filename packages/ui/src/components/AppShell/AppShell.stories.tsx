import {Component, useState, type ReactNode} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, spyOn, waitFor, within} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {renderToString} from 'react-dom/server'
import {hydrateRoot} from 'react-dom/client'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {SIZES_PX, SPACING_PX} from '@duro-app/tokens/keys'
import {breakpointsPx} from '@duro-app/tokens/tokens/breakpoints.css'
import {AppShell, type AppShellCollapse} from './AppShell'
import {withCoarsePointer, withFinePointer} from '../../docs/coarsePointer'
import {SideNav} from '../SideNav/SideNav'
import {Heading} from '../Heading/Heading'
import {Text} from '../Text/Text'
import {Input} from '../Input/Input'
import {TextLink} from '../TextLink/TextLink'
import {Aside} from '../Aside/Aside'
import {Stack} from '../Stack/Stack'

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
  // Between sm and md: a rail at the default collapse point, a Menu at md.
  tablet: {width: sizes.dialogLg},
})

// The widths the plan's checks name: a phone and a desktop window. The test
// stories set them on the frame before measuring.
const PHONE_PX = 375
const DESKTOP_PX = breakpointsPx.xl

const page = () => within(document.body)
const setWidth = (element: HTMLElement, px: number) => {
  element.style.width = `${px}px`
}
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))

const BRAND = 'Duro docs'
const brandLink = <TextLink href="/">{BRAND}</TextLink>

interface ShellProps {
  header?: boolean
  brand?: ReactNode
  footer?: ReactNode
  collapseBelow?: AppShellCollapse
  children?: ReactNode
}

function Shell({header = true, brand, footer, collapseBelow, children}: ShellProps) {
  const [path, setPath] = useState('/docs')
  return (
    <AppShell.Root
      menuLabel="Menu"
      closeLabel="Close navigation"
      skipLabel="Skip to content"
      brand={brand}
      collapseBelow={collapseBelow}
    >
      <AppShell.Rail aria-label="Navigation" footer={footer}>
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
      {header && (
        <AppShell.Header>
          <Input type="search" aria-label="Search the docs" placeholder="Search the docs" />
        </AppShell.Header>
      )}
      <AppShell.Main id="main">
        {children ?? (
          <>
            <Heading level={1}>Docs</Heading>
            <Text>Current page: {path}</Text>
          </>
        )}
      </AppShell.Main>
    </AppShell.Root>
  )
}

/** Desktop: the brand and the rail beside the header and the page; no Menu button. */
export const Desktop: Story = {
  render: () => (
    <html.div style={styles.desktop}>
      <Shell brand={brandLink} />
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
    // the rail stays in view; the Header scrolls with the page
    await expect(getComputedStyle(rail).position).toBe('sticky')
    await expect(getComputedStyle(banner).position).toBe('static')
    // landmarks are named and distinct: one main, one banner, each nav its own name
    await expect(canvas.getAllByRole('main')).toHaveLength(1)
    await expect(canvas.getAllByRole('banner')).toHaveLength(1)
    const names = canvas.getAllByRole('navigation').map((nav) => nav.getAttribute('aria-label'))
    await expect(new Set(names).size).toBe(names.length)
    await expect(canvas.queryByRole('button', {name: 'Menu'})).toBeNull()
    // the brand is the rail's copy
    await expect(rail.contains(canvas.getByRole('link', {name: BRAND}))).toBe(true)
  },
}

/**
 * Phone: the rail is hidden; one sticky bar holds the Menu button, the brand
 * and the Header's content. Nothing is clicked here — the drawer is
 * exercised by the test-only PhoneDrawer story.
 */
export const Phone: Story = {
  render: () => (
    <html.div style={styles.phone}>
      <Shell brand={brandLink} />
    </html.div>
  ),
  play: async ({canvas}) => {
    await expect(canvas.queryByRole('navigation', {name: 'Navigation'})).toBeNull()
    const menu = canvas.getByRole('button', {name: 'Menu'})
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    const banner = canvas.getByRole('banner')
    await expect(banner.contains(menu)).toBe(true)
    await expect(banner.contains(canvas.getByRole('link', {name: BRAND}))).toBe(true)
    await expect(banner.contains(canvas.getByRole('searchbox'))).toBe(true)
    await expect(banner.getBoundingClientRect().height).toBe(SIZES_PX.appBarH)
    await expect(getComputedStyle(banner).position).toBe('sticky')
  },
}

/**
 * The Menu button opens the rail in a Drawer. Focus moves into the drawer,
 * and back to the Menu button when it closes — by Escape, and after a pick.
 * Test-only, so opening the Phone story never flashes the drawer.
 */
export const PhoneDrawer: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <html.div style={styles.phone}>
      <Shell />
    </html.div>
  ),
  play: async ({canvas, userEvent}) => {
    const menu = canvas.getByRole('button', {name: 'Menu'})
    await userEvent.click(menu)
    const dialog = await page().findByRole('dialog', {name: 'Navigation'})
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    const drawerNav = within(dialog).getByRole('navigation', {name: 'Navigation'})
    await waitFor(() => expect(drawerNav.contains(document.activeElement)).toBe(true))
    // the rail's content is rendered once, in the drawer while it is open:
    // counted in the DOM (a hidden copy would still duplicate a Tree's ids)
    await expect(page().getAllByText('Articles')).toHaveLength(1)
    await expect(document.querySelectorAll('[aria-label="Sections"]')).toHaveLength(1)

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

/** No Header: the desktop shell is the rail and the page, nothing above Main. */
export const NoHeaderDesktop: Story = {
  render: () => (
    <html.div style={styles.desktop}>
      <Shell header={false} brand={brandLink} />
    </html.div>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('navigation', {name: 'Navigation'})).toBeVisible()
    await expect(canvas.queryByRole('banner')).toBeNull()
    await expect(canvas.queryByRole('button', {name: 'Menu'})).toBeNull()
    await expect(canvas.getAllByRole('link', {name: BRAND})).toHaveLength(1)
  },
}

/** No Header on a phone still gives the bar: the Menu button and the brand. */
export const NoHeaderPhone: Story = {
  render: () => (
    <html.div style={styles.phone}>
      <Shell header={false} brand={brandLink} />
    </html.div>
  ),
  play: async ({canvas}) => {
    const banner = canvas.getByRole('banner')
    const menu = canvas.getByRole('button', {name: 'Menu'})
    await expect(menu).toBeVisible()
    await expect(banner.contains(menu)).toBe(true)
    await expect(banner.contains(canvas.getByRole('link', {name: BRAND}))).toBe(true)
    await expect(banner.getBoundingClientRect().height).toBe(SIZES_PX.appBarH)
  },
}

/**
 * The brand is in the server's HTML twice (the top of the rail, the bar) and
 * CSS shows one: the accessibility tree holds exactly one link at a phone's
 * width and at a desktop's, and only that one takes focus.
 */
export const Brand: Story = {
  render: () => (
    <html.div style={styles.desktop} data-frame="">
      <Shell brand={brandLink} />
    </html.div>
  ),
  play: async ({canvas, canvasElement}) => {
    const frame = canvasElement.querySelector('[data-frame]') as HTMLElement
    const focusable = () =>
      [...canvasElement.querySelectorAll<HTMLAnchorElement>('a[href="/"]')].filter((a) =>
        a.checkVisibility(),
      )
    await expect(canvasElement.querySelectorAll('a[href="/"]')).toHaveLength(2)
    for (const width of [PHONE_PX, DESKTOP_PX]) {
      setWidth(frame, width)
      await waitFor(() => expect(canvas.getAllByRole('link', {name: BRAND})).toHaveLength(1))
      await expect(focusable()).toHaveLength(1)
    }
    const link = canvas.getByRole('link', {name: BRAND})
    await expect(canvas.getByRole('navigation', {name: 'Navigation'}).contains(link)).toBe(true)
  },
}

/** `footer` sits at the rail's foot: the signed-in user, a licence line. */
export const RailFooter: Story = {
  render: () => (
    <html.div style={styles.desktop}>
      <Shell brand={brandLink} footer={<Text variant="bodySm">Signed in as Ada</Text>} />
    </html.div>
  ),
  play: async ({canvas}) => {
    const rail = canvas.getByRole('navigation', {name: 'Navigation'})
    const footer = canvas.getByText('Signed in as Ada')
    await expect(rail.contains(footer)).toBe(true)
    // at the foot: its box ends within the rail's last spacing.md
    const gap = rail.getBoundingClientRect().bottom - footer.getBoundingClientRect().bottom
    await expect(gap).toBeGreaterThanOrEqual(0)
    await expect(gap).toBeLessThanOrEqual(SPACING_PX.md)
  },
}

/** The footer comes along into the drawer, after the navigation. Test-only. */
export const RailFooterInDrawer: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <html.div style={styles.phone}>
      <Shell footer={<Text variant="bodySm">Signed in as Ada</Text>} />
    </html.div>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Menu'}))
    const dialog = await page().findByRole('dialog', {name: 'Navigation'})
    await expect(within(dialog).getByText('Signed in as Ada')).toBeVisible()
    // rendered once, in the drawer while it is open
    await expect(page().getAllByText('Signed in as Ada')).toHaveLength(1)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(page().queryByRole('dialog')).toBeNull())
  },
}

/**
 * `collapseBelow="md"`: at 680px (between sm and md) the shell already shows
 * the Menu button, on its own width — the window does not change.
 */
export const CollapseBelowMd: Story = {
  render: () => (
    <html.div style={styles.tablet} data-frame="">
      <Shell collapseBelow="md" />
    </html.div>
  ),
  play: async ({canvas, canvasElement}) => {
    const frame = canvasElement.querySelector('[data-frame]') as HTMLElement
    const viewport = window.innerWidth
    await expect(canvas.queryByRole('navigation', {name: 'Navigation'})).toBeNull()
    await expect(canvas.getByRole('button', {name: 'Menu'})).toBeVisible()
    try {
      setWidth(frame, breakpointsPx.md - 1)
      await nextFrame()
      await expect(canvas.queryByRole('navigation', {name: 'Navigation'})).toBeNull()
      setWidth(frame, breakpointsPx.md)
      await waitFor(() =>
        expect(canvas.getByRole('navigation', {name: 'Navigation'})).toBeVisible(),
      )
      await expect(canvas.queryByRole('button', {name: 'Menu'})).toBeNull()
      await expect(window.innerWidth).toBe(viewport)
    } finally {
      frame.style.width = ''
    }
  },
}

/** The skip link is the first tab stop and moves focus to Main. */
export const SkipLink: Story = {
  render: () => (
    <html.div style={styles.desktop}>
      <Shell brand={brandLink} />
    </html.div>
  ),
  play: async ({canvas, userEvent}) => {
    ;(document.activeElement as HTMLElement | null)?.blur()
    await userEvent.tab()
    const skip = canvas.getByRole('link', {name: 'Skip to content'})
    await expect(skip).toHaveFocus()
    await expect(skip).toBeVisible()
    await expect(skip).toHaveAttribute('href', '#main')
    await userEvent.keyboard('{Enter}')
    const main = canvas.getByRole('main')
    await waitFor(() => expect(main).toHaveFocus())
    await expect(main).toHaveAttribute('tabindex', '-1')
  },
}

/** Without an id on Main, the skip link targets the one Root generates. */
export const SkipLinkGeneratedId: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <html.div style={styles.desktop}>
      <AppShell.Root menuLabel="Menu" closeLabel="Close navigation" skipLabel="Skip to content">
        <AppShell.Rail aria-label="Navigation">
          <Text>Links</Text>
        </AppShell.Rail>
        <AppShell.Main>
          <Heading level={1}>Docs</Heading>
        </AppShell.Main>
      </AppShell.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    const main = canvas.getByRole('main')
    const id = main.getAttribute('id')
    await expect(id).toBeTruthy()
    await expect(canvas.getByRole('link', {name: 'Skip to content'})).toHaveAttribute(
      'href',
      `#${id}`,
    )
  },
}

class Caught extends Component<{children: ReactNode}, {error: string | null}> {
  state = {error: null as string | null}
  static getDerivedStateFromError(error: Error) {
    return {error: error.message}
  }
  render() {
    return this.state.error ? <Text>{this.state.error}</Text> : this.props.children
  }
}

/** A Header Root cannot see (inside a fragment) fails loudly, not silently. */
export const WrappedHeaderThrows: Story = {
  tags: ['!dev', '!autodocs'],
  // What renders is the test's error fallback, not AppShell: nothing for axe
  // to judge about the component (every other AppShell story keeps it).
  parameters: {a11y: {test: 'off'}},
  render: () => (
    <Caught>
      <AppShell.Root menuLabel="Menu" closeLabel="Close navigation" skipLabel="Skip to content">
        <AppShell.Rail aria-label="Navigation">
          <Text>Links</Text>
        </AppShell.Rail>
        <>
          <AppShell.Header>
            <Text>Search</Text>
          </AppShell.Header>
        </>
        <AppShell.Main>
          <Heading level={1}>Docs</Heading>
        </AppShell.Main>
      </AppShell.Root>
    </Caught>
  ),
  beforeEach: () => {
    const quiet = spyOn(console, 'error').mockImplementation(() => {})
    return () => quiet.mockRestore()
  },
  play: async ({canvas}) => {
    await expect(
      canvas.getByText(/AppShell\.Header must be a direct child of AppShell\.Root/),
    ).toBeInTheDocument()
  },
}

const PARAGRAPHS = Array.from({length: 80}, (_, i) => `Paragraph ${i + 1} of a long runbook.`)

/**
 * Below the collapse point an Aside inside Main sticks below the bar, not
 * under it; above, at its own offset: AppShell sets the bar's height on an element inside its query
 * container, and Aside's top adds it to its offset.
 */
export const AsideBelowBar: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <html.div style={styles.phone} data-frame="">
      <Shell>
        <Aside aria-label="Page outline">
          <Text>On this page</Text>
        </Aside>
        <Stack gap="md">
          {PARAGRAPHS.map((text) => (
            <Text key={text}>{text}</Text>
          ))}
        </Stack>
      </Shell>
    </html.div>
  ),
  play: async ({canvas, canvasElement}) => {
    const frame = canvasElement.querySelector('[data-frame]') as HTMLElement
    setWidth(frame, PHONE_PX)
    const aside = canvas.getByRole('complementary', {name: 'Page outline'})
    const banner = canvas.getByRole('banner')
    const main = canvas.getByRole('main')
    // set inside the query container, not on it
    const container = main.parentElement?.parentElement as HTMLElement
    await expect(getComputedStyle(main).getPropertyValue('--duro-app-shell-bar').trim()).toBe(
      `${SIZES_PX.appBarH}px`,
    )
    await expect(getComputedStyle(container).getPropertyValue('--duro-app-shell-bar')).toBe('')

    const scroller = document.scrollingElement as HTMLElement
    const start = scroller.scrollTop
    try {
      scroller.scrollTop = start + 1500
      await waitFor(() => expect(scroller.scrollTop).toBeGreaterThan(start))
      await waitFor(() => expect(Math.round(banner.getBoundingClientRect().top)).toBe(0))
      await expect(Math.round(banner.getBoundingClientRect().bottom)).toBe(SIZES_PX.appBarH)
      await waitFor(() =>
        expect(Math.round(aside.getBoundingClientRect().top)).toBe(
          SIZES_PX.appBarH + SPACING_PX.lg,
        ),
      )
      // above the collapse point the Header scrolls away: only the offset
      setWidth(frame, DESKTOP_PX)
      await waitFor(() => expect(getComputedStyle(aside).top).toBe(`${SPACING_PX.lg}px`))
      await waitFor(() => expect(Math.round(aside.getBoundingClientRect().top)).toBe(SPACING_PX.lg))
    } finally {
      scroller.scrollTop = start
      frame.style.width = ''
    }
  },
}

/**
 * The server renders the shell once, for every width: CSS picks the rail or
 * the Menu button before any script runs, and hydration reports nothing. The
 * brand is in that HTML twice (rail and bar), one of them in the
 * accessibility tree.
 */
export const ServerRender: Story = {
  render: () => <html.div style={styles.desktop} data-ssr-host="" />,
  play: async ({canvasElement}) => {
    const host = canvasElement.querySelector('[data-ssr-host]') as HTMLElement
    const markup = renderToString(<Shell brand={brandLink} />)
    await expect(markup.split(BRAND).length - 1).toBe(2)
    host.innerHTML = markup
    const shell = within(host)
    // before hydration: the desktop shell, from CSS alone
    await expect(shell.getByRole('navigation', {name: 'Navigation'})).toBeVisible()
    await expect(shell.getByRole('button', {name: 'Menu', hidden: true})).not.toBeVisible()
    await expect(shell.getAllByRole('link', {name: BRAND})).toHaveLength(1)

    const errors: unknown[] = []
    const consoleError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args)
      consoleError(...args)
    }
    const root = hydrateRoot(host, <Shell brand={brandLink} />, {
      onRecoverableError: (error) => errors.push(error),
    })
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))
      await expect(shell.getByRole('navigation', {name: 'Navigation'})).toBeVisible()
      await expect(shell.getAllByRole('link', {name: BRAND})).toHaveLength(1)
      await expect(errors).toEqual([])
    } finally {
      console.error = consoleError
      root.unmount()
    }
  },
}

type LayoutShiftEntry = PerformanceEntry & {value: number; hadRecentInput: boolean}

/**
 * Puts the server's HTML for `node` in `host` and hydrates it, summing the
 * layout-shift entries from the moment the HTML lands until 500ms after.
 */
async function layoutShift(host: HTMLElement, node: ReactNode): Promise<number> {
  const shifts: number[] = []
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LayoutShiftEntry[]) {
      if (!entry.hadRecentInput) shifts.push(entry.value)
    }
  })
  observer.observe({type: 'layout-shift'})
  host.innerHTML = renderToString(node)
  await nextFrame()
  const root = hydrateRoot(host, node)
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    await nextFrame()
    for (const entry of observer.takeRecords() as LayoutShiftEntry[]) {
      if (!entry.hadRecentInput) shifts.push(entry.value)
    }
  } finally {
    observer.disconnect()
    root.unmount()
    host.innerHTML = ''
  }
  return shifts.reduce((sum, value) => sum + value, 0)
}

/**
 * At a phone's width nothing moves after hydration (layout shift 0), with a
 * Header and without: the brand and the Menu button are in the server's HTML.
 */
export const NoLayoutShift: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <html.div style={styles.phone} data-ssr-host="" />,
  play: async ({canvasElement}) => {
    const host = canvasElement.querySelector('[data-ssr-host]') as HTMLElement
    setWidth(host, PHONE_PX)
    await expect(PerformanceObserver.supportedEntryTypes).toContain('layout-shift')
    await expect(await layoutShift(host, <Shell brand={brandLink} />)).toBe(0)
    await expect(await layoutShift(host, <Shell header={false} brand={brandLink} />)).toBe(0)
  },
}

/**
 * A touch screen gets a 44px Menu button (the small Button's coarse-pointer
 * target); a mouse keeps the compact control.
 * It drives Chrome's touch emulation through Vitest's CDP session, so it runs
 * as a test and stays out of the dev sidebar (there is no Vitest there).
 */
export const MenuButtonTouchTarget: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <html.div style={styles.phone}>
      <Shell />
    </html.div>
  ),
  play: async ({canvas}) => {
    const menu = () => canvas.getByRole('button', {name: 'Menu'})
    await withFinePointer()
    await expect(menu().getBoundingClientRect().height).toBeLessThan(SIZES_PX.touchTarget)
    await withCoarsePointer(async () => {
      await waitFor(() =>
        expect(menu().getBoundingClientRect().height).toBeGreaterThanOrEqual(SIZES_PX.touchTarget),
      )
      await expect(menu().getBoundingClientRect().width).toBeGreaterThanOrEqual(
        SIZES_PX.touchTarget,
      )
    })
  },
}
