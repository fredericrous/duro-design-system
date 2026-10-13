import {useColorScheme} from 'react-native'

/** The OS colour scheme, live, from RN Appearance; no answer reads as dark. */
export function useSystemScheme(): 'light' | 'dark' {
  return useColorScheme() === 'light' ? 'light' : 'dark'
}
