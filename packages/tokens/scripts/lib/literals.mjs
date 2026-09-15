// Static evaluation of the token literals in src/**/*.css.ts.
//
// StyleX (the babel plugin under react-strict-dom on web) requires the object
// passed to css.defineVars / css.createTheme / css.defineConsts to be an inline
// literal, so the values cannot be imported at build time — they can only be
// read back out of the source. Both check-token-drift.mjs (keeps the copies
// honest) and generate-mockup-css.mjs (publishes the resolved values) go
// through this one reader so they cannot disagree about what a token is.

import {readFileSync} from 'node:fs'
import {parse} from '@babel/parser'

// Walk a Babel ObjectExpression / StringLiteral / NumericLiteral / etc. into a
// plain JS value. Throws on anything we don't recognize — we deliberately keep
// the surface small so a sneaky non-static value can't slip past.
export function evalNode(node) {
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value
    case 'NullLiteral':
      return null
    case 'TemplateLiteral':
      if (node.expressions.length > 0) {
        throw new Error('Template literals with expressions are not supported in tokens')
      }
      return node.quasis.map((q) => q.value.cooked).join('')
    case 'TSAsExpression': // `{...} as const` in keys.ts
      return evalNode(node.expression)
    case 'ArrayExpression':
      return node.elements.map((el) => evalNode(el))
    case 'ObjectExpression': {
      const out = {}
      for (const prop of node.properties) {
        if (prop.type !== 'ObjectProperty') {
          throw new Error(`Unsupported object property type: ${prop.type}`)
        }
        const key =
          prop.key.type === 'Identifier'
            ? prop.key.name
            : prop.key.type === 'StringLiteral'
              ? prop.key.value
              : null
        if (key === null) throw new Error(`Unsupported object key type: ${prop.key.type}`)
        out[key] = evalNode(prop.value)
      }
      return out
    }
    default:
      throw new Error(`Unsupported node type in token literal: ${node.type}`)
  }
}

/**
 * The literal object passed as argument `argIndex` to `css.<callee>(...)` in
 * the exported const `exportName` (or the first matching export when omitted).
 */
export function extractCallArg(file, callee, argIndex, exportName) {
  const source = readFileSync(file, 'utf8')
  const ast = parse(source, {sourceType: 'module', plugins: ['typescript']})

  for (const stmt of ast.program.body) {
    if (stmt.type !== 'ExportNamedDeclaration') continue
    const decl = stmt.declaration
    if (decl?.type !== 'VariableDeclaration') continue
    for (const declarator of decl.declarations) {
      if (exportName && !(declarator.id.type === 'Identifier' && declarator.id.name === exportName))
        continue
      const init = declarator.init
      if (init?.type !== 'CallExpression') continue
      const c = init.callee
      const name = c.type === 'MemberExpression' ? c.property.name : c.name
      if (name !== callee) continue
      const arg = init.arguments[argIndex]
      if (!arg) throw new Error(`No arg #${argIndex} for ${callee} in ${file}`)
      return evalNode(arg)
    }
  }
  throw new Error(
    `Could not find css.${callee}(...) export${exportName ? ` "${exportName}"` : ''} in ${file}`,
  )
}

// Parse a plain-TS module's exported consts into {name: value} without needing
// a TS loader.
export function parseModuleExports(file) {
  const text = readFileSync(file, 'utf8')
  const ast = parse(text, {sourceType: 'module', plugins: ['typescript']})
  const out = {}
  for (const stmt of ast.program.body) {
    if (stmt.type !== 'ExportNamedDeclaration') continue
    const decl = stmt.declaration
    if (decl?.type !== 'VariableDeclaration') continue
    for (const declarator of decl.declarations) {
      if (declarator.id.type !== 'Identifier') continue
      out[declarator.id.name] = evalNode(declarator.init)
    }
  }
  return out
}
