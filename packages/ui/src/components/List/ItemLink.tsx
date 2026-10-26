import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {linkClickHandler, type OnNavigate} from '../../shared/navigate'
import {styles} from './styles.css'

interface ItemLinkProps {
  href: string
  onNavigate: OnNavigate | undefined
  children: ReactNode
}

/** The Content of a List.Item with an href: a real `<a href>` (ADR-0002). */
export function ItemLink({href, onNavigate, children}: ItemLinkProps) {
  return (
    <html.a
      href={href}
      onClick={linkClickHandler(href, onNavigate)}
      style={[styles.content, styles.contentLink]}
    >
      {children}
    </html.a>
  )
}
