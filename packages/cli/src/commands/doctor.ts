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
 * alone; the contract lives here now. One rule is about the tokens rather
 * than the cascade: an app whose build never compiles @duro-app/tokens'
 * sources cannot use them in css.create (`tokens-compiled`).
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
  | 'tokens-compiled'

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
  const configs: ConfigFile[] = []
  const names = readdirSync(dir)
    .filter((entry) => CONFIG_FILE.test(entry))
    .sort()
  // A config may keep its StyleX options in a module it imports
  // (`vite.config.ts` → `./vite-stylex.ts`). Read those too, one level deep,
  // or moving the options out of the config silently blinds every check below.
  for (const name of [...names]) {
    const source = readText(join(dir, name))
    if (source === null) continue
    for (const imported of relativeImports(dir, source)) {
      if (!names.includes(imported)) names.push(imported)
    }
  }
  for (const name of names) {
    const source = readText(join(dir, name))
    if (source === null) continue
    const file = rel(join(dir, name))
    checked.push(file)
    configs.push({file, source})
    findings.push(...checkRuntimeInjection(file, source))
    const extraction = checkExtraction(file, source)
    if (extraction) {
      unlayeredExtraction = true
      findings.push(extraction)
    }
  }
  const tokens = checkTokensCompiled(dir, configs, rel)
  if (tokens) findings.push(tokens)

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

/** Source modules a config can import by a relative path. */
const MODULE_EXT = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs']
const RELATIVE_IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)(['"])(\.\/[^'"\n]+)\1/g

/**
 * Files in `dir` that a config imports by `./relative` path: the modules a
 * split config keeps its build options in. Siblings only — a config that
 * reaches into `../` or a subdirectory is importing app code, not options.
 */
function relativeImports(dir: string, source: string): string[] {
  const found: string[] = []
  for (const match of maskComments(source, {line: true}).matchAll(RELATIVE_IMPORT)) {
    const spec = match[2].slice(2)
    if (spec.includes('/')) continue
    const candidates = MODULE_EXT.some((ext) => spec.endsWith(ext))
      ? [spec, ...MODULE_EXT.map((ext) => spec.replace(/\.[cm]?js$/, ext))]
      : MODULE_EXT.map((ext) => spec + ext)
    const hit = candidates.find((name) => existsSync(join(dir, name)))
    if (hit && !/\.(?:test|spec|d)\./.test(hit) && !found.includes(hit)) found.push(hit)
  }
  return found
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

interface ConfigFile {
  /** Relative to the checked package root. */
  file: string
  source: string
}

/**
 * A StyleX compiler referenced from build config. react-strict-dom's preset
 * counts: it bundles @stylexjs/babel-plugin.
 */
const STYLEX_COMPILER =
  /(['"])(?:@stylexjs\/(?:babel-plugin|unplugin|rollup-plugin)|vite-plugin-stylex|@stylex-extend\/[\w-]+|react-strict-dom\/babel-preset)(?:\/[\w./-]*)?\1/

/** `@duro-app/tokens`, also as it appears inside a regex literal (`@duro-app\/tokens`). */
const TOKENS_MENTION = /@duro-app\\?\/tokens\b/

/** `noExternal: [...]`, `: true`, `: /re/` or `: 'pkg'`. */
const NO_EXTERNAL =
  /\bnoExternal\s*:\s*(?:\[[^\]]*\]|true\b|\/(?:\\.|[^/\n])+\/[a-z]*|(['"`])[^'"`\n]*\1)/g

/** Vite configs that render on the server: an `ssr` block or an SSR framework plugin. */
const SSR_CONFIG = /\bssr\s*:|['"]@react-router\/dev\/vite['"]|['"]@remix-run\/dev['"]/

const TOKENS_DEEP_IMPORT = /\bfrom\s*(['"])@duro-app\/tokens\/tokens\/[^'"\n]+\1/
const STYLEX_CREATE = /\b(?:css|stylex)\.create\s*\(/

const STYLEX_ERROR =
  'Could not resolve the path to the imported file. Please ensure the theme file has a .stylex.js or .stylex.ts extension'

/**
 * `@duro-app/tokens/tokens/*.css` resolves to the package's uncompiled
 * `src/tokens/*.css.ts` (react-strict-dom `css.defineVars`), which only
 * react-strict-dom's babel preset turns into StyleX theme variables. An app
 * that compiles its own code with StyleX but routes nothing of
 * @duro-app/tokens through that preset cannot use the tokens in css.create.
 *
 * Conservative: any vite/babel config text naming @duro-app/tokens outside
 * `noExternal` counts as routing it. An error only with evidence — a source file that
 * deep-imports the tokens and calls css.create, whose build fails today;
 * otherwise a warning, since the design system's own rules tell the next
 * edit to write exactly that import.
 */
function checkTokensCompiled(
  dir: string,
  configs: ConfigFile[],
  rel: (path: string) => string,
): DoctorFinding | null {
  // The bundle's build only: vitest runs its own transform, and a postcss
  // extraction `include` that names the tokens (duro-app's does) collects
  // their rules without compiling the module the bundle imports.
  const build = configs.filter(({file}) => !/^(?:vitest|postcss)\./.test(basename(file)))
  let stylex: {file: string; line: number} | null = null
  let routed = false
  let ssr = false
  let ssrExternal = false
  for (const {file, source} of build) {
    const masked = maskComments(source, {line: true})
    const lists = [...masked.matchAll(NO_EXTERNAL)]
    let outside = masked
    for (const list of lists) {
      if (list[0].endsWith('true') || TOKENS_MENTION.test(list[0])) ssrExternal = true
      outside =
        outside.slice(0, list.index) +
        ' '.repeat(list[0].length) +
        outside.slice(list.index + list[0].length)
    }
    if (TOKENS_MENTION.test(outside)) routed = true
    if (/^vite\./.test(basename(file)) && SSR_CONFIG.test(masked)) ssr = true
    const compiler = STYLEX_COMPILER.exec(masked)
    if (compiler && !stylex) stylex = {file, line: lineOf(source, compiler.index)}
  }
  if (!stylex) return null
  const ssrGap = ssr && !ssrExternal
  if (routed && !ssrGap) return null

  const evidence = tokensInCreate(dir)
  const where = evidence ? `${rel(evidence.path)}:${evidence.line}` : null
  const cause = routed
    ? `${stylex.file} routes @duro-app/tokens through Babel, but this app renders on the server and ssr.noExternal does not list it: SSR loads the tokens from node_modules as native ESM, bypassing that rule, and css.defineVars throws at runtime.`
    : `${stylex.file} compiles the app with StyleX, but nothing compiles @duro-app/tokens' sources: @duro-app/tokens/tokens/*.css resolves to uncompiled src/tokens/*.css.ts (react-strict-dom css.defineVars), which only react-strict-dom/babel-preset turns into StyleX theme variables. css.create then cannot import them — StyleX fails with "${STYLEX_ERROR}".`
  return {
    rule: 'tokens-compiled',
    severity: evidence ? 'error' : 'warn',
    file: stylex.file,
    line: stylex.line,
    message: `${cause} ${
      where
        ? `${where} imports one into css.create.`
        : 'Latent until a file imports a token into css.create — the import the design system prescribes; the barrel import apps fall back on is forbidden.'
    }`,
    fix: routed
      ? `Add '@duro-app/tokens' (with 'react-strict-dom') to ssr.noExternal in ${stylex.file}.`
      : `Compile node_modules/@duro-app/tokens with react-strict-dom/babel-preset, as duro-app's vite.config.ts does — babel({filter: /node_modules\\/@duro-app\\/tokens\\/.*\\.[jt]sx?$/, babelConfig: {presets: ['@babel/preset-typescript', ['react-strict-dom/babel-preset', {platform: 'web', rootDir: process.cwd()}]]}}) from vite-plugin-babel, ahead of the app's StyleX pass — and add '@duro-app/tokens' to ssr.noExternal if the app renders on the server.`,
  }
}

/** Sources under app/ and src/ scanned for tokens evidence, at most. */
const SOURCE_SCAN_LIMIT = 5000

/** The first app source that deep-imports @duro-app/tokens and calls css.create. */
function tokensInCreate(dir: string): {path: string; line: number} | null {
  const stack = ['src', 'app'].map((name) => join(dir, name))
  let budget = SOURCE_SCAN_LIMIT
  while (stack.length > 0 && budget > 0) {
    const current = stack.pop()!
    let entries
    try {
      entries = readdirSync(current, {withFileTypes: true})
    } catch {
      continue
    }
    const dirs: string[] = []
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
      const path = join(current, entry.name)
      if (entry.isDirectory()) {
        dirs.push(path)
        continue
      }
      if (!/\.[cm]?[jt]sx?$/.test(entry.name) || /\.native\./.test(entry.name)) continue
      if (--budget < 0) break
      const source = readText(path)
      if (source === null) continue
      const masked = maskComments(source, {line: true})
      const deep = TOKENS_DEEP_IMPORT.exec(masked)
      if (deep && STYLEX_CREATE.test(masked)) return {path, line: lineOf(source, deep.index)}
    }
    // Depth-first, alphabetical: the first match is stable across runs.
    stack.push(...dirs.reverse())
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
