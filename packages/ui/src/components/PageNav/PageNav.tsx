import {createContext, type ReactNode, useContext} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {linkClickHandler, type OnNavigate} from '../../shared/navigate'

/* PageNav — the previous and next pages in reading order, at the foot of a
 * page: a labelled `nav` holding up to two link cards. Each card shows a small
 * direction label ("Previous", from your text catalog) over the page title.
 * Prev holds the left slot and Next the right one even when the other is
 * missing, so Next stays right-aligned on the last-but-one page too; on a
 * narrow container (below the `xs` breakpoint) the two stack.
 *
 * Not `Pagination` (numbered result pages, in `@duro-app/ui/table`). */

// Prev and Next place themselves in Root's two-column grid.
const PageNavContext = createContext(false)

function usePageNav() {
  if (!useContext(PageNavContext))
    throw new Error('PageNav compound components must be used within PageNav.Root')
}

// --- Root ---

interface RootProps {
  /** Names the landmark ("Pages"); required, from your text catalog. */
  'aria-label': string
  /** A `PageNav.Prev` and/or a `PageNav.Next`. */
  children: ReactNode
}

function Root({'aria-label': ariaLabel, children}: RootProps) {
  return (
    <PageNavContext.Provider value={true}>
      <html.nav aria-label={ariaLabel} style={styles.root}>
        <html.div style={styles.grid}>{children}</html.div>
      </html.nav>
    </PageNavContext.Provider>
  )
}

// --- Prev / Next ---

interface LinkProps {
  href: string
  /** The page's title. */
  title: ReactNode
  /** The direction label above the title ("Previous", "Next"), from your text catalog. */
  label: ReactNode
  /**
   * Client-side navigation: called for a plain primary click (no modifier
   * key). Call `event.preventDefault()`, then your router's navigate.
   */
  onNavigate?: OnNavigate
}

function Prev({href, title, label, onNavigate}: LinkProps) {
  usePageNav()
  return (
    <html.a
      href={href}
      onClick={linkClickHandler(href, onNavigate)}
      style={[styles.card, styles.prev]}
    >
      <html.span style={styles.label}>
        <html.span aria-hidden>←</html.span> {label}
      </html.span>
      <html.span style={styles.title}>{title}</html.span>
    </html.a>
  )
}

function Next({href, title, label, onNavigate}: LinkProps) {
  usePageNav()
  return (
    <html.a
      href={href}
      onClick={linkClickHandler(href, onNavigate)}
      style={[styles.card, styles.next]}
    >
      <html.span style={styles.label}>
        {label} <html.span aria-hidden>→</html.span>
      </html.span>
      <html.span style={styles.title}>{title}</html.span>
    </html.a>
  )
}

export const PageNav = {
  Root,
  Prev,
  Next,
}
