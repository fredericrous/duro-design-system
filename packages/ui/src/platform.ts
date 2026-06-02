/**
 * Platform flag resolved by the bundler's platform extensions: web bundlers
 * (Vite/Rollup) read THIS file (`isNative = false`); Metro reads
 * `platform.native.ts` (`isNative = true`) on React Native / Expo.
 *
 * It lets shared components layer a native-only style override without
 * importing `react-native` on web (the DS web build has no react-native).
 * Typed `boolean` (not the `false` literal) so `isNative && styles.x` stays a
 * `false | Style` union in style arrays rather than narrowing to `false`.
 */
export const isNative: boolean = false
