#!/usr/bin/env node
/**
 * Lint the React Native import graph of @duro-app/ui.
 *
 * The file list comes from `tsc -p packages/ui/tsconfig.native.json
 * --listFilesOnly`; ESLint (not a second JSX parser) then runs over the
 * package's own sources in it. These faults bundle fine and crash only on a
 * device, so they fail here instead:
 *   - a lowercase JSX intrinsic, <svg> included (duro/no-raw-html-element
 *     with `svgExempt: false`);
 *   - a `css.keyframes` call (unsupported by react-strict-dom on native);
 *   - an `animationName` key;
 *   - an html.a with an href prop (react-strict-dom drops its press handler);
 *   - any react-dom import (named, namespace or side-effect).
 *
 * Exit 0 and no output on a clean graph; 1 with one line per violation on
 * stderr; 2 with a message on stderr when the graph cannot be listed.
 */
import {execFileSync} from 'node:child_process'
import {createRequire} from 'node:module'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {ESLint} from 'eslint'
import tsParser from '@typescript-eslint/parser'
import duro from '@duro-app/eslint-plugin'

const require = createRequire(import.meta.url)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const uiDir = path.join(repoRoot, 'packages/ui')
const ENTRY = 'src/index.native.ts'
const HINT = 'draw it with html.* / Icon, or move it into X.native.tsx'

const REACT_DOM = 'react-dom import'

const rules = {
  'duro/no-raw-html-element': ['error', {svgExempt: false}],
  'no-restricted-syntax': [
    'error',
    {
      selector: "CallExpression[callee.object.name='css'][callee.property.name='keyframes']",
      message: 'css.keyframes',
    },
    {selector: "Property[key.name='animationName']", message: 'animationName'},
    {selector: "Property[key.value='animationName']", message: 'animationName'},
    // RSD-native rejects a multi-value shorthand: write the longhands.
    {
      selector:
        'Property[key.name=/^(padding|margin|inset|gap)$/] > TemplateLiteral[expressions.length>1]',
      message: 'multi-value shorthand',
    },
    {
      selector: 'Property[key.name=/^(padding|margin|inset|gap)$/] > Literal[value=/\\S\\s+\\S/]',
      message: 'multi-value shorthand',
    },
    // RSD renders these as a text field on native; draw a role="checkbox" /
    // role="radio" button in the .native file instead (Checkbox, RadioGroup).
    {
      selector:
        "JSXOpeningElement[name.object.name='html'][name.property.name='input'] > JSXAttribute[name.name='type'][value.value=/^(checkbox|radio|date)$/]",
      message: 'html.input type checkbox, radio or date',
    },
    // RSD-native replaces the onPress of an html.a that has an href with a
    // dev-only stub, so a tap does nothing: use followLink (TextLink.native).
    {
      selector:
        "JSXOpeningElement[name.object.name='html'][name.property.name='a'] > JSXAttribute[name.name='href']",
      message: 'html.a with href',
    },
  ],
  'no-restricted-imports': [
    'error',
    {paths: [{name: 'react-dom', message: REACT_DOM}], patterns: [{group: ['react-dom/*']}]},
  ],
}

/**
 * holds-until: Tree's native row lands (plan
 * docs/plans/2026-10-15-happier-m1-gaps-native-links.md, item 1b: the
 * TreeRow web/native split, same branch). Tree.tsx is the one file known to
 * break the html.a rule until then; remove the entry with that port.
 */
const HREF_ANCHOR_UNTIL_TREE_ROW = new Set(['packages/ui/src/components/Tree/Tree.tsx'])

/** The form of a violation, read off the finding. */
function formOf(message, source) {
  if (message.ruleId === 'duro/no-raw-html-element') {
    const line = source.split('\n')[message.line - 1] ?? ''
    const end = message.endLine === message.line ? message.endColumn - 1 : undefined
    return `raw <${line.slice(message.column - 1, end)}>`
  }
  if (message.ruleId === 'no-restricted-imports') return REACT_DOM
  return message.message
}

/** Whether a listed file is one of the package's own sources. */
function isOwnSource(file, root) {
  const rel = path.relative(root, file)
  if (rel.startsWith('..') || rel.split(path.sep).includes('node_modules')) return false
  return /\.(ts|tsx)$/.test(rel) && !rel.endsWith('.d.ts') && rel.split(path.sep).includes('src')
}

/**
 * Lint `files` (absolute paths); returns violations sorted by file, line and
 * column, with paths relative to `root`.
 */
export async function lintNativeGraph(files, root = repoRoot) {
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ['**/*.{ts,tsx}'],
        plugins: {duro},
        languageOptions: {
          parser: tsParser,
          parserOptions: {sourceType: 'module', ecmaFeatures: {jsx: true}},
        },
        // No eslint-disable comment can exempt a native-graph file.
        linterOptions: {noInlineConfig: true, reportUnusedDisableDirectives: 'off'},
        rules,
      },
    ],
  })
  const results = await eslint.lintFiles(files.filter((f) => isOwnSource(f, root)))
  const found = []
  for (const result of results) {
    for (const message of result.messages) {
      found.push({
        file: path.relative(root, result.filePath),
        line: message.line,
        column: message.column,
        form: message.fatal
          ? `parse error: ${message.message}`
          : formOf(message, result.source ?? ''),
      })
    }
  }
  return found
    .filter((v) => !(v.form === 'html.a with href' && HREF_ANCHOR_UNTIL_TREE_ROW.has(v.file)))
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column)
}

/** The native graph's files, absolute; throws an Error naming why it cannot. */
function listGraph() {
  const tsc = require.resolve('typescript/bin/tsc')
  let out
  try {
    out = execFileSync(process.execPath, [tsc, '-p', 'tsconfig.native.json', '--listFilesOnly'], {
      cwd: uiDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (error) {
    const detail = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim()
    throw new Error(`tsc -p tsconfig.native.json failed:\n${detail}`, {cause: error})
  }
  const files = out.split('\n').filter(Boolean)
  const entry = path.join(uiDir, ENTRY)
  if (!files.includes(entry)) {
    throw new Error(`${ENTRY} is missing from the native graph (tsc --listFilesOnly)`)
  }
  return files
}

async function main() {
  let files
  try {
    files = listGraph()
  } catch (error) {
    process.stderr.write(`check-native-graph: ${error.message}\n`)
    return 2
  }
  const found = await lintNativeGraph(files)
  for (const v of found) {
    process.stderr.write(`${v.file}:${v.line}:${v.column} ${v.form} — ${HINT}\n`)
  }
  return found.length === 0 ? 0 : 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main()
}
