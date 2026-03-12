import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {typePresets} from '@duro-app/tokens/tokens/type-presets.css'
import {styles} from './styles.css'

export type TextVariant = 'bodySm' | 'bodyMd' | 'bodyLg' | 'caption' | 'label' | 'code' | 'overline'
export type TextColor = 'default' | 'muted' | 'accent' | 'error' | 'success' | 'warning'

interface TextProps {
  variant?: TextVariant
  color?: TextColor
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'start' | 'center' | 'end'
  truncate?: boolean
  as?: 'span' | 'p' | 'div'
  children: ReactNode
}

const weightMap = {
  normal: styles.weightNormal,
  medium: styles.weightMedium,
  semibold: styles.weightSemibold,
  bold: styles.weightBold,
} as const

const alignMap = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
} as const

export function Text({
  variant = 'bodyMd',
  color = 'default',
  weight,
  align,
  truncate,
  as = 'span',
  children,
}: TextProps) {
  const style = [
    typePresets[variant],
    styles[color],
    weight && weightMap[weight],
    align && alignMap[align],
    truncate && styles.truncate,
  ]

  if (as === 'p') return <html.p style={style}>{children}</html.p>
  if (as === 'div') return <html.div style={style}>{children}</html.div>
  return <html.span style={style}>{children}</html.span>
}
