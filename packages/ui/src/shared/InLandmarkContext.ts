import {createContext} from 'react'

/**
 * True inside `AppShell.Rail`, which is already a named navigation landmark.
 * A `SideNav.Root` reads it and renders no second navigation landmark: a plain
 * block, or `role="group"` carrying its `aria-label` when it has one.
 */
export const InLandmarkContext = createContext(false)
