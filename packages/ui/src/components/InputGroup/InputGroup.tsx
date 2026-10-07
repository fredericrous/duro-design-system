import type {ReactNode} from 'react'
import {useMemo} from 'react'
import {css, html} from 'react-strict-dom'
import {isNative} from '../../platform'
import {InputGroupContext} from './InputGroupContext'
import {styles} from './styles.css'
import {resolveLength, type Length} from '../../shared/length'

// --- Root ---
interface RootProps {
  children: ReactNode
}

function Root({children}: RootProps) {
  const ctx = useMemo(() => ({inGroup: true}), [])

  return (
    <InputGroupContext.Provider value={ctx}>
      <html.div style={styles.wrapper}>{children}</html.div>
    </InputGroupContext.Provider>
  )
}

// --- Addon ---
const dynamicStyles = css.create({
  minWidth: (value: number | string) => ({minWidth: value}),
})

interface AddonProps {
  position?: 'start' | 'end'
  onClick?: () => void
  disabled?: boolean
  /** Optional minimum width to prevent layout shift (e.g. Copy → Copied!): a
   *  size token key or a relative length. */
  minWidth?: Length
  /**
   * Accessible name of a clickable addon (it renders a button). Required when
   * its content is an icon (copy, reveal): without it the button has no name.
   */
  'aria-label'?: string
  children: ReactNode
}

function Addon({
  position = 'end',
  onClick,
  disabled,
  minWidth,
  'aria-label': ariaLabel,
  children,
}: AddonProps) {
  const positionStyle = position === 'start' ? styles.addonStart : styles.addonEnd
  const style = [
    styles.addon,
    isNative && styles.nativeFlex,
    positionStyle,
    onClick && !disabled && styles.addonClickable,
    disabled && styles.addonDisabled,
    minWidth != null && dynamicStyles.minWidth(resolveLength(minWidth)),
  ]

  if (onClick) {
    return (
      <html.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        style={style}
      >
        {children}
      </html.button>
    )
  }

  return <html.span style={style}>{children}</html.span>
}

export const InputGroup = {
  Root,
  Addon,
}
