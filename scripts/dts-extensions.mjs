/**
 * Give every relative module specifier in emitted declarations its explicit
 * form, so a `nodenext` consumer can resolve them.
 *
 * `<spec>` with `<spec>.d.ts` on disk becomes `<spec>.js`; with
 * `<spec>/index.d.ts` it becomes `<spec>/index.js`. A specifier already ending
 * in .js, .mjs, .cjs or .json is kept. Any other relative specifier throws.
 * Specifiers are located with `ts.preProcessFile`, so comments and
 * `/// <reference path>` lines are never touched.
 */
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const EXPLICIT = /\.(?:js|mjs|cjs|json)$/

function declarationFiles(directory) {
  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) return declarationFiles(full)
    return entry.name.endsWith('.d.ts') ? [full] : []
  })
}

function explicitForm(specifier, file) {
  if (!specifier.startsWith('.') || EXPLICIT.test(specifier)) return specifier
  const target = path.resolve(path.dirname(file), specifier)
  if (existsSync(`${target}.d.ts`)) return `${specifier}.js`
  if (existsSync(path.join(target, 'index.d.ts'))) return `${specifier}/index.js`
  throw new Error(`${file}: cannot resolve relative specifier "${specifier}"`)
}

function rewrite(text, file) {
  const imported = ts.preProcessFile(text, true, true).importedFiles
  const edits = imported
    .map(({fileName, pos}) => {
      // `pos` is the opening quote; `end` is not the literal's end, so the length comes from the value.
      const start = /^['"`]/.test(text[pos] ?? '') ? pos + 1 : pos
      return {start, stop: start + fileName.length, specifier: fileName}
    })
    .sort((a, b) => b.start - a.start)
  let result = text
  for (const {start, stop, specifier} of edits) {
    const replacement = explicitForm(specifier, file)
    if (replacement !== specifier)
      result = result.slice(0, start) + replacement + result.slice(stop)
  }
  return result
}

// holds-until: no consumer reads columns past a rewritten specifier — the sibling .d.ts.map keeps its
// pre-rewrite columns, so only the end of an import line drifts; remap the segments if one does
/** Rewrites every .d.ts under `distDir` in place; a file is written only when it changed. */
export function addDtsExtensions(distDir) {
  for (const file of declarationFiles(distDir)) {
    const text = readFileSync(file, 'utf8')
    const rewritten = rewrite(text, file)
    if (rewritten !== text) writeFileSync(file, rewritten)
  }
}
