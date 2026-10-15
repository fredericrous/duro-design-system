import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {nativeStyles} from './native.css'
// Explicit suffix: a native-only module has no web file for moduleSuffixes to pair.
import {followLink} from '../../shared/followLink.native'
import type {OnNavigate} from '../../shared/navigate'

export type TextLinkVariant = 'default' | 'subtle'

interface TextLinkProps {
  href: string
  /** `_blank` hands the URL to the system; `onNavigate` is then not called. */
  target?: '_blank' | '_self'
  /** Ignored on native: there is no `rel`. */
  rel?: string
  variant?: TextLinkVariant
  /** Accessible name, when the visible text alone does not say where it goes. */
  'aria-label'?: string
  /**
   * Client-side navigation: called for a press on a link with no `target`.
   * Call `event.preventDefault()`, then your router's navigate. Required for
   * an in-app route on native: without it, the URL opens with the system.
   */
  onNavigate?: OnNavigate
  children: ReactNode
}

/**
 * Native TextLink (ADR-0002): an inline `Text` with `role="link"` that renders
 * NO `href`, and follows the link through `followLink` on press.
 *
 * holds-until: a react-strict-dom release forwards the press of an `html.a`
 * that has an `href` (react/react-strict-dom#58). Until then RSD 0.0.55
 * replaces that `onPress` with a dev-only "href handling is not implemented"
 * stub (dist/native/index.js:3094-3100), so `href` stays off the element and
 * scripts/check-native-graph.mjs refuses it. Then: pass `href`, drop the rule.
 */
export function TextLink({
  href,
  target,
  variant = 'default',
  'aria-label': ariaLabel,
  onNavigate,
  children,
}: TextLinkProps) {
  return (
    <html.a
      aria-label={ariaLabel}
      onClick={() => followLink(href, target ? undefined : onNavigate, 'TextLink')}
      style={[nativeStyles.base, nativeStyles[variant]]}
    >
      {children}
    </html.a>
  )
}
