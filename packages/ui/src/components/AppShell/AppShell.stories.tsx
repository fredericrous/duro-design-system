import {Component, useState, type ReactNode} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, spyOn, waitFor, within} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {renderToString} from 'react-dom/server'
import {hydrateRoot} from 'react-dom/client'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {SIZES_PX, SPACING_PX} from '@duro-app/tokens/keys'
import {breakpointsPx} from '@duro-app/tokens/tokens/breakpoints.css'
import {AppShell, type AppShellCollapse} from './AppShell'
import {withCoarsePointer, withFinePointer} from '../../docs/coarsePointer'
import {SideNav} from '../SideNav/SideNav'
import {Heading} from '../Heading/Heading'
import {Text} from '../Text/Text'
import {Input} from '../Input/Input'
import {Menu} from '../Menu/Menu'
import {TextLink} from '../TextLink/TextLink'
import {Aside} from '../Aside/Aside'
import {Stack} from '../Stack/Stack'

// --- the story's frame -----------------------------------------------------

// The shell measures its own width, not the window's: the frame stands for a
// phone, a tablet or a desktop window, whatever the browser's size.
type FrameWidth = 'phone' | 'tablet' | 'desktop'

const PHONE_PX = 375
const DESKTOP_PX = breakpointsPx.xl
const FRAME_PX: Record<FrameWidth, number> = {
  phone: PHONE_PX,
  tablet: breakpointsPx.md,
  desktop: DESKTOP_PX,
}

const styles = css.create({
  // An outline, not a border: it shows the frame's edge without taking any
  // of its width.
  frame: (width: number) => ({
    width,
    outlineWidth: borders.hairline,
    outlineStyle: 'dashed',
    outlineColor: colors.border,
  }),
})

function Frame({px, children}: {px: number; children?: ReactNode}) {
  return (
    <html.div style={styles.frame(px)} data-frame="">
      {children}
    </html.div>
  )
}

// --- the shell the stories render ------------------------------------------

type HeaderContent = 'none' | 'search' | 'search-account'

interface ShellArgs {
  /** The story's frame: the width the shell measures. */
  width: FrameWidth
  /** What `AppShell.Header` holds; `none` leaves the Header out. */
  header: HeaderContent
  /** The brand link's text; empty for no brand. */
  brand: string
  /** The rail's footer text; empty for no footer. */
  footer: string
  collapseBelow: AppShellCollapse
  menuLabel: string
  closeLabel: string
  skipLabel: string
  /** A pick in the navigation (SideNav `onValueChange`). */
  onNavigate: (path: string) => void
  /** The search input's value, on every change. */
  onSearchChange: (value: string) => void
  /** The search input's value, on Enter. */
  onSearchSubmit: (value: string) => void
  /** An item of the account menu. */
  onAccountAction: (action: string) => void
}

const BRAND = 'Duro docs'
const FOOTER = 'Signed in as Ada'

const ACCOUNT_ACTIONS = ['Profile', 'Settings', 'Sign out'] as const

function Shell({
  header,
  brand,
  footer,
  collapseBelow,
  menuLabel,
  closeLabel,
  skipLabel,
  onNavigate,
  onSearchChange,
  onSearchSubmit,
  onAccountAction,
  children,
}: Omit<ShellArgs, 'width'> & {children?: ReactNode}) {
  const [path, setPath] = useState('/docs')
  return (
    <AppShell.Root
      menuLabel={menuLabel}
      closeLabel={closeLabel}
      skipLabel={skipLabel}
      brand={brand ? <TextLink href="/">{brand}</TextLink> : undefined}
      collapseBelow={collapseBelow}
    >
      <AppShell.Rail
        aria-label="Navigation"
        footer={footer ? <Text variant="bodySm">{footer}</Text> : undefined}
      >
        {({close}) => (
          <SideNav.Root
            aria-label="Sections"
            value={path}
            onValueChange={(value) => {
              close()
              setPath(value)
              onNavigate(value)
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
      {header !== 'none' && (
        <AppShell.Header>
          <Input
            type="search"
            aria-label="Search the docs"
            placeholder="Search the docs"
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSearchSubmit(event.currentTarget.value)
            }}
          />
          {header === 'search-account' && (
            <Menu.Root>
              <Menu.Trigger>Account</Menu.Trigger>
              <Menu.Popup align="end">
                {ACCOUNT_ACTIONS.map((action) => (
                  <Menu.Item key={action} onClick={() => onAccountAction(action)}>
                    {action}
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Root>
          )}
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

const meta = {
  title: 'Layout/AppShell',
  render: ({width, ...args}) => (
    <Frame px={FRAME_PX[width]}>
      <Shell {...args} />
    </Frame>
  ),
  args: {
    width: 'desktop',
    header: 'search',
    brand: BRAND,
    footer: '',
    collapseBelow: 'sm',
    menuLabel: 'Menu',
    closeLabel: 'Close navigation',
    skipLabel: 'Skip to content',
    onNavigate: fn(),
    onSearchChange: fn(),
    onSearchSubmit: fn(),
    onAccountAction: fn(),
  },
  argTypes: {
    width: {
      control: {
        type: 'radio',
        labels: {phone: 'phone 375', tablet: 'tablet 768', desktop: 'desktop 1280'},
      },
      options: ['phone', 'tablet', 'desktop'],
    },
    header: {
      control: {
        type: 'radio',
        labels: {none: 'none', search: 'search', 'search-account': 'search + account menu'},
      },
      options: ['none', 'search', 'search-account'],
    },
    brand: {control: 'text'},
    footer: {control: 'text'},
    collapseBelow: {control: 'radio', options: ['sm', 'md', 'lg']},
    menuLabel: {control: 'text'},
    closeLabel: {control: 'text'},
    skipLabel: {control: 'text'},
  },
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
} satisfies Meta<ShellArgs>

export default meta
type Story = StoryObj<typeof meta>

const page = () => within(document.body)
const setWidth = (element: HTMLElement, px: number) => {
  element.style.width = `${px}px`
}
const frameOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[data-frame]') as HTMLElement
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))

// Test-only: runs under Vitest, hidden from the dev sidebar and the docs page.
const TEST_ONLY = ['!dev', '!autodocs']

// --- visible stories -------------------------------------------------------

/**
 * Every part of the shell, driven by Controls. Try: set `width` to phone and
 * press Menu to open the rail in a drawer; set `collapseBelow` to lg at the
 * tablet width; click in the canvas and press Tab for the skip link. A pick in
 * the navigation, the search box and the account menu show up in Actions.
 */
export const Playground: Story = {
  args: {header: 'search-account', footer: FOOTER},
}

/**
 * Phone: the rail is hidden; one sticky bar holds the Menu button, the brand
 * and the Header's content.
 */
export const Phone: Story = {
  args: {width: 'phone'},
  play: async ({args, canvas}) => {
    await expect(canvas.queryByRole('navigation', {name: 'Navigation'})).toBeNull()
    const menu = canvas.getByRole('button', {name: args.menuLabel})
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    const banner = canvas.getByRole('banner')
    await expect(banner.contains(menu)).toBe(true)
    await expect(banner.contains(canvas.getByRole('link', {name: args.brand}))).toBe(true)
    await expect(banner.contains(canvas.getByRole('searchbox'))).toBe(true)
    await expect(banner.getBoundingClientRect().height).toBe(SIZES_PX.appBarH)
    await expect(getComputedStyle(banner).position).toBe('sticky')
  },
}

/** No Header: the desktop shell is the rail and the page, nothing above Main. */
export const NoHeader: Story = {
  args: {header: 'none'},
  play: async ({args, canvas}) => {
    await expect(canvas.getByRole('navigation', {name: 'Navigation'})).toBeVisible()
    await expect(canvas.queryByRole('banner')).toBeNull()
    await expect(canvas.queryByRole('button', {name: args.menuLabel})).toBeNull()
    await expect(canvas.getAllByRole('link', {name: args.brand})).toHaveLength(1)
  },
}

/** `footer` sits at the rail's foot: the signed-in user, a licence line. */
export const RailFooter: Story = {
  args: {footer: FOOTER},
  play: async ({args, canvas}) => {
    const rail = canvas.getByRole('navigation', {name: 'Navigation'})
    const footer = canvas.getByText(args.footer)
    await expect(rail.contains(footer)).toBe(true)
    // at the foot: its box ends within the rail's last spacing.md
    const gap = rail.getBoundingClientRect().bottom - footer.getBoundingClientRect().bottom
    await expect(gap).toBeGreaterThanOrEqual(0)
    await expect(gap).toBeLessThanOrEqual(SPACING_PX.md)
  },
}

// --- test-only stories -----------------------------------------------------

/** Desktop: the brand and the rail beside the header and the page; no Menu button. */
export const DesktopLandmarks: Story = {
  tags: TEST_ONLY,
  play: async ({args, canvas}) => {
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
    await expect(canvas.queryByRole('button', {name: args.menuLabel})).toBeNull()
    // the brand is the rail's copy
    await expect(rail.contains(canvas.getByRole('link', {name: args.brand}))).toBe(true)
  },
}

/**
 * The Menu button opens the rail in a Drawer. Focus moves into the drawer,
 * and back to the Menu button when it closes — by Escape, and after a pick.
 */
export const PhoneDrawer: Story = {
  tags: TEST_ONLY,
  args: {width: 'phone', brand: ''},
  play: async ({args, canvas, userEvent}) => {
    const menu = canvas.getByRole('button', {name: args.menuLabel})
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
    await expect(args.onNavigate).toHaveBeenCalledWith('/articles')
  },
}

/**
 * The Playground's actions reach their args: a pick in the navigation, the
 * search input's changes and Enter, an account menu item.
 */
export const PlaygroundActions: Story = {
  tags: TEST_ONLY,
  args: {header: 'search-account'},
  play: async ({args, canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Articles'}))
    await expect(args.onNavigate).toHaveBeenCalledWith('/articles')

    const search = canvas.getByRole('searchbox', {name: 'Search the docs'})
    await userEvent.type(search, 'flux{Enter}')
    await expect(args.onSearchChange).toHaveBeenLastCalledWith('flux')
    await expect(args.onSearchSubmit).toHaveBeenCalledWith('flux')

    await userEvent.click(canvas.getByRole('button', {name: 'Account'}))
    await userEvent.click(await page().findByRole('menuitem', {name: 'Sign out'}))
    await expect(args.onAccountAction).toHaveBeenCalledWith('Sign out')
  },
}

/** No Header on a phone still gives the bar: the Menu button and the brand. */
export const NoHeaderPhone: Story = {
  tags: TEST_ONLY,
  args: {width: 'phone', header: 'none'},
  play: async ({args, canvas}) => {
    const banner = canvas.getByRole('banner')
    const menu = canvas.getByRole('button', {name: args.menuLabel})
    await expect(menu).toBeVisible()
    await expect(banner.contains(menu)).toBe(true)
    await expect(banner.contains(canvas.getByRole('link', {name: args.brand}))).toBe(true)
    await expect(banner.getBoundingClientRect().height).toBe(SIZES_PX.appBarH)
  },
}

/**
 * The brand is in the server's HTML twice (the top of the rail, the bar) and
 * CSS shows one: the accessibility tree holds exactly one link at a phone's
 * width and at a desktop's, and only that one takes focus.
 */
export const Brand: Story = {
  tags: TEST_ONLY,
  play: async ({args, canvas, canvasElement}) => {
    const frame = frameOf(canvasElement)
    const focusable = () =>
      [...canvasElement.querySelectorAll<HTMLAnchorElement>('a[href="/"]')].filter((a) =>
        a.checkVisibility(),
      )
    await expect(canvasElement.querySelectorAll('a[href="/"]')).toHaveLength(2)
    try {
      for (const width of [PHONE_PX, DESKTOP_PX]) {
        setWidth(frame, width)
        await waitFor(() => expect(canvas.getAllByRole('link', {name: args.brand})).toHaveLength(1))
        await expect(focusable()).toHaveLength(1)
      }
      const link = canvas.getByRole('link', {name: args.brand})
      await expect(canvas.getByRole('navigation', {name: 'Navigation'}).contains(link)).toBe(true)
    } finally {
      frame.style.width = ''
    }
  },
}

/** The footer comes along into the drawer, after the navigation. */
export const RailFooterInDrawer: Story = {
  tags: TEST_ONLY,
  args: {width: 'phone', brand: '', footer: FOOTER},
  play: async ({args, canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: args.menuLabel}))
    const dialog = await page().findByRole('dialog', {name: 'Navigation'})
    await expect(within(dialog).getByText(args.footer)).toBeVisible()
    // rendered once, in the drawer while it is open
    await expect(page().getAllByText(args.footer)).toHaveLength(1)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(page().queryByRole('dialog')).toBeNull())
  },
}

/**
 * `collapseBelow="md"`: at 680px (between sm and md) the shell already shows
 * the Menu button, on its own width — the window does not change.
 */
export const CollapseBelowMd: Story = {
  tags: TEST_ONLY,
  args: {brand: '', collapseBelow: 'md'},
  render: ({width: _width, ...args}) => (
    <Frame px={SIZES_PX.dialogLg}>
      <Shell {...args} />
    </Frame>
  ),
  play: async ({args, canvas, canvasElement}) => {
    const frame = frameOf(canvasElement)
    const viewport = window.innerWidth
    await expect(canvas.queryByRole('navigation', {name: 'Navigation'})).toBeNull()
    await expect(canvas.getByRole('button', {name: args.menuLabel})).toBeVisible()
    try {
      setWidth(frame, breakpointsPx.md - 1)
      await nextFrame()
      await expect(canvas.queryByRole('navigation', {name: 'Navigation'})).toBeNull()
      setWidth(frame, breakpointsPx.md)
      await waitFor(() =>
        expect(canvas.getByRole('navigation', {name: 'Navigation'})).toBeVisible(),
      )
      await expect(canvas.queryByRole('button', {name: args.menuLabel})).toBeNull()
      await expect(window.innerWidth).toBe(viewport)
    } finally {
      frame.style.width = ''
    }
  },
}

/** The skip link is the first tab stop and moves focus to Main. */
export const SkipLink: Story = {
  tags: TEST_ONLY,
  play: async ({args, canvas, userEvent}) => {
    ;(document.activeElement as HTMLElement | null)?.blur()
    await userEvent.tab()
    const skip = canvas.getByRole('link', {name: args.skipLabel})
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
  tags: TEST_ONLY,
  render: (args) => (
    <Frame px={FRAME_PX[args.width]}>
      <AppShell.Root
        menuLabel={args.menuLabel}
        closeLabel={args.closeLabel}
        skipLabel={args.skipLabel}
      >
        <AppShell.Rail aria-label="Navigation">
          <Text>Links</Text>
        </AppShell.Rail>
        <AppShell.Main>
          <Heading level={1}>Docs</Heading>
        </AppShell.Main>
      </AppShell.Root>
    </Frame>
  ),
  play: async ({args, canvas}) => {
    const main = canvas.getByRole('main')
    const id = main.getAttribute('id')
    await expect(id).toBeTruthy()
    await expect(canvas.getByRole('link', {name: args.skipLabel})).toHaveAttribute('href', `#${id}`)
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
  tags: TEST_ONLY,
  // What renders is the test's error fallback, not AppShell: nothing for axe
  // to judge about the component (every other AppShell story keeps it).
  parameters: {a11y: {test: 'off'}},
  render: (args) => (
    <Caught>
      <AppShell.Root
        menuLabel={args.menuLabel}
        closeLabel={args.closeLabel}
        skipLabel={args.skipLabel}
      >
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
 * under it; above, at its own offset: AppShell sets the bar's height on an
 * element inside its query container, and Aside's top adds it to its offset.
 */
export const AsideBelowBar: Story = {
  tags: TEST_ONLY,
  args: {width: 'phone', brand: ''},
  render: ({width, ...args}) => (
    <Frame px={FRAME_PX[width]}>
      <Shell {...args}>
        <Aside aria-label="Page outline">
          <Text>On this page</Text>
        </Aside>
        <Stack gap="md">
          {PARAGRAPHS.map((text) => (
            <Text key={text}>{text}</Text>
          ))}
        </Stack>
      </Shell>
    </Frame>
  ),
  play: async ({canvas, canvasElement}) => {
    const frame = frameOf(canvasElement)
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
 * accessibility tree. It replaces the canvas's content with the server's
 * HTML, then hydrates and unmounts it, so it runs as a test only.
 */
export const ServerRender: Story = {
  tags: TEST_ONLY,
  render: ({width}) => (
    <Frame px={FRAME_PX[width]}>
      <html.div data-ssr-host="" />
    </Frame>
  ),
  play: async ({args: {width: _width, ...args}, canvasElement}) => {
    const host = canvasElement.querySelector('[data-ssr-host]') as HTMLElement
    const markup = renderToString(<Shell {...args} />)
    await expect(markup.split(args.brand).length - 1).toBe(2)
    host.innerHTML = markup
    const shell = within(host)
    // before hydration: the desktop shell, from CSS alone
    await expect(shell.getByRole('navigation', {name: 'Navigation'})).toBeVisible()
    await expect(shell.getByRole('button', {name: args.menuLabel, hidden: true})).not.toBeVisible()
    await expect(shell.getAllByRole('link', {name: args.brand})).toHaveLength(1)

    const errors: unknown[] = []
    const consoleError = console.error
    console.error = (...rest: unknown[]) => {
      errors.push(rest)
      consoleError(...rest)
    }
    const root = hydrateRoot(host, <Shell {...args} />, {
      onRecoverableError: (error) => errors.push(error),
    })
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))
      await expect(shell.getByRole('navigation', {name: 'Navigation'})).toBeVisible()
      await expect(shell.getAllByRole('link', {name: args.brand})).toHaveLength(1)
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
  tags: TEST_ONLY,
  args: {width: 'phone'},
  render: ({width}) => <Frame px={FRAME_PX[width]} />,
  play: async ({args: {width: _width, ...args}, canvasElement}) => {
    const host = frameOf(canvasElement)
    setWidth(host, PHONE_PX)
    await expect(PerformanceObserver.supportedEntryTypes).toContain('layout-shift')
    await expect(await layoutShift(host, <Shell {...args} />)).toBe(0)
    await expect(await layoutShift(host, <Shell {...args} header="none" />)).toBe(0)
  },
}

/**
 * A touch screen gets a 44px Menu button (the small Button's coarse-pointer
 * target); a mouse keeps the compact control.
 * It drives Chrome's touch emulation through Vitest's CDP session, so it runs
 * as a test and stays out of the dev sidebar (there is no Vitest there).
 */
export const MenuButtonTouchTarget: Story = {
  tags: TEST_ONLY,
  args: {width: 'phone', brand: ''},
  play: async ({args, canvas}) => {
    const menu = () => canvas.getByRole('button', {name: args.menuLabel})
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
