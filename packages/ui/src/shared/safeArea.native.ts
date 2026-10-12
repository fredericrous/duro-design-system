import {useContext} from 'react'
import {SafeAreaInsetsContext, type EdgeInsets} from 'react-native-safe-area-context'
import {devWarnOnce} from './devWarnOnce'

const NO_INSETS: EdgeInsets = {top: 0, right: 0, bottom: 0, left: 0}

/**
 * The window's safe-area insets from the app's SafeAreaProvider (expo-router
 * mounts one). Modal content is a React portal, so overlays inside an
 * OverlayModal read the same insets. Without a provider, no insets, and a
 * development warning names the missing provider.
 */
export function useSafeAreaInsets(): EdgeInsets {
  const insets = useContext(SafeAreaInsetsContext)
  if (insets) return insets
  devWarnOnce(
    'safeArea',
    'no-provider',
    'No SafeAreaProvider above this Duro overlay: it draws without safe-area insets. Wrap the app in react-native-safe-area-context’s SafeAreaProvider.',
  )
  return NO_INSETS
}
