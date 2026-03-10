// Minimal react-native shim for react-native-svg web builds
import {createElement} from 'react'

export const Platform = {OS: 'web'} as const
export const StyleSheet = {create: (s: any) => s}
export const Image = {}
export const PixelRatio = {get: () => 1}
export const NativeModules = {}
export const processColor = (c: any) => c
export const findNodeHandle = () => null
export const Touchable = {Mixin: {}}
export const PanResponder = {create: () => ({panHandlers: {}})}
export const View = 'div'
export const TurboModuleRegistry = {get: () => null, getEnforcing: () => null}
export {createElement as unstable_createElement}
