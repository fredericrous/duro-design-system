import {type RefObject, useId, useLayoutEffect, useRef} from 'react'
import type {html} from 'react-strict-dom'
import {isNative} from '../../platform'
import {useToolbar} from '../Toolbar/ToolbarContext'
import {useButtonGroup, type GroupPosition} from './ButtonGroupContext'
import {attached} from './attached.css'

const positionStyles = {
  horizontal: {
    first: attached.horizontalFirst,
    middle: attached.horizontalMiddle,
    last: attached.horizontalLast,
    only: null,
  },
  vertical: {
    first: attached.verticalFirst,
    middle: attached.verticalMiddle,
    last: attached.verticalLast,
    only: null,
  },
} as const

type ButtonStyle = Parameters<typeof html.button>[0]['style']

export interface GroupedControl<T extends HTMLElement> {
  ref: RefObject<T | null>
  /** In an attached ButtonGroup. */
  attached: boolean
  position: GroupPosition | null
  /** The joined style for its position; spread after the control's own. */
  style: ButtonStyle | null
  /** The Toolbar's roving tabindex, when in one. */
  tabIndex: 0 | -1 | undefined
  onFocus: (() => void) | undefined
}

/**
 * What a control (Button, Toggle, the Select, Menu and Popover triggers) takes
 * from an attached ButtonGroup and a Toolbar around it: its joined style by
 * position, and its roving tabindex. Outside both, every field is inert.
 */
export function useGroupedControl<T extends HTMLElement>({
  disabled = false,
}: {disabled?: boolean} = {}): GroupedControl<T> {
  const id = useId()
  const ref = useRef<T | null>(null)
  const group = useButtonGroup()
  const toolbar = useToolbar()

  const groupRegister = group?.register
  const toolbarRegister = toolbar?.register
  useLayoutEffect(() => {
    const el = ref.current
    if (isNative || !el) return
    const unregisterGroup = groupRegister?.(id, el, disabled)
    const unregisterToolbar = toolbarRegister?.(id, el, disabled)
    return () => {
      unregisterGroup?.()
      unregisterToolbar?.()
    }
  }, [id, disabled, groupRegister, toolbarRegister])

  const position: GroupPosition | null = group ? group.positionOf(id) : null
  const style: ButtonStyle | null =
    group && position ? [attached.item, positionStyles[group.orientation][position]] : null

  return {
    ref,
    attached: group !== null,
    position,
    style,
    tabIndex: toolbar?.tabIndexOf(id),
    onFocus: toolbar ? () => toolbar.onItemFocus(id) : undefined,
  }
}
