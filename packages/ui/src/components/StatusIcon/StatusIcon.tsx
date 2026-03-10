import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

export type StatusIconName = 'x-circle' | 'check-circle' | 'check-done' | 'clock' | 'forbidden'
export type StatusIconVariant = 'error' | 'success' | 'warning' | 'muted'

const icons: Record<StatusIconName, ReactNode> = {
  'x-circle': (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </>
  ),
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 10 11 15 8 12" />
    </>
  ),
  'check-done': (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  forbidden: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </>
  ),
}

interface StatusIconProps {
  name: StatusIconName
  size?: number
  variant?: StatusIconVariant
}

export function StatusIcon({name, size = 48, variant = 'muted'}: StatusIconProps) {
  return (
    <html.div style={[styles.root, styles[variant]]}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        width={size}
        height={size}
      >
        {icons[name]}
      </svg>
    </html.div>
  )
}
