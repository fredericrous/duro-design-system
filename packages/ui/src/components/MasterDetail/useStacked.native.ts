import {useWindowDimensions} from 'react-native'
import {breakpointsPx} from '@duro-app/tokens/tokens/breakpoints.css'

/** Native: whether the window is narrower than `breakpoints.sm`. */
export function useStacked(): boolean {
  return useWindowDimensions().width < breakpointsPx.sm
}
