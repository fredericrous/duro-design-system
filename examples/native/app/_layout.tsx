import {Stack} from 'expo-router'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {ThemeProvider} from '@duro-app/ui'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack>
            <Stack.Screen name="index" options={{title: 'Duro native'}} />
            <Stack.Screen name="modal" options={{presentation: 'modal', title: 'Modal route'}} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
