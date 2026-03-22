import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

// --- Root ---

interface RootProps {
  children: ReactNode
  /** Adds an outer border. Default: false */
  bordered?: boolean
}

function Root({children, bordered = false}: RootProps) {
  return <html.div style={[styles.root, bordered && styles.bordered]}>{children}</html.div>
}

// --- Header ---

function Header({children}: {children: ReactNode}) {
  return <html.div style={styles.header}>{children}</html.div>
}

// --- Body ---

interface BodyProps {
  children: ReactNode
  /** Adds inner padding. Default: true */
  padded?: boolean
}

function Body({children, padded = true}: BodyProps) {
  return <html.div style={[styles.body, padded && styles.bodyPadded]}>{children}</html.div>
}

// --- Footer ---

function Footer({children}: {children: ReactNode}) {
  return <html.div style={styles.footer}>{children}</html.div>
}

// --- Export ---

export const Panel = {
  Root,
  Header,
  Body,
  Footer,
}
