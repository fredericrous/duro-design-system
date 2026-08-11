import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import type {SpacingToken} from '@duro-app/tokens/keys'
import {styles} from './styles.css'

export type ButtonGroupGap = Extract<SpacingToken, 'xs' | 'sm' | 'md'>

export interface ButtonGroupProps {
  children: ReactNode
  /** Layout direction. Default: 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** Alignment within container. Default: 'start' */
  align?: 'start' | 'end' | 'center'
  /** Disable all buttons in group */
  disabled?: boolean
  /** Gap between buttons. Default: 'sm' */
  gap?: ButtonGroupGap
}

const gapMap = {
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: styles.gapMd,
} as const satisfies Record<ButtonGroupGap, unknown>

const horizontalAlignMap = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
} as const

const verticalAlignMap = {
  start: styles.verticalAlignStart,
  center: styles.verticalAlignCenter,
  end: styles.verticalAlignEnd,
} as const

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  align = 'start',
  disabled = false,
  gap = 'sm',
}: ButtonGroupProps) {
  const isVertical = orientation === 'vertical'
  const alignStyle = isVertical ? verticalAlignMap[align] : horizontalAlignMap[align]

  return (
    <html.div
      role="group"
      style={[
        styles.base,
        isVertical ? styles.vertical : styles.horizontal,
        gapMap[gap],
        alignStyle,
        disabled && styles.disabled,
      ]}
    >
      {children}
    </html.div>
  )
}
