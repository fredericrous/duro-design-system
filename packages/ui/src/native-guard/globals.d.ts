// The native graph has no DOM lib. Two spots on it still name DOM members
// that never run on native: Switch writes `inputRef.current.checked` inside a
// web-only branch, and Grid reads `process.env.NODE_ENV` (inlined by Metro).
// Declare exactly those members rather than pulling in lib.dom.
interface HTMLInputElement {
  checked: boolean
}

declare const process: {env: {NODE_ENV?: string}}
