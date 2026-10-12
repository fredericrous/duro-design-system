import type {ReactNode} from 'react'

/** Web: the tab itself; the List measures it in the DOM (TabLayout.native.tsx reports it). */
export function TabLayout({children}: {value: string; children: ReactNode}) {
  return children
}
