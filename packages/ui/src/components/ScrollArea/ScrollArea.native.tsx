import type {ComponentProps, ReactNode} from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {resolveLength, type Length} from '../../shared/length'

/**
 * Native ScrollArea (plan N0, Slice C): Viewport is an RN ScrollView with the
 * platform's own scroll indicator, so Scrollbar and Thumb draw nothing. The
 * cap (`maxHeight`, a size-token key) sits on the view around it, where
 * react-strict-dom resolves the token.
 */

function Root({children}: {children: ReactNode}) {
  return <html.div style={styles.root}>{children}</html.div>
}

interface ViewportProps {
  children: ReactNode
  maxHeight?: Length
  /** Extra styles for the viewport (e.g. a pointer-aware max height). */
  style?: ComponentProps<typeof html.div>['style']
  /** The web's roving-focus flag; native has no tab stops. */
  rovingOwner?: boolean
}

function Viewport({children, maxHeight, style}: ViewportProps) {
  return (
    <html.div
      style={[maxHeight != null && styles.viewportMaxHeight(resolveLength(maxHeight)), style]}
    >
      <ScrollView style={layout.scroll}>{children}</ScrollView>
    </html.div>
  )
}

function Content({children}: {children: ReactNode}) {
  return <html.div>{children}</html.div>
}

type ScrollbarOrientation = 'vertical' | 'horizontal'

/** The platform draws its own scroll indicator. */
function Scrollbar(_props: {orientation?: ScrollbarOrientation; children?: ReactNode}) {
  return null
}

function Thumb(_props: {orientation?: ScrollbarOrientation}) {
  return null
}

// The ScrollView shrinks to its capped parent instead of growing past it.
const layout = StyleSheet.create({scroll: {flexGrow: 0, flexShrink: 1}})

export const ScrollArea = {
  Root,
  Viewport,
  Content,
  Scrollbar,
  Thumb,
}
