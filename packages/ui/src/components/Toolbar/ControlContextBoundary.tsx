import type {ReactNode} from 'react'
import {ButtonGroupContext} from '../ButtonGroup/ButtonGroupContext'
import {ToolbarContext} from './ToolbarContext'

/**
 * Popups and modals stop the ButtonGroup and Toolbar contexts. A portal keeps
 * its React parent, so without this the buttons in a Popover opened from a
 * toolbar would come out squared and with tabindex=-1.
 */
export function ControlContextBoundary({children}: {children: ReactNode}) {
  return (
    <ButtonGroupContext.Provider value={null}>
      <ToolbarContext.Provider value={null}>{children}</ToolbarContext.Provider>
    </ButtonGroupContext.Provider>
  )
}
