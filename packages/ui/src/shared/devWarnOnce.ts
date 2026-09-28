// --- Dev-only warn registry ---
//
// One-shot per warning code per process: long-running dev sessions
// shouldn't drown the console on every re-render of a misused component.
const IS_PROD = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'
const warned = new Set<string>()

/** Warn once, outside production, as `[duro-app/ui <scope>] <message>`. */
export function devWarnOnce(scope: string, code: string, message: string): void {
  const key = `${scope}:${code}`
  if (IS_PROD || warned.has(key)) return
  warned.add(key)

  console.warn(`[duro-app/ui ${scope}] ${message}`)
}
