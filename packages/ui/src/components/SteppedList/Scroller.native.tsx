import type {ReactNode} from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {html} from 'react-strict-dom'
import {resolveLength, type Length} from '../../shared/length'
import {styles} from './styles.css'

interface ScrollerProps {
  children: ReactNode
  maxHeight: Length
}

/** A step's rows in a ScrollView; the cap sits on the view around it, where the token resolves. */
export function Scroller({children, maxHeight}: ScrollerProps) {
  return (
    <html.div style={styles.rowsMaxHeight(resolveLength(maxHeight))}>
      <ScrollView style={layout.scroll}>{children}</ScrollView>
    </html.div>
  )
}

const layout = StyleSheet.create({scroll: {flexGrow: 0, flexShrink: 1}})
