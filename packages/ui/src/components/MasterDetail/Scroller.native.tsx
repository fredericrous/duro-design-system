import type {ReactNode} from 'react'
import {ScrollView, StyleSheet} from 'react-native'

/** Native: a ScrollView inside the rail or the detail, which are bounded by the Root's cap. */
export function Scroller({children}: {children: ReactNode}) {
  return <ScrollView style={layout.scroll}>{children}</ScrollView>
}

const layout = StyleSheet.create({scroll: {flexGrow: 0, flexShrink: 1}})
