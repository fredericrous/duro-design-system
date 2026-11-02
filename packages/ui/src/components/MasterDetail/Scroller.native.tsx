import type {ReactNode} from 'react'
import {ScrollView, StyleSheet} from 'react-native'

/**
 * Native: a ScrollView bounded by the Root's cap. Split, the rail and the
 * detail each scroll; stacked, the Root scrolls them as one (as Happier's
 * stacked picker does), so only that one is `enabled`.
 */
export function Scroller({children, enabled}: {children: ReactNode; enabled: boolean}) {
  if (!enabled) return <>{children}</>
  return <ScrollView style={layout.scroll}>{children}</ScrollView>
}

const layout = StyleSheet.create({scroll: {flexGrow: 0, flexShrink: 1}})
