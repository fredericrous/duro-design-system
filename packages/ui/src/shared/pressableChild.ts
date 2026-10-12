import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import {mergeRefs} from './mergeRefs'

interface PressableChildProps {
  onClick?: () => void
  ref?: Ref<unknown>
}

/**
 * Native overlay triggers and closes: native presses do not bubble to a
 * wrapper as web clicks do, so the one child (a Button) gets the handler
 * itself, after its own. `ref` also receives the child's host, where focus
 * returns when the overlay closes.
 */
export function withPress(children: ReactNode, onPress: () => void, ref?: Ref<unknown>) {
  const child = Children.only(children)
  if (!isValidElement<PressableChildProps>(child)) return null
  const own = child.props.onClick
  return cloneElement(child as ReactElement<PressableChildProps>, {
    ...(ref ? {ref: mergeRefs(child.props.ref, ref)} : {}),
    onClick: () => {
      own?.()
      onPress()
    },
  })
}
