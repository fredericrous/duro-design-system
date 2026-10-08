import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react'
import {html} from 'react-strict-dom'
import {Button} from '../Button/Button'
import {Drawer} from '../Drawer/Drawer'
import {Icon} from '../Icon'
import {TextLink} from '../TextLink/TextLink'
import {useContainerBelow} from '../../hooks/useContainerBelow'
import type {OnNavigate} from '../../shared/navigate'
import {styles} from './styles.css'

/* AppShell — an application's frame: a navigation rail beside the main
 * content, with an optional Header. At and above `collapseBelow` (the
 * shell's own width, a container query) the rail sits on the left, the brand
 * at its top, and the Header is a row above Main that scrolls with the page.
 * Below it the rail is hidden and ONE sticky bar takes the top: a Menu button
 * that opens the same navigation in a left Drawer, the brand, then the
 * Header's content when there is a Header — so a shell without a Header still
 * has its navigation on a phone. CSS makes the switch, so the server renders
 * one HTML for every width and nothing moves after hydration: the brand is in
 * the HTML twice (rail and bar) and `display: none` hides the inactive copy.
 *
 * Landmarks: the rail is a `nav` named by its `aria-label`, the bar a
 * `header` (banner), the content a `main`, which a skip link (the first tab
 * stop) focuses. */

export type AppShellCollapse = 'sm' | 'md' | 'lg'

interface AppShellContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  closeLabel: string
  brand: ReactNode
  collapseBelow: AppShellCollapse
  mainId: string
  mainRef: RefObject<HTMLElement | null>
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

// True only where Root placed a Header itself: Root finds Header among its
// direct children, so a Header wrapped in a fragment or a component would
// otherwise render as a stray grid item and never reach the bar.
const HeaderSlotContext = createContext(false)

function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext)
  if (!ctx) throw new Error('AppShell compound components must be used within AppShell.Root')
  return ctx
}

const variants = {
  sm: {
    grid: styles.gridSm,
    rail: styles.railSm,
    bar: styles.barSm,
    barEmpty: styles.barEmptySm,
    narrow: styles.narrowSm,
    main: styles.mainSm,
  },
  md: {
    grid: styles.gridMd,
    rail: styles.railMd,
    bar: styles.barMd,
    barEmpty: styles.barEmptyMd,
    narrow: styles.narrowMd,
    main: styles.mainMd,
  },
  lg: {
    grid: styles.gridLg,
    rail: styles.railLg,
    bar: styles.barLg,
    barEmpty: styles.barEmptyLg,
    narrow: styles.narrowLg,
    main: styles.mainLg,
  },
} as const satisfies Record<AppShellCollapse, unknown>

// --- Root ---

interface RootProps {
  /** The narrow-width button that opens the navigation ("Menu"), from your text catalog. */
  menuLabel: string
  /** The accessible name of the drawer's close button ("Close navigation"). */
  closeLabel: string
  /** The skip link's text ("Skip to content"): the first tab stop, it moves focus to Main. */
  skipLabel: string
  /**
   * The app's name or logo — usually a link home. Shown at the top of the
   * rail and, below `collapseBelow`, in the bar beside the Menu button.
   */
  brand?: ReactNode
  /**
   * Below this breakpoint, measured on the shell's own width, the rail
   * becomes a Drawer behind the Menu button. Default `sm`.
   */
  collapseBelow?: AppShellCollapse
  /**
   * `AppShell.Rail`, `AppShell.Main` and an optional `AppShell.Header`, as
   * direct children (Root places the Header's content in its bar).
   */
  children: ReactNode
}

function Root({
  menuLabel,
  closeLabel,
  skipLabel,
  brand,
  collapseBelow = 'sm',
  children,
}: RootProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)
  const narrow = useContainerBelow(containerRef, collapseBelow)
  const generatedId = useId()
  const variant = variants[collapseBelow]

  // The Header's content goes in the bar, after the Menu button and the
  // brand; Main may name its own id, which the skip link then targets.
  let header: ReactNode = null
  let hasHeader = false
  let mainId = `${generatedId}main`
  const rest: ReactNode[] = []
  Children.forEach(children, (child) => {
    if (isValidElement<HeaderProps>(child) && child.type === Header) {
      hasHeader = true
      header = child
      return
    }
    if (isValidElement<MainProps>(child) && child.type === Main && child.props.id) {
      mainId = child.props.id
    }
    rest.push(child)
  })

  // Widening past the collapse point while the drawer is open puts the rail
  // back: close it.
  useEffect(() => {
    if (!narrow) setOpen(false)
  }, [narrow])

  // Focus goes back to the Menu button when the drawer closes (Escape, the
  // close button, the backdrop, a navigation).
  const wasOpen = useRef(false)
  useEffect(() => {
    if (wasOpen.current && !open) menuButtonRef.current?.focus()
    wasOpen.current = open
  }, [open])

  const value = useMemo(
    () => ({open, setOpen, closeLabel, brand, collapseBelow, mainId, mainRef}),
    [open, closeLabel, brand, collapseBelow, mainId],
  )

  // Focus Main itself (tabIndex -1), not just scroll to it, and leave the
  // URL alone: a router may read the hash.
  const skip: OnNavigate = (_href, event) => {
    event.preventDefault()
    mainRef.current?.focus()
  }

  return (
    <AppShellContext.Provider value={value}>
      <html.div ref={containerRef} style={styles.container}>
        <html.div style={[styles.grid, variant.grid]}>
          <html.div style={styles.skip}>
            <TextLink href={`#${mainId}`} onNavigate={skip}>
              {skipLabel}
            </TextLink>
          </html.div>
          <html.header style={[styles.bar, variant.bar, !hasHeader && variant.barEmpty]}>
            <html.div style={[styles.narrowItem, variant.narrow]}>
              <Button
                ref={menuButtonRef}
                variant="secondary"
                size="small"
                aria-expanded={open}
                onClick={() => setOpen(true)}
              >
                <Icon name="menu" size="sm" />
                {menuLabel}
              </Button>
            </html.div>
            {brand != null && (
              <html.div style={[styles.narrowItem, variant.narrow]}>{brand}</html.div>
            )}
            <HeaderSlotContext.Provider value={true}>{header}</HeaderSlotContext.Provider>
          </html.header>
          {rest}
        </html.div>
      </html.div>
    </AppShellContext.Provider>
  )
}

// --- Rail ---

export interface AppShellRailState {
  /**
   * Closes the drawer. Call it after any selection in the navigation — the
   * current page included, where no route change would close it.
   */
  close: () => void
}

type RailContent = ReactNode | ((state: AppShellRailState) => ReactNode)

interface RailProps {
  /** Names the navigation landmark and the drawer ("Navigation"); required. */
  'aria-label': string
  /**
   * The navigation (a SideNav, a Tree). Rendered in the rail, or in the
   * drawer while it is open (never both); a function receives `close`.
   */
  children: RailContent
  /**
   * What sits at the rail's foot — the signed-in user, a licence line —
   * and at the end of the drawer. A function receives `close`.
   */
  footer?: RailContent
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

function Rail({'aria-label': ariaLabel, children, footer}: RailProps) {
  const {open, setOpen, closeLabel, brand, collapseBelow} = useAppShell()
  const close = useCallback(() => setOpen(false), [setOpen])
  const drawerNavRef = useRef<HTMLElement | null>(null)
  const content = typeof children === 'function' ? children({close}) : children
  const foot = typeof footer === 'function' ? footer({close}) : footer
  const variant = variants[collapseBelow]

  // The drawer is modal: move focus into it, onto the first control.
  useEffect(() => {
    if (!open) return
    drawerNavRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
  }, [open])

  return (
    <>
      {/* Rendered in one place at a time, so ids (a Tree's) and the landmark
          name are never duplicated: the drawer only opens below the collapse
          point, where the rail is hidden. The brand stays: the bar holds the
          narrow copy, and display: none hides this one there. */}
      <html.nav
        aria-label={ariaLabel}
        style={[styles.rail, variant.rail]}
        hidden={open || undefined}
      >
        {brand != null && <html.div style={styles.railBrand}>{brand}</html.div>}
        <html.div style={styles.railBody}>{open ? null : content}</html.div>
        {foot != null && <html.div style={styles.railFooter}>{open ? null : foot}</html.div>}
      </html.nav>
      <Drawer.Root anchor="left" open={open} onOpenChange={setOpen}>
        <Drawer.Portal size="sm">
          <Drawer.Header>
            <Drawer.Title>{ariaLabel}</Drawer.Title>
            <Drawer.Close aria-label={closeLabel} />
          </Drawer.Header>
          <Drawer.Body>
            <html.nav ref={drawerNavRef} aria-label={ariaLabel}>
              {content}
              {foot != null && <html.div style={styles.drawerFooter}>{foot}</html.div>}
            </html.nav>
          </Drawer.Body>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}

// --- Header ---

interface HeaderProps {
  /**
   * The header's content: a search form, the account menu. Below
   * `collapseBelow` it joins the Menu button and the brand in the sticky
   * bar; above, it is a row over Main that scrolls with the page.
   */
  children?: ReactNode
}

function Header({children}: HeaderProps) {
  useAppShell()
  if (!useContext(HeaderSlotContext)) {
    throw new Error(
      'AppShell.Header must be a direct child of AppShell.Root (not inside a fragment or another component)',
    )
  }
  return <html.div style={styles.header}>{children}</html.div>
}

// --- Main ---

interface MainProps {
  children: ReactNode
  /** The skip link's target; Root makes one with `useId` when it is left out. */
  id?: string
  /** The `main` element: the container to hand `useContainerBelow`. */
  ref?: Ref<HTMLElement>
}

function Main({children, id, ref}: MainProps) {
  const {mainId, mainRef, collapseBelow} = useAppShell()
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      mainRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [mainRef, ref],
  )
  return (
    <html.main
      ref={setRef}
      id={id ?? mainId}
      tabIndex={-1}
      style={[styles.main, variants[collapseBelow].main]}
    >
      {children}
    </html.main>
  )
}

export const AppShell = {
  Root,
  Rail,
  Header,
  Main,
}
