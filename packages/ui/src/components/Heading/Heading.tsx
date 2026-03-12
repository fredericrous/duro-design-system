import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {typePresets} from '@duro-app/tokens/tokens/type-presets.css'
import {styles} from './styles.css'

export type HeadingVariant =
  | 'displayLg' | 'displayMd' | 'displaySm'
  | 'headingXl' | 'headingLg' | 'headingMd' | 'headingSm'

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  variant?: HeadingVariant
  color?: 'default' | 'muted' | 'accent'
  align?: 'start' | 'center' | 'end'
  children: ReactNode
}

const defaultVariantMap: Record<number, HeadingVariant> = {
  1: 'headingXl',
  2: 'headingLg',
  3: 'headingMd',
  4: 'headingSm',
  5: 'headingSm',
  6: 'headingSm',
}

const alignMap = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
} as const

export function Heading({
  level,
  variant,
  color = 'default',
  align,
  children,
}: HeadingProps) {
  const resolvedVariant = variant ?? defaultVariantMap[level]
  const style = [
    typePresets[resolvedVariant],
    styles[color],
    align && alignMap[align],
  ]

  if (level === 1) return <html.h1 style={style}>{children}</html.h1>
  if (level === 2) return <html.h2 style={style}>{children}</html.h2>
  if (level === 3) return <html.h3 style={style}>{children}</html.h3>
  if (level === 4) return <html.h4 style={style}>{children}</html.h4>
  if (level === 5) return <html.h5 style={style}>{children}</html.h5>
  return <html.h6 style={style}>{children}</html.h6>
}
