import {useEffect, useState} from 'react'
import {Keyboard, Platform} from 'react-native'

/** The on-screen keyboard's height while it is shown, else 0. */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0)
  useEffect(() => {
    // iOS announces the keyboard before it moves, Android only after.
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const subs = [
      Keyboard.addListener(show, (e) => setHeight(e.endCoordinates.height)),
      Keyboard.addListener(hide, () => setHeight(0)),
    ]
    return () => subs.forEach((s) => s.remove())
  }, [])
  return height
}
