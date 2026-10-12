import type {ReactNode} from 'react'
import {TooltipHintContext} from './TooltipHint'

type Placement = 'top' | 'bottom' | 'left' | 'right'

interface RootProps {
  children: ReactNode
  /** On native, a string becomes the trigger's accessibility hint; anything else is dropped. */
  content: ReactNode
  /** Web only. */
  placement?: Placement
  /** Web only. */
  delay?: number
}

/**
 * Native Tooltip (plan N0, Decision 5): touch has no hover, so no bubble is
 * drawn. A string `content` becomes the accessibility hint of the Duro
 * trigger inside (Button, Toggle, Menu.Trigger, Popover.Trigger), read after
 * its name. Keep tooltip text non-essential: sighted touch users never see
 * it, and an icon-only trigger still needs its `aria-label`.
 */
function Root({children, content}: RootProps) {
  const hint = typeof content === 'string' ? content : undefined
  return <TooltipHintContext.Provider value={hint}>{children}</TooltipHintContext.Provider>
}

/** Renders its child in place; the hint reaches it through context. */
function Trigger({children}: {children: ReactNode}) {
  return children
}

export const Tooltip = {
  Root,
  Trigger,
}
