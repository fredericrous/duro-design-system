import {
  Children,
  createContext,
  isValidElement,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import {html} from 'react-strict-dom'
import {Button} from '../Button/Button'
import {Drawer} from '../Drawer/Drawer'
import {Icon} from '../Icon'
import {useSafeAreaInsets} from '../../shared/safeArea'
import {InLandmarkContext} from '../../shared/InLandmarkContext'
import {nativeStyles} from './native.css'

export type AppShellCollapse = 'sm' | 'md' | 'lg'
export type AppShellScroll = 'page' | 'main'

interface AppShellContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  closeLabel: string
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

// True only where Root placed a Header itself, as on the web.
const HeaderSlotContext = createContext(false)

function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext)
  if (!ctx) throw new Error('AppShell compound components must be used within AppShell.Root')
  return ctx
}

interface RootProps {
  /** The button that opens the navigation ("Menu"), from your text catalog. */
  menuLabel: string
  /** The accessible name of the drawer's close button ("Close navigation"). */
  closeLabel: string
  /** Web only: native has no skip link (no keyboard tab order to skip). */
  skipLabel: string
  /** The app's name or logo, shown in the bar beside the Menu button. */
  brand?: ReactNode
  /** Web only: a phone is below every breakpoint, so native always shows the bar and the drawer. */
  collapseBelow?: AppShellCollapse
  /** Web only: native Main always fills the screen under the bar and its content scrolls itself. */
  scroll?: AppShellScroll
  /** `AppShell.Rail`, `AppShell.Main` and an optional `AppShell.Header`, as direct children. */
  children: ReactNode
}

/**
 * Native AppShell (plan N0, Slice B): the narrow shape the web shows below
 * `collapseBelow`, always — the bar on top (Menu button, brand, the Header's
 * content) below the top safe-area inset, Main under it, and the Rail's
 * navigation in a left Drawer. The same parts and props as the web.
 */
function Root({menuLabel, closeLabel, brand, children}: RootProps) {
  const [open, setOpen] = useState(false)
  const insets = useSafeAreaInsets()

  let header: ReactNode = null
  const rest: ReactNode[] = []
  Children.forEach(children, (child) => {
    if (isValidElement<HeaderProps>(child) && child.type === Header) {
      header = child
      return
    }
    rest.push(child)
  })

  const value = useMemo(() => ({open, setOpen, closeLabel}), [open, closeLabel])

  return (
    <AppShellContext.Provider value={value}>
      <html.div style={nativeStyles.shell}>
        <html.header style={[nativeStyles.bar, nativeStyles.barTop(insets.top)]}>
          <Button
            variant="secondary"
            size="small"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" size="sm" />
            {menuLabel}
          </Button>
          {brand}
          <HeaderSlotContext.Provider value={true}>{header}</HeaderSlotContext.Provider>
        </html.header>
        {rest}
      </html.div>
    </AppShellContext.Provider>
  )
}

export interface AppShellRailState {
  /** Closes the drawer. Call it after any selection in the navigation. */
  close: () => void
}

type RailContent = ReactNode | ((state: AppShellRailState) => ReactNode)

interface RailProps {
  /** Names the navigation and the drawer ("Navigation"); required. */
  'aria-label': string
  /** The navigation (a SideNav, a Tree), shown in the drawer; a function receives `close`. */
  children: RailContent
  /** What sits at the end of the drawer; a function receives `close`. */
  footer?: RailContent
}

function Rail({'aria-label': ariaLabel, children, footer}: RailProps) {
  const {open, setOpen, closeLabel} = useAppShell()
  const close = useCallback(() => setOpen(false), [setOpen])
  const content = typeof children === 'function' ? children({close}) : children
  const foot = typeof footer === 'function' ? footer({close}) : footer

  return (
    <InLandmarkContext.Provider value={true}>
      <Drawer.Root anchor="left" open={open} onOpenChange={setOpen}>
        <Drawer.Portal size="sm">
          <Drawer.Header>
            <Drawer.Title>{ariaLabel}</Drawer.Title>
            <Drawer.Close aria-label={closeLabel} />
          </Drawer.Header>
          <Drawer.Body>
            <html.nav aria-label={ariaLabel}>
              {content}
              {foot != null && <html.div style={nativeStyles.drawerFooter}>{foot}</html.div>}
            </html.nav>
          </Drawer.Body>
        </Drawer.Portal>
      </Drawer.Root>
    </InLandmarkContext.Provider>
  )
}

interface HeaderProps {
  /** The header's content: a search field, the account menu. It sits in the bar. */
  children?: ReactNode
}

function Header({children}: HeaderProps) {
  useAppShell()
  if (!useContext(HeaderSlotContext)) {
    throw new Error(
      'AppShell.Header must be a direct child of AppShell.Root (not inside a fragment or another component)',
    )
  }
  return <html.div style={nativeStyles.header}>{children}</html.div>
}

interface MainProps {
  children: ReactNode
  /** Web only: the skip link's target. */
  id?: string
  /** The main region's host, e.g. to hand `useContainerBelow`. */
  ref?: Ref<HTMLElement>
}

function Main({children, ref}: MainProps) {
  useAppShell()
  return (
    <html.main ref={ref} style={nativeStyles.main}>
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
