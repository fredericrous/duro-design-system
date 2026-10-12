import {useEffect, useState} from 'react'
import {AccessibilityInfo} from 'react-native'

/** Whether VoiceOver or TalkBack is on, following changes while mounted. */
export function useScreenReaderEnabled(): boolean {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    let live = true
    void AccessibilityInfo.isScreenReaderEnabled().then((on) => {
      if (live) setEnabled(on)
    })
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled)
    return () => {
      live = false
      sub.remove()
    }
  }, [])
  return enabled
}
