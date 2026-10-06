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

/**
 * A CSS grid track: a Length, a fraction, or a track function. The arguments
 * of `minmax()` / `fit-content()` are not checked by the type — pass tokens
 * through `resolveLength` or `sizes.*` when building one.
 *
 * holds-until: a structured track type (`{min: Length, max: GridTrack}`)
 * replaces the template-literal functions; a type cannot see inside
 * `minmax(${string})`, so a px there is the one measure lint and types miss.
 */
export type GridTrack = Length | `${number}fr` | `minmax(${string})` | `fit-content(${string})`

const sizeKeys: ReadonlySet<string> = new Set(SIZE_KEYS)

/** The CSS value for a Length: a size token key becomes its variable. */
export function resolveLength(value: Length): string | number {
  return typeof value === 'string' && sizeKeys.has(value) ? sizes[value as SizeToken] : value
}

/** The CSS value for a GridTrack: a size token key becomes its variable. */
export function resolveTrack(track: GridTrack): string | number {
  return typeof track === 'string' && sizeKeys.has(track) ? sizes[track as SizeToken] : track
}
