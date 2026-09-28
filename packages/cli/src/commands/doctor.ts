import {existsSync, readdirSync, readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {basename, dirname, join, relative, resolve} from 'node:path'
import type {CommandResult} from './lookup.js'
import {cliVersion} from './manifest.js'
import {lineOf, maskComments} from '../scan.js'

/**
 * `duro doctor` — checks how the app in the cwd wires @duro-app/ui into its
 * build. Every rule here is a way a consumer has shipped design-system
 * components with their spacing flattened while the design system's own
 * stylesheet was correct: the stylesheet is layered (`reset`, then StyleX's
 * `priority1..5`), and anything that lands outside those layers, or declares
 * them in the wrong order, outranks it. Each app used to rediscover this
 * alone; the contract lives here now.
 *
 * Static and dependency-free on purpose: it runs under npx from the
 * SessionStart hook, so it reads files with regexes over comment-masked
 * source instead of loading a parser or executing the app's config.
 */

export type DoctorRule =
  | 'runtime-injection'
  | 'layered-extraction'
  | 'css-imported'
  | 'css-load-order'
  | 'unlayered-reset'
  | 'version-skew'
  | 'breakpoints-extracted'

export interface DoctorFinding {
  rule: DoctorRule
  severity: 'error' | 'warn'
  /** Relative to the checked package root. */
  file: string
  line?: number
  message: string
  fix: string
}

export interface DoctorOptions {
  /** Package root to check. Defaults to the process cwd. */
  cwd?: string
  /**
   * SessionStart mode: print nothing when healthy, an agent-facing block
   * otherwise, and always exit 0 — findings are context for the session, and
   * a non-zero exit is what the hook script reads as "npx failed".
   */
  session?: boolean
}

const DS_CSS = '@duro-app/ui/dist/index.css'
const PRIORITIES = ['priority1', 'priority2', 'priority3', 'priority4', 'priority5']
const LAYER_STATEMENT = `@layer reset, ${PRIORITIES.join(', ')};`

/** Layers each design-system stylesheet declares, in declaration order. */
const DS_SHEETS: Record<string, string[]> = {
  [DS_CSS]: ['reset', ...PRIORITIES],
  '@duro-app/ui/reset.css': ['reset'],
  '@duro-app/ui/strict.css': ['reset', ...PRIORITIES],
}

/** Build config that can carry StyleX / react-strict-dom options. */
const CONFIG_FILE =
  /^(?:(?:vite|vitest|babel|postcss)(?:\.[\w-]+)*\.[cm]?[jt]s|\.babelrc(?:\.[cm]?js|\.json)?|[\w-]+\.babel\.[cm]?[jt]s)$/

/** App entry modules, most specific first. */
const ENTRIES = [
  'app/root.tsx',
  'app/root.jsx',
  'src/main.tsx',
  'src/main.jsx',
  'src/main.ts',
  'src/index.tsx',
  'src/index.jsx',
  'src/root.tsx',
]

/**
 * Elements the design system renders. A zero padding/margin on one of these
 * (or on `*`) outside a layer beats the component's own spacing.
 */
const COMPONENT_ELEMENTS = new Set([
  'a',
  'button',
  'div',
  'fieldset',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'footer',
  'input',
  'label',
  'legend',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'section',
  'select',
  'span',
  'table',
  'td',
  'textarea',
  'th',
  'ul',
])

const ZERO_SPACING =
  /(?:^|[;{\s])((?:padding|margin)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?)\s*:\s*0(?:px|rem|em)?\s*(?:!important\s*)?(?=;|$)/g

export function runDoctor(options: DoctorOptions = {}): CommandResult {
  const root = resolve(options.cwd ?? process.cwd())
  const packages = consumerPackages(root)
  if (packages.length === 0) {
    return {
      text: options.session
        ? ''
        : 'duro doctor: no package here uses @duro-app/ui — nothing to check',
      data: {ok: true, findings: [], checked: [], packages: []},
    }
  }

  const findings: DoctorFinding[] = []
  const checked: string[] = []
  const rel = (path: string) => relative(root, path) || '.'
  for (const {dir, pkg} of packages) findings.push(...checkPackage(dir, pkg, rel, checked))
  return report(
    findings,
    checked,
    packages.map(({dir}) => rel(dir)),
    options.session === true,
  )
}

/** Every check, for one package that depends on @duro-app/ui. */
function checkPackage(
  dir: string,
  pkg: PackageJson,
  rel: (path: string) => string,
  checked: string[],
): DoctorFinding[] {
  const findings: DoctorFinding[] = []
  let unlayeredExtraction = false
  for (const name of readdirSync(dir)
    .filter((entry) => CONFIG_FILE.test(entry))
    .sort()) {
    const source = readText(join(dir, name))
    if (source === null) continue
    const file = rel(join(dir, name))
    checked.push(file)
    findings.push(...checkRuntimeInjection(file, source))
    const extraction = checkExtraction(file, source)
    if (extraction) {
      unlayeredExtraction = true
      findings.push(extraction)
    }
    const breakpoints = checkBreakpointsExtracted(dir, join(dir, name), source, rel, checked)
    if (breakpoints) findings.push(breakpoints)
  }

  const entry = ENTRIES.map((path) => join(dir, path)).find((path) => existsSync(path))
  if (entry !== undefined) {
    checked.push(rel(entry))
    findings.push(...checkStylesheets(dir, entry, rel, checked, unlayeredExtraction))
  } else if (!isLibrary(pkg)) {
    // A library (it publishes main/exports) has no entry by design: its
    // consumers load the stylesheet, and doctor checks them.
    findings.push({
      rule: 'css-imported',
      severity: 'warn',
      file: rel(dir),
      message: `No app entry found (looked for ${ENTRIES.join(', ')}), so the stylesheet wiring was not checked.`,
      fix: `Import '${DS_CSS}' in the module that renders the app.`,
    })
  }

  const skew = uiVersionSkew(dir)
  if (skew) {
    findings.push({
      rule: 'version-skew',
      severity: 'warn',
      file: rel(join(dir, 'package.json')),
      message: `@duro-app/ui is ${skew.installed}, but this CLI documents and checks ${skew.own}.`,
      fix: `npx -y @duro-app/cli@${skew.installed} doctor, or upgrade @duro-app/ui.`,
    })
  }
  return findings
}

/**
 * The packages under `root` that depend on @duro-app/ui. The hook runs at
 * the repo root, which in a workspace (or an app kept in web/) is not the
 * package that renders anything: follow the workspace globs, and without
 * any, look one directory down.
 */
function consumerPackages(root: string): Array<{dir: string; pkg: PackageJson}> {
  const rootPkg = readPackage(root)
  const dirs = [root]
  const patterns = workspacePatterns(root, rootPkg)
  for (const pattern of patterns) dirs.push(...expandWorkspace(root, pattern))
  if (patterns.length === 0 && !(rootPkg && dependsOnUi(rootPkg))) {
    dirs.push(...childDirs(root))
  }
  const out: Array<{dir: string; pkg: PackageJson}> = []
  for (const dir of new Set(dirs)) {
    const pkg = readPackage(dir)
    if (pkg && dependsOnUi(pkg)) out.push({dir, pkg})
  }
  return out
}

function readPackage(dir: string): PackageJson | null {
  const raw = readText(join(dir, 'package.json'))
  return raw === null ? null : parsePackage(raw)
}

/** npm/yarn `workspaces` and pnpm-workspace.yaml `packages`, negations dropped. */
function workspacePatterns(root: string, pkg: PackageJson | null): string[] {
  const field = pkg?.workspaces
  const fromPkg = Array.isArray(field)
    ? field
    : Array.isArray((field as {packages?: unknown} | undefined)?.packages)
      ? (field as {packages: unknown[]}).packages
      : []
  const yaml = readText(join(root, 'pnpm-workspace.yaml')) ?? ''
  const block = /^packages:\s*\n((?:[ \t]+-.*\n?|[ \t]*#.*\n?|[ \t]*\n)*)/m.exec(yaml)?.[1] ?? ''
  const fromYaml = [...block.matchAll(/^[ \t]+-\s*['"]?([^'"#\n]+?)['"]?\s*(?:#.*)?$/gm)].map(
    (match) => match[1]!,
  )
  return [...fromPkg, ...fromYaml].filter(
    (pattern): pattern is string => typeof pattern === 'string' && !pattern.startsWith('!'),
  )
}

/** `apps/*` and `apps/**` list apps' subdirectories; anything else is a path. */
function expandWorkspace(root: string, pattern: string): string[] {
  const glob = /^(.*?)\/\*\*?$/.exec(pattern.replace(/\/$/, ''))
  return glob ? childDirs(join(root, glob[1]!)) : [join(root, pattern)]
}

function childDirs(dir: string): string[] {
  try {
    return readdirSync(dir, {withFileTypes: true})
      .filter(
        (entry) =>
          entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules',
      )
      .map((entry) => join(dir, entry.name))
      .sort()
  } catch {
    return []
  }
}

function readText(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

type PackageJson = Record<string, unknown>

function parsePackage(raw: string): PackageJson {
  try {
    return JSON.parse(raw) as PackageJson
  } catch {
    return {}
  }
}

function dependsOnUi(pkg: PackageJson): boolean {
  return ['dependencies', 'devDependencies', 'peerDependencies'].some(
    (field) => (pkg[field] as Record<string, string> | undefined)?.['@duro-app/ui'] !== undefined,
  )
}

function isLibrary(pkg: PackageJson): boolean {
  return pkg.exports !== undefined || pkg.main !== undefined || pkg.module !== undefined
}

/** The installed @duro-app/ui version when it differs from this CLI's. */
export function uiVersionSkew(cwd: string): {own: string; installed: string} | null {
  try {
    const require = createRequire(join(cwd, 'package.json'))
    const installed = (require('@duro-app/ui/package.json') as {version?: string}).version
    const own = cliVersion()
    return installed && own !== '0.0.0' && installed !== own ? {own, installed} : null
  } catch {
    return null
  }
}

function checkRuntimeInjection(file: string, source: string): DoctorFinding[] {
  const masked = maskComments(source, {line: true})
  const out: DoctorFinding[] = []
  const name = basename(file)
  for (const match of masked.matchAll(/\bruntimeInjection\s*:\s*([^,}\n]+)/g)) {
    const value = match[1]!.trim()
    if (/^false\b/.test(value)) continue
    const literal = /^(?:true\b|['"`])/.test(value)
    // Test runners render into jsdom, where nothing is laid out: injection
    // there changes no pixel anyone sees, but it is one copy-paste from the
    // app config, so it is still worth a warning.
    const testOnly = name.startsWith('vitest.')
    out.push({
      rule: 'runtime-injection',
      severity: literal && !testOnly ? 'error' : 'warn',
      file,
      line: lineOf(source, match.index),
      message: `${
        literal
          ? `runtimeInjection: ${value}`
          : `runtimeInjection is computed (${value}), and may be on`
      }${testOnly ? ' (test config only)' : ''} — StyleX then injects react-strict-dom's element reset (padding: 0, margin: 0) into an unlayered <style> at import time. Unlayered rules beat every @layer rule, so it flattens the spacing of every @duro-app/ui component.`,
      fix: `Set runtimeInjection: false and extract the rules at build time instead: react-strict-dom/postcss-plugin in postcss.config, plus a CSS file containing @react-strict-dom; imported after '${DS_CSS}'.`,
    })
  }
  return out
}

function checkExtraction(file: string, source: string): DoctorFinding | null {
  if (!basename(file).startsWith('postcss.config')) return null
  const masked = maskComments(source, {line: true})
  const match = /\buseCSSLayers\s*:\s*false\b/.exec(masked)
  if (!match) return null
  return {
    rule: 'layered-extraction',
    severity: 'error',
    file,
    line: lineOf(source, match.index),
    message:
      "useCSSLayers: false emits this app's StyleX rules unlayered — including react-strict-dom's element reset (padding: 0) — and unlayered rules beat the design system's layered component styles.",
    fix: 'Remove useCSSLayers (it defaults to true) so the extracted rules land in the same priority layers as @duro-app/ui.',
  }
}

const BREAKPOINTS_MODULE = '@duro-app/tokens/tokens/breakpoints.css'
/** Where the defining file sits, relative to the package root StyleX runs from. */
const BREAKPOINTS_SOURCE = 'node_modules/@duro-app/tokens/src/tokens/breakpoints.css.ts'
const EXTRACTION_PLUGIN = /['"](?:react-strict-dom\/postcss-plugin|@stylexjs\/postcss-plugin)['"]/
const SOURCE_FILE = /\.[cm]?[jt]sx?$/
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage', 'public'])
const SOURCE_SCAN_LIMIT = 5000

/**
 * `breakpoints.*` are css.defineConsts. StyleX substitutes a const into a
 * `@media` key only when the file that defines it is part of the same
 * extraction; left out, the query compiles to an unresolvable `var(--md-…)`
 * and the whole rule is dropped from the built CSS — lint, typecheck and
 * every other check stay green. So when the files this PostCSS extraction
 * covers import the breakpoints, its `include` must cover the tokens source
 * too (customer-vision shipped without it; duro-app carries it).
 *
 * Static like its siblings: the include is read as the string literals in
 * the config and the relative modules it imports. Anything it cannot read
 * (no include, a path built with resolve()) is skipped, not guessed.
 */
function checkBreakpointsExtracted(
  root: string,
  configPath: string,
  source: string,
  rel: (path: string) => string,
  checked: string[],
): DoctorFinding | null {
  if (!basename(configPath).startsWith('postcss.config')) return null
  const masked = maskComments(source, {line: true})
  if (!EXTRACTION_PLUGIN.test(masked)) return null
  const include = /\binclude\s*:/.exec(masked)
  if (!include) return null

  const texts = [masked, ...importedModules(configPath, masked)]
  // A path computed from the package (require.resolve, import.meta.resolve,
  // createRequire) can point anywhere: don't guess what it covers.
  if (texts.some((text) => /\bresolve\s*\(\s*['"]@duro-app\/tokens/.test(text))) return null

  const patterns = texts
    .flatMap(stringLiterals)
    .filter((literal) => /\*/.test(literal) || SOURCE_FILE.test(literal))
  if (patterns.length === 0) return null
  const matchers = patterns.map((pattern) => ({pattern, re: globToRegExp(pattern)}))
  if (matchers.some(({re}) => re.test(BREAKPOINTS_SOURCE))) return null

  const user = findBreakpointsImport(
    root,
    matchers.filter(({pattern}) => !pattern.includes('node_modules')),
  )
  if (!user) return null
  checked.push(rel(user))
  const file = rel(configPath)
  return {
    rule: 'breakpoints-extracted',
    severity: 'error',
    file,
    line: lineOf(source, include.index),
    message: `${rel(user)} imports breakpoints from '${BREAKPOINTS_MODULE}', but the StyleX extraction in ${file} does not include ${BREAKPOINTS_SOURCE}. breakpoints.* are css.defineConsts, inlined into a @media query only when the defining file is part of the same extraction — without it every @media built from them compiles to var(--…) and is silently dropped from the CSS.`,
    fix: `Add '${BREAKPOINTS_SOURCE}' to the include in ${file}.`,
  }
}

/** Masked text of the relative modules a config imports (one hop). */
function importedModules(configPath: string, masked: string): string[] {
  const out: string[] = []
  for (const match of masked.matchAll(
    /(?:\bfrom\s+|\bimport\s*\(\s*|\brequire\s*\(\s*)(['"])(\.\.?\/[^'"\n]+)\1/g,
  )) {
    const base = resolve(dirname(configPath), match[2]!)
    const path = ['', '.ts', '.mts', '.cts', '.js', '.mjs', '.cjs']
      .map((ext) => base + ext)
      .find((candidate) => existsSync(candidate) && SOURCE_FILE.test(candidate))
    const text = path ? readText(path) : null
    if (text !== null) out.push(maskComments(text, {line: true}))
  }
  return out
}

/** Plain string literals (no `${}` interpolation) in masked source. */
function stringLiterals(masked: string): string[] {
  return [...masked.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g)]
    .map((match) => match[2]!)
    .filter((literal) => !literal.includes('${'))
}

/**
 * A micromatch-style glob (`**`, `*`, `?`, `{a,b}`) as a RegExp over a path
 * relative to the package root. Leading `./` and `../` are dropped: a
 * workspace config can reach the same node_modules path from above.
 */
function globToRegExp(glob: string): RegExp {
  const pattern = glob.replace(/^(?:\.\.?\/)+/, '')
  let out = ''
  let braces = 0
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i]!
    if (char === '*') {
      if (pattern[i + 1] === '*') {
        const slash = pattern[i + 2] === '/'
        out += slash ? '(?:.*/)?' : '.*'
        i += slash ? 2 : 1
      } else {
        out += '[^/]*'
      }
    } else if (char === '?') out += '[^/]'
    else if (char === '{') {
      braces++
      out += '(?:'
    } else if (char === '}' && braces > 0) {
      braces--
      out += ')'
    } else if (char === ',' && braces > 0) out += '|'
    else out += char.replace(/[.+^$()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${out}$`)
}

/**
 * The first source file the extraction covers that value-imports from the
 * breakpoints module. Walks only the include patterns' static roots.
 */
function findBreakpointsImport(
  root: string,
  matchers: Array<{pattern: string; re: RegExp}>,
): string | null {
  const roots = new Set(
    matchers.map(({pattern}) => {
      const stat = pattern.replace(/^\.\//, '').split('/')
      const cut = stat.findIndex((segment) => /[*?{]/.test(segment))
      return (cut < 0 ? stat.slice(0, -1) : stat.slice(0, cut)).join('/')
    }),
  )
  const importRe = new RegExp(
    `^[ \\t]*import\\s+(?!type\\b)[^;'"]*?from\\s+['"]${BREAKPOINTS_MODULE.replace(/[./]/g, '\\$&')}['"]`,
    'm',
  )
  let budget = SOURCE_SCAN_LIMIT
  const seen = new Set<string>()
  const walk = (dir: string): string | null => {
    let entries
    try {
      entries = readdirSync(dir, {withFileTypes: true})
    } catch {
      return null
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (budget <= 0) return null
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue
        const found = walk(path)
        if (found) return found
      } else if (SOURCE_FILE.test(entry.name) && !seen.has(path)) {
        seen.add(path)
        budget--
        const relPath = relative(root, path).split('\\').join('/')
        if (!matchers.some(({re}) => re.test(relPath))) continue
        const text = readText(path)
        if (text !== null && importRe.test(maskComments(text, {line: true}))) return path
      }
    }
    return null
  }
  for (const start of roots) {
    const found = walk(join(root, start))
    if (found) return found
  }
  return null
}

interface LayerOrigin {
  file: string
  line: number
}

interface SheetWalk {
  root: string
  rel: (path: string) => string
  checked: string[]
  unlayeredExtraction: boolean
  /** Layer name → where it was first declared. Insertion order is cascade order. */
  layers: Map<string, LayerOrigin>
  findings: DoctorFinding[]
  seen: Set<string>
  dsImported: boolean
}

function checkStylesheets(
  root: string,
  entry: string,
  rel: (path: string) => string,
  checked: string[],
  unlayeredExtraction: boolean,
): DoctorFinding[] {
  const walk: SheetWalk = {
    root,
    rel,
    checked,
    unlayeredExtraction,
    layers: new Map(),
    findings: [],
    seen: new Set(),
    dsImported: false,
  }
  const source = readText(entry) ?? ''
  for (const imp of cssImports(source)) {
    visit(walk, imp.specifier, dirname(entry), {file: rel(entry), line: imp.line}, false)
  }

  if (!walk.dsImported) {
    walk.findings.unshift({
      rule: 'css-imported',
      severity: 'error',
      file: rel(entry),
      message: `${rel(entry)} never imports '${DS_CSS}'. @duro-app/ui's JavaScript does not load its stylesheet, so every component renders unstyled.`,
      fix: `Add import '${DS_CSS}' to ${rel(entry)}, before the app's own CSS.`,
    })
    return walk.findings
  }

  const order = [...walk.layers.keys()]
  const reset = order.indexOf('reset')
  const firstPriority = order.findIndex((name) => PRIORITIES.includes(name))
  if (reset > firstPriority && firstPriority >= 0) {
    const origin = walk.layers.get(order[firstPriority]!)!
    walk.findings.unshift({
      rule: 'css-load-order',
      severity: 'error',
      file: origin.file,
      line: origin.line,
      message: `${origin.file} declares StyleX's priority layers before 'reset'. The first declaration fixes layer order for the whole page, so the design system's reset (* { padding: 0; margin: 0 }) now outranks every component style.`,
      fix: `Import '${DS_CSS}' before ${origin.file}, or start ${origin.file} with ${LAYER_STATEMENT}`,
    })
  }
  return walk.findings
}

/** Stylesheet imports of a JS/TS module, in source order. */
function cssImports(source: string): Array<{specifier: string; line: number}> {
  const masked = maskComments(source, {line: true})
  const out: Array<{specifier: string; line: number}> = []
  for (const match of masked.matchAll(
    /^[ \t]*import\s+(?:([\w$*{}\s,]+?)\s+from\s+)?(['"])([^'"\n]+)\2/gm,
  )) {
    const [, clause, , specifier] = match
    if (!/\.css(?:\?[\w&=-]*)?$/.test(specifier!)) continue
    // `import {spacing} from '@duro-app/tokens/tokens/spacing.css'` is a
    // .css.ts module, not a stylesheet — only side-effect and ?url imports
    // put CSS on the page.
    if (clause !== undefined && !specifier!.includes('?')) continue
    out.push({specifier: specifier!.replace(/\?.*$/, ''), line: lineOf(source, match.index)})
  }
  return out
}

function resolveSheet(walk: SheetWalk, specifier: string, fromDir: string): string | null {
  const candidates = specifier.startsWith('.')
    ? [resolve(fromDir, specifier)]
    : specifier.startsWith('~/')
      ? ['app', 'src'].map((dir) => join(walk.root, dir, specifier.slice(2)))
      : specifier.startsWith('/')
        ? [join(walk.root, specifier)]
        : []
  return candidates.find((path) => existsSync(path)) ?? null
}

function declare(walk: SheetWalk, names: string[], origin: LayerOrigin): void {
  for (const name of names) if (!walk.layers.has(name)) walk.layers.set(name, origin)
}

/** One stylesheet import: record the layers it declares and scan app CSS. */
function visit(
  walk: SheetWalk,
  specifier: string,
  fromDir: string,
  origin: LayerOrigin,
  layered: boolean,
): void {
  const ds = DS_SHEETS[specifier]
  if (ds) {
    if (specifier === DS_CSS) walk.dsImported = true
    if (!layered) declare(walk, ds, {file: specifier, line: 0})
    return
  }
  const path = resolveSheet(walk, specifier, fromDir)
  if (path === null || walk.seen.has(path)) return
  walk.seen.add(path)
  const file = walk.rel(path)
  walk.checked.push(file)
  scanSheet(walk, path, file, layered)
}

/**
 * Walks a stylesheet's blocks in order: top-level layer declarations
 * (statements, blocks, `@react-strict-dom;`, `@import … layer()`), and zero
 * spacing on component elements outside any layer.
 */
function scanSheet(walk: SheetWalk, path: string, file: string, layered: boolean): void {
  const source = readText(path) ?? ''
  const css = maskComments(source, {line: false})
  const stack: Array<{kind: 'layer' | 'at' | 'rule'; selector?: string; body?: number}> = []
  const insideLayer = () => layered || stack.some((block) => block.kind === 'layer')
  let pos = 0
  for (const boundary of css.matchAll(/[{};]/g)) {
    const at = boundary.index
    const prelude = css.slice(pos, at).trim()
    const preludeAt = at - css.slice(pos, at).trimStart().length
    pos = at + 1
    const origin = {file, line: lineOf(source, preludeAt)}
    const topLevel = !insideLayer() && stack.every((block) => block.kind !== 'rule')

    if (boundary[0] === '{') {
      if (prelude.startsWith('@layer')) {
        const name = prelude.slice('@layer'.length).trim()
        if (topLevel && name) declare(walk, [name], origin)
        stack.push({kind: 'layer'})
      } else if (prelude.startsWith('@')) {
        stack.push({kind: 'at'})
      } else {
        stack.push({kind: 'rule', selector: prelude, body: at + 1})
      }
    } else if (boundary[0] === '}') {
      const block = stack.pop()
      if (block?.kind === 'rule' && !insideLayer()) {
        const body = css.slice(block.body, at)
        const selector = block.selector ?? ''
        if (targetsComponents(selector)) {
          for (const decl of body.matchAll(ZERO_SPACING)) {
            walk.findings.push({
              rule: 'unlayered-reset',
              severity: 'warn',
              file,
              line: lineOf(source, (block.body ?? 0) + decl.index),
              message: `'${selector.replace(/\s+/g, ' ')} { ${decl[1]}: 0 }' sits outside any @layer, so it beats the spacing @duro-app/ui components set in their layers.`,
              fix: `Wrap the rule in @layer reset { … } — the design system's reset layer, which component styles already outrank.`,
            })
          }
        }
      }
    } else if (topLevel) {
      if (prelude.startsWith('@layer')) {
        const names = prelude
          .slice('@layer'.length)
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean)
        declare(walk, names, origin)
      } else if (prelude === '@react-strict-dom') {
        // Extracted with layers (the default), this directive expands to
        // StyleX's priority layers; unlayered, layered-extraction reports it.
        if (!walk.unlayeredExtraction) declare(walk, PRIORITIES, origin)
      } else if (prelude.startsWith('@import')) {
        const target = /@import\s+(?:url\(\s*)?(['"])([^'"]+)\1/.exec(prelude)
        if (target) {
          const layer = /\blayer\(\s*([\w.-]+)\s*\)/.exec(prelude)
          if (layer) declare(walk, [layer[1]!], origin)
          visit(
            walk,
            target[2]!,
            dirname(path),
            origin,
            layer !== null || /\blayer\b/.test(prelude),
          )
        }
      }
    }
  }
}

/** Whether any selector in a list is `*` or a bare element the DS renders. */
function targetsComponents(selectorList: string): boolean {
  return selectorList.split(',').some((selector) => {
    const bare = selector.trim().replace(/::?[\w-]+(?:\([^)]*\))?/g, '')
    return bare === '*' || COMPONENT_ELEMENTS.has(bare)
  })
}

function report(
  findings: DoctorFinding[],
  checked: string[],
  packages: string[],
  session: boolean,
): CommandResult {
  const errors = findings.filter((finding) => finding.severity === 'error')
  const warnings = findings.filter((finding) => finding.severity === 'warn')
  const data = {ok: errors.length === 0, findings, checked, packages}
  const where = (finding: DoctorFinding) =>
    finding.line ? `${finding.file}:${finding.line}` : finding.file

  if (session) {
    if (findings.length === 0) return {text: '', data}
    return {
      text: [
        errors.length > 0
          ? "DURO DOCTOR — this repo's @duro-app/ui wiring is broken: components render with their spacing flattened until it is fixed. Fix it before any styling work:"
          : "DURO DOCTOR — warnings about this repo's @duro-app/ui wiring:",
        ...findings.map(
          (finding) =>
            `- [${finding.severity}] ${finding.rule} at ${where(finding)}: ${finding.message} Fix: ${finding.fix}`,
        ),
        'Re-check with: npx -y @duro-app/cli doctor',
      ].join('\n'),
      data,
    }
  }

  if (findings.length === 0) {
    return {
      text: `duro doctor: no problems found\n  checked: ${checked.join(', ')}`,
      data,
    }
  }
  return {
    text: [
      `duro doctor: ${errors.length} error(s), ${warnings.length} warning(s)`,
      ...findings.flatMap((finding) => [
        `  ${finding.severity.padEnd(5)} ${finding.rule.padEnd(18)} ${where(finding)}`,
        `        ${finding.message}`,
        `        fix: ${finding.fix}`,
      ]),
      `  checked: ${checked.join(', ')}`,
    ].join('\n'),
    data,
    exitCode: errors.length > 0 ? 1 : undefined,
  }
}
