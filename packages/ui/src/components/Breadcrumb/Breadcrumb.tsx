import {Children, createContext, Fragment, isValidElement, type ReactNode, useContext} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {linkClickHandler, type OnNavigate} from '../../shared/navigate'

/* Breadcrumb — where the current page sits in the site's hierarchy: a
 * labelled `nav` holding an ordered list of links, the last one the current
 * page (`aria-current="page"`, shown as text). The separators between items
 * are decorative (`aria-hidden`), so a screen reader hears the list alone. */

// Items render list items: outside Root's list they would be invalid markup.
const BreadcrumbContext = createContext(false)

function useBreadcrumb() {
  if (!useContext(BreadcrumbContext))
    throw new Error('Breadcrumb compound components must be used within Breadcrumb.Root')
}

// --- Root ---

interface RootProps {
  /** Names the landmark ("Breadcrumb"); required, from your text catalog. */
  'aria-label': string
  /** `Breadcrumb.Item`s, outermost first. */
  children: ReactNode
}

function Root({'aria-label': ariaLabel, children}: RootProps) {
  const items = Children.toArray(children).filter(isValidElement)
  return (
    <BreadcrumbContext.Provider value={true}>
      <html.nav aria-label={ariaLabel} style={styles.root}>
        <html.ol style={styles.list}>
          {items.map((item, i) => (
            <Fragment key={item.key ?? i}>
              {i > 0 ? (
                <html.li aria-hidden style={styles.separator}>
                  ›
                </html.li>
              ) : null}
              {item}
            </Fragment>
          ))}
        </html.ol>
      </html.nav>
    </BreadcrumbContext.Provider>
  )
}

// --- Item ---

/**
 * A link to an ancestor page, or the current page. The two are exclusive: the
 * current page has no `href` (it is text) and a link is never `current`.
 */
type ItemProps = {children: ReactNode} & (
  | {
      /** Where the item links to. */
      href: string
      /**
       * Client-side navigation: called for a plain primary click (no modifier
       * key). Call `event.preventDefault()`, then your router's navigate.
       */
      onNavigate?: OnNavigate
      current?: never
    }
  | {
      /** The page the user is on: rendered as text with `aria-current="page"`. */
      current: true
      href?: never
      onNavigate?: never
    }
)

function Item({href, current, onNavigate, children}: ItemProps) {
  useBreadcrumb()
  return (
    <html.li style={styles.item}>
      {current ? (
        <html.span aria-current="page" style={styles.current}>
          {children}
        </html.span>
      ) : (
        <html.a href={href} onClick={linkClickHandler(href, onNavigate)} style={styles.link}>
          {children}
        </html.a>
      )}
    </html.li>
  )
}

export const Breadcrumb = {
  Root,
  Item,
}
