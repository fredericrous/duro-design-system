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

async function extractCallArg(file, callee, argIndex, exportName) {
  const source = await readFile(file, 'utf8')
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
  throw new Error(`Could not find css.${callee}(...) export in ${file}`)
}

// Parse a plain-TS module's exported consts into {name: value} without needing
// a TS loader — same approach as the raw.ts fallback below.
async function parseModuleExports(file) {
  const text = await readFile(file, 'utf8')
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

// --- keys.ts scales vs css.ts literals -------------------------------------
// keys.ts duplicates the defineVars scales as plain TS (unions + numeric
// values); these checks keep that copy honest too.

const keys = await parseModuleExports(join(srcDir, 'keys.ts'))

// Compare a keys.ts numeric map against a css.ts defineVars literal whose
// values are `${n}${unit}` strings, checking key sets (and order) plus values.
function checkScale(label, cssObj, pxObj, keyList, unit) {
  const cssKeys = JSON.stringify(Object.keys(cssObj))
  const listKeys = JSON.stringify(keyList ?? Object.keys(pxObj))
  const mapKeys = JSON.stringify(Object.keys(pxObj))
  const cssValues = JSON.stringify(Object.values(cssObj))
  const keysValues = JSON.stringify(Object.values(pxObj).map((n) => `${n}${unit}`))
  if (cssKeys !== listKeys || cssKeys !== mapKeys || cssValues !== keysValues) {
    console.error(`✗ drift: ${label} in keys.ts differs from its css.ts literal`)
    console.error(`  css.ts:  keys ${cssKeys} values ${cssValues}`)
    console.error(`  keys.ts: keys ${mapKeys} (list ${listKeys}) values ${keysValues}`)
    failures++
  } else {
    console.log(`✓ ${label} matches`)
  }
}

const spacingCss = await extractCallArg(
  join(srcDir, 'tokens', 'spacing.css.ts'),
  'defineVars',
  0,
  'spacing',
)
checkScale('SPACING_PX', spacingCss, keys.SPACING_PX, keys.SPACING_KEYS, 'px')

const radiiCss = await extractCallArg(
  join(srcDir, 'tokens', 'spacing.css.ts'),
  'defineVars',
  0,
  'radii',
)
checkScale('RADII_PX', radiiCss, keys.RADII_PX, keys.RADIUS_KEYS, 'px')

const durationCss = await extractCallArg(
  join(srcDir, 'tokens', 'motion.css.ts'),
  'defineVars',
  0,
  'duration',
)
checkScale('DURATION_MS', durationCss, keys.DURATION_MS, null, 'ms')

const shadowsCss = await extractCallArg(
  join(srcDir, 'tokens', 'shadows.css.ts'),
  'defineVars',
  0,
  'shadows',
)
{
  const cssKeys = JSON.stringify(Object.keys(shadowsCss))
  const listKeys = JSON.stringify(keys.SHADOW_KEYS)
  if (cssKeys !== listKeys) {
    console.error(`✗ drift: SHADOW_KEYS in keys.ts differs from shadows.css.ts (${cssKeys})`)
    failures++
  } else {
    console.log(`✓ SHADOW_KEYS matches`)
  }
}

if (failures > 0) {
  console.error(
    `\n${failures} token drift failure(s). Update src/raw.ts / src/keys.ts to match the css.ts files (or vice versa).`,
  )
  process.exit(1)
}
