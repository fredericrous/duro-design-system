import type {ReactNode} from 'react'
import {View} from 'react-native'
import {useReportTabLayout} from './indicator'

/** Native: reports the tab's box to its List, which places the sliding indicator. */
export function TabLayout({value, children}: {value: string; children: ReactNode}) {
  const report = useReportTabLayout()
  return <View onLayout={(e) => report?.(value, e.nativeEvent.layout)}>{children}</View>
}
