import type {Ref, RefCallback} from 'react'

/** One callback ref that sets every ref given (object or callback). */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(value)
      else if (ref) (ref as {current: T | null}).current = value
    }
  }
}
