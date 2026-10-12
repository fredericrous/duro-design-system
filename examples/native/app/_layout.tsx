import {Stack} from 'expo-router'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {ThemeProvider, ToastProvider, useResolvedColors} from '@duro-app/ui'

/**
 * Screens get the theme's canvas colour: a natively presented route (the
 * modal) is its own native view, outside the ThemeProvider's canvas.
 */
function ThemedStack() {
  const {bg} = useResolvedColors()
  return (
    <Stack screenOptions={{contentStyle: {backgroundColor: bg}}}>
      <Stack.Screen name="index" options={{title: 'Duro native'}} />
      <Stack.Screen name="modal" options={{presentation: 'modal', title: 'Modal route'}} />
      <Stack.Screen name="bench" options={{title: 'Icon benchmark'}} />
      <Stack.Screen name="shell" options={{headerShown: false}} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <ThemedStack />
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
