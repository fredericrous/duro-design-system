#!/usr/bin/env node
// Fails the build if the literal object passed to css.defineVars / css.createTheme
// in any *.css.ts file diverges from the matching export in src/raw.ts.
//
// We can't make the css.ts files import from raw.ts because StyleX (the babel
// plugin under react-strict-dom on web) requires inline object literals, so the
// values are duplicated. This script keeps the two copies honest.

import {readFile} from 'node:fs/promises'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {dirname, join} from 'node:path'
import {parse} from '@babel/parser'

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = join(here, '..', 'src')

// Walk a Babel ObjectExpression / StringLiteral / NumericLiteral / etc. into a
// plain JS value. Throws on anything we don't recognize — we deliberately keep
// the surface small so a sneaky non-static value can't slip past the check.
function evalNode(node) {
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

async function extractCallArg(file, callee, argIndex) {
  const source = await readFile(file, 'utf8')
  const ast = parse(source, {sourceType: 'module', plugins: ['typescript']})

  for (const stmt of ast.program.body) {
    if (stmt.type !== 'ExportNamedDeclaration') continue
    const decl = stmt.declaration
    if (decl?.type !== 'VariableDeclaration') continue
    for (const declarator of decl.declarations) {
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
  throw new Error(`Could not find css.${callee}(...) export in ${file}`)
}

const cases = [
  {
    label: 'darkColors',
    file: join(srcDir, 'tokens', 'colors.css.ts'),
    callee: 'defineVars',
    argIndex: 0,
    rawExport: 'darkColors',
  },
  {
    label: 'lightColors',
    file: join(srcDir, 'themes', 'light.css.ts'),
    callee: 'createTheme',
    argIndex: 1,
    rawExport: 'lightColors',
  },
  {
    label: 'highContrastColors',
    file: join(srcDir, 'themes', 'high-contrast.css.ts'),
    callee: 'createTheme',
    argIndex: 1,
    rawExport: 'highContrastColors',
  },
]

const rawModule = await import(pathToFileURL(join(srcDir, 'raw.ts')).href).catch(async () => {
  // Plain TS import via dynamic import won't work without a loader; fall back to
  // text parse so this script doesn't need ts-node / tsx in the build env.
  const text = await readFile(join(srcDir, 'raw.ts'), 'utf8')
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
})

let failures = 0
for (const c of cases) {
  const fromCss = await extractCallArg(c.file, c.callee, c.argIndex)
  const fromRaw = rawModule[c.rawExport]
  if (!fromRaw) {
    console.error(`✗ raw.ts is missing export "${c.rawExport}"`)
    failures++
    continue
  }
  const cssJson = JSON.stringify(fromCss, Object.keys(fromCss).sort())
  const rawJson = JSON.stringify(fromRaw, Object.keys(fromRaw).sort())
  if (cssJson !== rawJson) {
    console.error(`✗ drift: ${c.label} in ${c.file} differs from raw.ts`)
    console.error(`  css.ts: ${cssJson}`)
    console.error(`  raw.ts: ${rawJson}`)
    failures++
  } else {
    console.log(`✓ ${c.label} matches`)
  }
}

if (failures > 0) {
  console.error(`\n${failures} token drift failure(s). Update src/raw.ts to match the css.ts files (or vice versa).`)
  process.exit(1)
}
