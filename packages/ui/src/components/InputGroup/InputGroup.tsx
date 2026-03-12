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
  children: ReactNode
}

function Addon({position = 'end', onClick, children}: AddonProps) {
  const positionStyle = position === 'start' ? styles.addonStart : styles.addonEnd
  const style = [styles.addon, positionStyle, onClick && styles.addonClickable]

  if (onClick) {
    return (
      <html.button type="button" onClick={onClick} style={style}>
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
