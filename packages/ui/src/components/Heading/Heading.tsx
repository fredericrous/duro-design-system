import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {typePresets} from '@duro-app/tokens/tokens/type-presets.css'
import {styles} from './styles.css'

/** The heading's look; its size is the `size` prop. */
export type HeadingFamily = 'heading' | 'display' | 'overline'
export type HeadingSize = 'sm' | 'md' | 'lg' | 'xl'

/** @deprecated Use `variant` with `size`: `headingSm` is `variant="heading" size="sm"`. */
export type HeadingLegacyVariant =
  | 'displayLg'
  | 'displayMd'
  | 'displaySm'
  | 'headingXl'
  | 'headingLg'
  | 'headingMd'
  | 'headingSm'

export type HeadingVariant = HeadingFamily | HeadingLegacyVariant

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  /** The look: `heading` (default), `display` (fluid hero titles), `overline` (small uppercase group titles). */
  variant?: HeadingVariant
  /** The size within the look. Default: the level's size for `heading`, `md` for `display`, `sm` for `overline`; `display` and `overline` stop at `lg`. */
  size?: HeadingSize
  color?: 'default' | 'muted' | 'accent'
  align?: 'start' | 'center' | 'end'
  /** The heading's id: an in-page link's target (`href="#id"`), an `aria-labelledby` reference. */
  id?: string
  children: ReactNode
}

type Preset = keyof typeof typePresets

const levelSize: Record<HeadingProps['level'], HeadingSize> = {
  1: 'xl',
  2: 'lg',
  3: 'md',
  4: 'sm',
  5: 'sm',
  6: 'sm',
}

const presets = {
  heading: {sm: 'headingSm', md: 'headingMd', lg: 'headingLg', xl: 'headingXl'},
  display: {sm: 'displaySm', md: 'displayMd', lg: 'displayLg'},
  overline: {sm: 'overline', md: 'overlineMd', lg: 'overlineLg'},
} as const satisfies Record<HeadingFamily, Partial<Record<HeadingSize, Preset>>>

function presetOf(
  level: HeadingProps['level'],
  variant: HeadingVariant = 'heading',
  size?: HeadingSize,
): Preset {
  if (variant === 'heading') return presets.heading[size ?? levelSize[level]]
  if (variant === 'display') return presets.display[size === 'xl' ? 'lg' : (size ?? 'md')]
  if (variant === 'overline') return presets.overline[size === 'xl' ? 'lg' : (size ?? 'sm')]
  return variant
}

const alignMap = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
} as const

export function Heading({
  level,
  variant,
  size,
  color = 'default',
  align,
  id,
  children,
}: HeadingProps) {
  const style = [
    typePresets[presetOf(level, variant, size)],
    styles[color],
    align && alignMap[align],
  ]

  if (level === 1)
    return (
      <html.h1 id={id} style={style}>
        {children}
      </html.h1>
    )
  if (level === 2)
    return (
      <html.h2 id={id} style={style}>
        {children}
      </html.h2>
    )
  if (level === 3)
    return (
      <html.h3 id={id} style={style}>
        {children}
      </html.h3>
    )
  if (level === 4)
    return (
      <html.h4 id={id} style={style}>
        {children}
      </html.h4>
    )
  if (level === 5)
    return (
      <html.h5 id={id} style={style}>
        {children}
      </html.h5>
    )
  return (
    <html.h6 id={id} style={style}>
      {children}
    </html.h6>
  )
}
