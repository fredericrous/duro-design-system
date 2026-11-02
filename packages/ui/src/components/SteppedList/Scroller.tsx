import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {resolveLength, type Length} from '../../shared/length'
import {styles} from './styles.css'

interface ScrollerProps {
  children: ReactNode
  maxHeight: Length
}

/** A step's rows: as tall as they are, up to `maxHeight`, then scrolling. */
export function Scroller({children, maxHeight}: ScrollerProps) {
  return (
    <html.div
      data-duro-stepped-rows=""
      style={[styles.rows, styles.rowsMaxHeight(resolveLength(maxHeight))]}
    >
      {children}
    </html.div>
  )
}
