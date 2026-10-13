import {useEffect, useState} from 'react'

/**
 * The OS colour scheme, live. The first render answers `'dark'`, what the
 * server renders without a DOM, so hydration matches; the effect then reads
 * `prefers-color-scheme` and follows its changes.
 */
export function useSystemScheme(): 'light' | 'dark' {
  const [scheme, setScheme] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setScheme(mq.matches ? 'dark' : 'light')
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return scheme
}
