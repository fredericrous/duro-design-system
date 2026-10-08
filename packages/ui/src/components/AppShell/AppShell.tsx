import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import {useContainerBelow} from '../../hooks/useContainerBelow'
import {styles} from './styles.css'

/* AppShell — an application's frame: a navigation rail beside a header and
 * the main content. At and above the `sm` breakpoint (the shell's own width,
 * a container query) the rail sits on the left; below it the rail is hidden
 * and a Menu button in the header opens the same navigation in a left
 * Drawer. CSS makes the switch, so the server renders the desktop shell and
 * the first paint is already right at any width.
 *
 * Landmarks: the rail is a `nav` named by its `aria-label`, the header a
 * `header` (banner), the content a `main`. */

interface AppShellContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  menuLabel: string
  closeLabel: string
  menuButtonRef: RefObject<HTMLButtonElement | null>
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext)
  if (!ctx) throw new Error('AppShell compound components must be used within AppShell.Root')
  return ctx
}

// --- Root ---

interface RootProps {
  /** The narrow-width button that opens the navigation ("Menu"), from your text catalog. */
  menuLabel: string
  /** The accessible name of the drawer's close button ("Close navigation"). */
  closeLabel: string
  /** `AppShell.Rail`, `AppShell.Header` and `AppShell.Main`. */
  children: ReactNode
}

function Root({menuLabel, closeLabel, children}: RootProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const narrow = useContainerBelow(containerRef, 'sm')

  // Widening past sm while the drawer is open puts the rail back: close it.
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
    () => ({open, setOpen, menuLabel, closeLabel, menuButtonRef}),
    [open, menuLabel, closeLabel],
  )

  return (
    <AppShellContext.Provider value={value}>
      <html.div ref={containerRef} style={styles.container}>
        <html.div style={styles.grid}>{children}</html.div>
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

interface RailProps {
  /** Names the navigation landmark and the drawer ("Navigation"); required. */
  'aria-label': string
  /**
   * The navigation (a SideNav, a Tree, a brand line). Rendered in the rail
   * and, while it is open, in the drawer; a function receives `close`.
   */
  children: ReactNode | ((state: AppShellRailState) => ReactNode)
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

function Rail({'aria-label': ariaLabel, children}: RailProps) {
  const {open, setOpen, closeLabel} = useAppShell()
  const close = useCallback(() => setOpen(false), [setOpen])
  const drawerNavRef = useRef<HTMLElement | null>(null)
  const content = typeof children === 'function' ? children({close}) : children

  // The drawer is modal: move focus into it, onto the first control.
  useEffect(() => {
    if (!open) return
    drawerNavRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
  }, [open])

  return (
    <>
      <html.nav aria-label={ariaLabel} style={styles.rail}>
        {content}
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
            </html.nav>
          </Drawer.Body>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}

// --- Header ---

interface HeaderProps {
  /** The header's content: a search form, the account menu. */
  children?: ReactNode
}

function Header({children}: HeaderProps) {
  const {open, setOpen, menuLabel, menuButtonRef} = useAppShell()
  return (
    <html.header style={styles.header}>
      <html.div style={styles.menu}>
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
      {children}
    </html.header>
  )
}

// --- Main ---

interface MainProps {
  children: ReactNode
  /** For a skip link's target (`href="#main"`). */
  id?: string
  /** The `main` element: the container to hand `useContainerBelow`. */
  ref?: Ref<HTMLElement>
}

function Main({children, id, ref}: MainProps) {
  useAppShell()
  return (
    <html.main ref={ref} id={id} style={styles.main}>
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
