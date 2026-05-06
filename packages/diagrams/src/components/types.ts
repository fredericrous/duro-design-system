export type Ramp =
  | 'purple'
  | 'teal'
  | 'coral'
  | 'pink'
  | 'gray'
  | 'blue'
  | 'green'
  | 'amber'
  | 'red'

export const RAMPS: readonly Ramp[] = [
  'purple',
  'teal',
  'coral',
  'pink',
  'gray',
  'blue',
  'green',
  'amber',
  'red',
] as const

export type Point = readonly [number, number]
