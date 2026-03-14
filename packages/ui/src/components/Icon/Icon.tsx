import type {ReactNode} from 'react'

export type IconName =
  | 'x-circle'
  | 'check-circle'
  | 'check-done'
  | 'clock'
  | 'forbidden'
  | 'info-circle'
  | 'alert-triangle'
  | 'shield'
  | 'lock'
  | 'key'
  // Filled variants (solid shape with cutout symbol)
  | 'info-circle-filled'
  | 'alert-triangle-filled'
  | 'check-circle-filled'
  | 'x-circle-filled'
  | 'shield-filled'
  | 'lock-filled'

/** Stroke-based icons (Feather/Lucide style) */
const strokeIcons: Partial<Record<IconName, ReactNode>> = {
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
  'info-circle': (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  'alert-triangle': (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  key: (
    <>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </>
  ),
}

/**
 * Filled icons — solid shape with evenodd cutout for the inner symbol.
 * The cutout reveals the background color, so they work on any theme.
 * Uses fill="currentColor" only, no stroke.
 */
const filledIcons: Partial<Record<IconName, ReactNode>> = {
  // Filled circle with "i" cutout (dot + line)
  'info-circle-filled': (
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-.75 6a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0zM11 11a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0v-5z"
    />
  ),
  // Filled triangle with "!" cutout
  'alert-triangle-filled': (
    <path
      fillRule="evenodd"
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM11 10a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0v-3zm.25 6a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0z"
    />
  ),
  // Filled circle with checkmark cutout
  'check-circle-filled': (
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 8.707a1 1 0 0 0-1.414-1.414L11 13.586l-2.293-2.293a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l5-5z"
    />
  ),
  // Filled circle with X cutout
  'x-circle-filled': (
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM9.707 8.293a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293z"
    />
  ),
  // Filled shield with checkmark cutout
  'shield-filled': (
    <path
      fillRule="evenodd"
      d="M12 1L3 5v7c0 6.5 8.5 10.5 9 10.73.5-.23 9-4.23 9-10.73V5l-9-4zm3.707 8.707a1 1 0 0 0-1.414-1.414L11 11.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
    />
  ),
  // Filled lock body with stroke shackle
  'lock-filled': (
    <>
      <path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    </>
  ),
}

interface IconProps {
  name: IconName
  size?: number
}

export function Icon({name, size = 24}: IconProps) {
  const filled = filledIcons[name]
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        {filled}
      </svg>
    )
  }

  return (
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
      {strokeIcons[name]}
    </svg>
  )
}
