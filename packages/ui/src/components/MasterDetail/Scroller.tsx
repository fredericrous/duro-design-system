import type {ReactNode} from 'react'

/** Web: the rail and the detail are themselves the scrolling elements (`overflow-y: auto`). */
export function Scroller({children}: {children: ReactNode}) {
  return <>{children}</>
}
