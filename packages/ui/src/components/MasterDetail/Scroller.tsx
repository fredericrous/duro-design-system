import type {ReactNode} from 'react'

/**
 * Web: the rail and the detail are themselves the scrolling elements
 * (`overflow-y: auto`), and below `sm` the Root is (styles.css.ts).
 */
export function Scroller({children}: {children: ReactNode; enabled: boolean}) {
  return <>{children}</>
}
