import {createContext, useContext} from 'react'

/**
 * Native: a Tooltip's string content, read by the Duro trigger inside it
 * (Button, Toggle, Menu.Trigger, Popover.Trigger) and set as that trigger's
 * own accessibility hint (plan N0, Decision 5). Touch has no hover, so the
 * text is never drawn; screen readers read it after the trigger's name.
 */
export const TooltipHintContext = createContext<string | undefined>(undefined)

export function useTooltipHint(): string | undefined {
  return useContext(TooltipHintContext)
}
