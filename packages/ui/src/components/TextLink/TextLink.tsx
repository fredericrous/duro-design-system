import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

export type TextLinkVariant = 'default' | 'subtle'

interface TextLinkProps {
  href: string
  /** `_blank` opens a new tab; `rel` then defaults to `noopener noreferrer`. */
  target?: '_blank' | '_self'
  rel?: string
  /**
   * `default`: accent text with an accent underline. `subtle`: the
   * surrounding text colour with a muted underline, accent on hover. Both
   * stay underlined, so colour is never the only cue in running text.
   */
  variant?: TextLinkVariant
  /** Accessible name, when the visible text alone does not say where it goes. */
  'aria-label'?: string
  children: ReactNode
}

/**
 * An inline hyperlink in running text or a standalone "View all" link. For a
 * link that looks like a button, use LinkButton.
 */
export function TextLink({
  href,
  target,
  rel,
  variant = 'default',
  'aria-label': ariaLabel,
  children,
}: TextLinkProps) {
  return (
    <html.a
      href={href}
      target={target}
      rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
      aria-label={ariaLabel}
      style={[styles.base, styles[variant]]}
    >
      {children}
    </html.a>
  )
}
