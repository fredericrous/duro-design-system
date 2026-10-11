import {createContext, type ReactNode, type RefObject, useContext} from 'react'
import {html} from 'react-strict-dom'
import type {DurationToken} from '@duro-app/tokens/keys'
import {partStyles} from './parts.css'

export type DialogSize = 'sm' | 'md' | 'lg'

export interface DialogContextValue {
  /** Rendered: open, or playing the exit animation. */
  open: boolean
  closing: boolean
  closeDuration: DurationToken
  dismissable: boolean
  requestOpen: () => void
  requestClose: () => void
  titleId: string
  descriptionId: string
  popupRef: RefObject<HTMLDivElement | null>
  /** Dialog.Close parts currently rendered (for the closeOnEscape dev warning). */
  registerClose: () => () => void
}

export const DialogContext = createContext<DialogContextValue | null>(null)

export function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('Dialog compound components must be used within Dialog.Root')
  return ctx
}

// The parts below are pure react-strict-dom, drawn the same on both platforms.

export function Header({children}: {children: ReactNode}) {
  return <html.div style={partStyles.header}>{children}</html.div>
}

export function Title({children}: {children: ReactNode}) {
  const {titleId} = useDialog()
  return (
    <html.h2 id={titleId} style={partStyles.title}>
      {children}
    </html.h2>
  )
}

export function Description({children}: {children: ReactNode}) {
  const {descriptionId} = useDialog()
  return (
    <html.p id={descriptionId} style={partStyles.description}>
      {children}
    </html.p>
  )
}

export function Body({children}: {children: ReactNode}) {
  return <html.div style={partStyles.body}>{children}</html.div>
}

export function Footer({children}: {children: ReactNode}) {
  return <html.div style={partStyles.footer}>{children}</html.div>
}
