import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {SIZE_KEYS, type SizeToken} from '@duro-app/tokens/keys'

/**
 * A length a measure prop accepts without a token: zero, a relative unit or a
 * keyword. These are the exemptions of design-system.every-measure-is-a-token
 * (ADR-0027); a px value is not one of them.
 */
export type RelativeLength =
  | 0
  | '0'
  | 'auto'
  | 'none'
  | 'min-content'
  | 'max-content'
  | 'fit-content'
  | `${number}%`
  | `${number}vh`
  | `${number}vw`
  | `${number}dvh`
  | `${number}svh`
  | `${number}lvh`
  | `${number}em`
  | `${number}rem`
  | `${number}ch`

/** A measure prop: a `sizes` token key (`"gridColMd"`) or a relative length. */
export type Length = SizeToken | RelativeLength

/** A Length written as a string, as it appears inside a track function. */
type LengthString = Exclude<Length, number>

/** One argument of `minmax()`: a Length or a fraction. */
type TrackBreadth = LengthString | `${number}fr`

/**
 * A CSS grid track: a Length, a fraction, or a track function whose
 * arguments are themselves Lengths or fractions — `'minmax(gridColSm, 1fr)'`,
 * `'minmax(0, 2fr)'`, `'fit-content(labelMinW)'`. A px inside is a type
 * error, as it is anywhere else. Arguments are separated by `, `.
 */
export type GridTrack =
  | Length
  | `${number}fr`
  | `minmax(${TrackBreadth}, ${TrackBreadth})`
  | `fit-content(${LengthString})`

const sizeKeys: ReadonlySet<string> = new Set(SIZE_KEYS)

/** The CSS value for a Length: a size token key becomes its variable. */
export function resolveLength(value: Length): string | number {
  return typeof value === 'string' && sizeKeys.has(value) ? sizes[value as SizeToken] : value
}

/**
 * The CSS value for a GridTrack: a size token key becomes its variable, also
 * as an argument of `minmax()` / `fit-content()`.
 */
export function resolveTrack(track: GridTrack): string | number {
  // Read as a plain value: narrowing the template-literal union is more than
  // the checker will represent (TS2590), and the callers only need the CSS.
  const value: string | number = track
  if (typeof value !== 'string') return value
  const fn = /^(minmax|fit-content)\((.*)\)$/.exec(value)
  if (fn) {
    const args = fn[2]!.split(',').map((arg) => String(resolveLength(arg.trim() as Length)))
    return `${fn[1]}(${args.join(', ')})`
  }
  return sizeKeys.has(value) ? sizes[value as SizeToken] : value
}
