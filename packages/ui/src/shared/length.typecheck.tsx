// Compile-only fixtures for measure props (ADR-0027, plan 2c′). `pnpm typecheck`
// fails if a raw px becomes assignable to a measure prop, or if a token key or
// a relative length stops being. Never imported at runtime.

import type {Grid} from '../components/Grid/Grid'
import type {InputGroup} from '../components/InputGroup/InputGroup'
import type {ScrollArea} from '../components/ScrollArea/ScrollArea'
import type {Table} from '../components/Table/Table'
import type {VirtualTable} from '../components/VirtualTable/VirtualTable'
import type {GridTrack, Length} from './length'

/** `true` when every member of T is assignable to U. */
type Assignable<T, U> = [T] extends [U] ? true : false

/** The props a function component takes. */
type PropsOf<C> = C extends (props: infer P) => unknown ? P : never
type Prop<C, K extends keyof PropsOf<C>> = NonNullable<PropsOf<C>[K]>

// Accepted: token keys, zero, relative lengths, keywords.
export const lengthTokens: Assignable<'gridColMd' | 'touchTarget', Length> = true
export const lengthRelative: Assignable<0 | '0' | '100%' | '70vh' | '2rem' | 'auto', Length> = true
export const trackForms: Assignable<
  'iconButton' | '2fr' | 'max-content' | 'minmax(0, 2fr)',
  GridTrack
> = true

// Refused: px as a string or a number.
export const lengthPxString: Assignable<'280px', Length> = false
export const lengthPxNumber: Assignable<44, Length> = false
export const trackPx: Assignable<'40px', GridTrack> = false

// The props themselves.
export const gridMin: Assignable<'280px', Prop<typeof Grid, 'minColumnWidth'>> = false
export const gridMinToken: Assignable<'gridColMd', Prop<typeof Grid, 'minColumnWidth'>> = true
export const addonMin: Assignable<80, Prop<typeof InputGroup.Addon, 'minWidth'>> = false
export const viewportMax: Assignable<300, Prop<typeof ScrollArea.Viewport, 'maxHeight'>> = false
export const viewportMaxToken: Assignable<
  'listMaxH',
  Prop<typeof ScrollArea.Viewport, 'maxHeight'>
> = true
export const tableMin: Assignable<120, Prop<typeof Table.Root, 'minColumnWidth'>> = false
export const headerWidth: Assignable<'40px', Prop<typeof Table.HeaderCell, 'width'>> = false
export const headerWidthToken: Assignable<
  'iconButton',
  Prop<typeof Table.HeaderCell, 'width'>
> = true
export const virtualMax: Assignable<300, Prop<typeof VirtualTable, 'maxHeight'>> = false
