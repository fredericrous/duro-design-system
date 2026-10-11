// The native graph has no DOM lib. A few spots on it still name DOM members:
// ConfirmDialog reads `event.target.value` from an Input change (RSD's native
// change event carries it too), and Grid reads `process.env.NODE_ENV`
// (inlined by Metro). Declare exactly those members rather than pulling in
// lib.dom.
interface HTMLInputElement {
  value: string
}

declare const process: {env: {NODE_ENV?: string}}
