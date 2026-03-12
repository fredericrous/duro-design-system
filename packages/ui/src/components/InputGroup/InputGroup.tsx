import type {ReactNode} from 'react'
import {useMemo} from 'react'
import {html} from 'react-strict-dom'
import {InputGroupContext} from './InputGroupContext'
import {styles} from './styles.css'

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
interface AddonProps {
  position?: 'start' | 'end'
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
}

function Addon({position = 'end', onClick, disabled, children}: AddonProps) {
  const positionStyle = position === 'start' ? styles.addonStart : styles.addonEnd
  const style = [
    styles.addon,
    positionStyle,
    onClick && !disabled && styles.addonClickable,
    disabled && styles.addonDisabled,
  ]

  if (onClick) {
    return (
      <html.button type="button" onClick={onClick} disabled={disabled} style={style}>
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
