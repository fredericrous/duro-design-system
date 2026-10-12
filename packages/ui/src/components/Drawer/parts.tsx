import {
  Children,
  createContext,
  isValidElement,
  type ReactNode,
  type RefObject,
  useContext,
} from 'react'
import {html} from 'react-strict-dom'
import type {DurationToken} from '@duro-app/tokens/keys'
import {partStyles} from './parts.css'
import type {SnapPoint} from './sheetPhysics'

export type DrawerAnchor = 'right' | 'left' | 'bottom'
export type DrawerSize = 'sm' | 'md' | 'lg'
export type {SnapPoint}

export interface DrawerContextValue {
  /** Rendered: open, or playing the exit animation. */
  open: boolean
  closing: boolean
  closeDuration: DurationToken
  anchor: DrawerAnchor
  dismissable: boolean
  swipeDismiss: boolean
  requestOpen: () => void
  requestClose: () => void
  /** Close immediately without the exit animation (a swipe has played its own) */
  requestCloseImmediate: () => void
  titleId: string
  descriptionId: string
  /** The panel's host: a DOM element on the web, a view on native */
  panelRef: RefObject<unknown>
  /** A bottom sheet's detents, ascending; empty when the drawer has none */
  snapPoints: readonly SnapPoint[]
  /** Index into snapPoints the sheet rests at */
  snapIndex: number
  setSnapIndex: (index: number) => void
}

export const DrawerContext = createContext<DrawerContextValue | null>(null)

export function useDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('Drawer compound components must be used within Drawer.Root')
  return ctx
}

export interface GrabberLabels {
  /** The grabber's name when a press grows the sheet */
  expand: string
  /** The grabber's name when a press shrinks it */
  collapse: string
}

export const DEFAULT_GRABBER_LABELS: GrabberLabels = {
  expand: 'Expand sheet',
  collapse: 'Shrink sheet',
}

// The parts below are pure react-strict-dom, drawn the same on both platforms.

interface HeaderProps {
  children: ReactNode
  /**
   * 'center' puts the Title in the middle and the other children at the end,
   * as a phone sheet does (a text close button on the right). Default: 'start'
   */
  titleAlign?: 'start' | 'center'
}

export function Header({children, titleAlign = 'start'}: HeaderProps) {
  const underGrabber = useDrawer().snapPoints.length > 0 && partStyles.headerUnderGrabber
  if (titleAlign === 'start') {
    return <html.div style={[partStyles.header, underGrabber]}>{children}</html.div>
  }
  const items = Children.toArray(children)
  const isTitle = (c: ReactNode) => isValidElement(c) && c.type === Title
  return (
    <html.div style={[partStyles.header, underGrabber, partStyles.headerCentered]}>
      <html.div style={partStyles.headerSide} />
      {items.filter(isTitle)}
      <html.div style={[partStyles.headerSide, partStyles.headerEnd]}>
        {items.filter((c) => !isTitle(c))}
      </html.div>
    </html.div>
  )
}

export function Title({children}: {children: ReactNode}) {
  const {titleId} = useDrawer()
  return (
    <html.h2 id={titleId} style={partStyles.title}>
      {children}
    </html.h2>
  )
}

export function Description({children}: {children: ReactNode}) {
  const {descriptionId} = useDrawer()
  return (
    <html.p id={descriptionId} style={partStyles.description}>
      {children}
    </html.p>
  )
}

export function Footer({children}: {children: ReactNode}) {
  return <html.div style={partStyles.footer}>{children}</html.div>
}
