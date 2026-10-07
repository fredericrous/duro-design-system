import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs'
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
 * sources cannot use them in css.create (`tokens-compiled`). And one reads
 * fresh build output: a built `@media` that compares against a `var(--…)`
 * never matches (`media-var`).
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
  | 'media-var'

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
      data: {ok: true, findings: [], checked: [], skipped: [], packages: []},
    }
  }

  const findings: DoctorFinding[] = []
  const checked: string[] = []
  const rel = (path: string) => relative(root, path) || '.'
  const skipped: string[] = []
  for (const {dir, pkg} of packages) {
    findings.push(...checkPackage(dir, pkg, rel, checked, skipped))
  }
  return report(
    findings,
    checked,
    packages.map(({dir}) => rel(dir)),
    options.session === true,
    skipped,
  )
}

/** Every check, for one package that depends on @duro-app/ui. */
function checkPackage(
  dir: string,
  pkg: PackageJson,
  rel: (path: string) => string,
  checked: string[],
  skipped: string[],
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

  const media = checkMediaVar(dir, names, rel)
  findings.push(...media.findings)
  if (media.skipped) {
    skipped.push(`${rel(dir) === '.' ? '' : `${rel(dir)}: `}media-var (no fresh build)`)
  } else {
    checked.push(...media.checked)
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

/** `noExternal: someList` — the list is declared elsewhere. */
const NO_EXTERNAL_IDENT = /\bnoExternal\s*:\s*([A-Za-z_$][\w$]*)\b(?!\s*[.([])/g

/** The shorthand `{noExternal}` / `{…, noExternal, …}`: a binding named noExternal. */
const NO_EXTERNAL_SHORTHAND = /[{,]\s*(noExternal)\s*(?=[,}])/g

/** A value a noExternal binding can hold that doctor can read. */
const LIST_VALUE = String.raw`(\[[^\]]*\]|true\b|false\b|\/(?:\\.|[^/\n])+\/[a-z]*|(['"\x60])[^'"\x60\n]*\3)`

const NAMED_IMPORT = /\bimport\s*(?:type\s+)?\{([^}]*)\}\s*from\s*(['"])([^'"\n]+)\2/g

/** Where a const declares the list, and the list text. */
interface Declared {
  file: string
  index: number
  length: number
  value: string
}

function declarationOf(name: string, file: string, masked: string): Declared | null {
  const decl = new RegExp(
    String.raw`\b(?:const|let|var)\s+(${name.replace(/\$/g, '\\$')})\b[^=;\n]*=\s*` + LIST_VALUE,
  )
  const match = decl.exec(masked)
  if (!match) return null
  return {file, index: match.index, length: match[0].length, value: match[2]!}
}

/**
 * Resolve the binding a `noExternal` refers to: a const in the same config, or
 * one a sibling module exports and the config imports by name.
 */
function resolveList(
  name: string,
  config: {file: string; masked: string},
  dir: string,
  maskedOf: (file: string) => string | null,
): Declared | null {
  const local = declarationOf(name, config.file, config.masked)
  if (local) return local
  for (const match of config.masked.matchAll(NAMED_IMPORT)) {
    const specifier = match[3]!
    if (!specifier.startsWith('./') && !specifier.startsWith('../')) continue
    for (const part of match[1]!.split(',')) {
      const [imported, as] = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
      if ((as ?? imported)?.trim() !== name || !imported) continue
      const base = join(dirname(config.file), specifier)
      const candidates = MODULE_EXT.some((ext) => base.endsWith(ext))
        ? [base, ...MODULE_EXT.map((ext) => base.replace(/\.[cm]?js$/, ext))]
        : MODULE_EXT.map((ext) => base + ext)
      for (const candidate of candidates) {
        const masked = maskedOf(candidate)
        if (masked === null) continue
        return declarationOf(imported.trim(), candidate, masked)
      }
      return null
    }
  }
  return null
}

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
  // Comment-masked text per config; `outside` is the same with every
  // noExternal list (inline or declared) blanked, so naming the tokens in a
  // list never counts as routing them through Babel.
  const masked = new Map(build.map(({file, source}) => [file, maskComments(source, {line: true})]))
  const outside = new Map(masked)
  const blankOut = (file: string, index: number, length: number) => {
    const text = outside.get(file)
    if (text === undefined) return
    outside.set(file, text.slice(0, index) + ' '.repeat(length) + text.slice(index + length))
  }
  const maskedOf = (file: string): string | null => {
    const known = masked.get(file)
    if (known !== undefined) return known
    // `file` is relative to the checked root, like every config's name.
    const source = readText(join(dir, relative(rel(dir), file)))
    return source === null ? null : maskComments(source, {line: true})
  }
  const listsTokens = (value: string) => value === 'true' || TOKENS_MENTION.test(value)

  let stylex: {file: string; line: number} | null = null
  let ssr = false
  let ssrExternal = false
  const unresolved: Array<{name: string; file: string; line: number}> = []
  for (const {file, source} of build) {
    const text = masked.get(file)!
    for (const list of text.matchAll(NO_EXTERNAL)) {
      if (listsTokens(list[0].replace(/^\bnoExternal\s*:\s*/, ''))) ssrExternal = true
      blankOut(file, list.index, list[0].length)
    }
    // `import {noExternal} from …` is a binding, not a use of one.
    const uses = text.replace(NAMED_IMPORT, (statement) => ' '.repeat(statement.length))
    const refs = [
      ...[...uses.matchAll(NO_EXTERNAL_IDENT)].map((m) => ({name: m[1]!, index: m.index})),
      ...[...uses.matchAll(NO_EXTERNAL_SHORTHAND)].map((m) => ({name: m[1]!, index: m.index})),
    ].filter(({name}) => !['true', 'false', 'undefined', 'null'].includes(name))
    for (const {name, index} of refs) {
      const declared = resolveList(name, {file, masked: text}, dir, maskedOf)
      if (!declared) {
        unresolved.push({name, file, line: lineOf(source, index)})
        continue
      }
      if (listsTokens(declared.value)) ssrExternal = true
      blankOut(declared.file, declared.index, declared.length)
    }
    if (/^vite\./.test(basename(file)) && SSR_CONFIG.test(text)) ssr = true
    const compiler = STYLEX_COMPILER.exec(text)
    if (compiler && !stylex) stylex = {file, line: lineOf(source, compiler.index)}
  }
  if (!stylex) return null
  const routed = [...outside.values()].some((text) => TOKENS_MENTION.test(text))
  const ssrGap = ssr && !ssrExternal
  if (routed && !ssrGap) return null

  // The only gap is SSR inlining, and a list doctor could not read may close
  // it: say what could not be verified instead of failing.
  const opaque = unresolved[0]
  if (routed && opaque) {
    return {
      rule: 'tokens-compiled',
      severity: 'warn',
      file: opaque.file,
      line: opaque.line,
      message: `ssr.noExternal is \`${opaque.name}\` in ${opaque.file}:${opaque.line}, which doctor cannot resolve to a list, so it cannot verify that SSR inlines @duro-app/tokens (without it, css.defineVars throws at runtime).`,
      fix: `Make sure '@duro-app/tokens' is in \`${opaque.name}\`, or declare noExternal inline in ${opaque.file}.`,
    }
  }

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

/** Build output directories `media-var` reads. */
const BUILD_DIRS = ['build', 'dist']

/** An `@media` prelude, up to its block. */
const MEDIA_RULE = /@media\b([^{;]*)\{/g

/** Text cut to about `max` characters, for one-line minified CSS. */
const clip = (text: string, max = 80) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text

/**
 * The newest modification time among the package's build config and its
 * sources (app/, src/), scanned up to SOURCE_SCAN_LIMIT files.
 */
/** A path doctor could not read, with the error code (`EACCES`, `EIO`…). */
interface Unreadable {
  path: string
  code: string
}

const errorCode = (error: unknown): string =>
  (error as NodeJS.ErrnoException | null)?.code ?? 'unknown'

/**
 * `statSync(path).mtimeMs`, or null when the path is gone (ENOENT: it
 * vanished between listing and stat). Any other failure is recorded in
 * `unreadable` and also returns null.
 */
function mtimeOf(path: string, unreadable: Unreadable[]): number | null {
  try {
    return statSync(path).mtimeMs
  } catch (error) {
    if (errorCode(error) !== 'ENOENT') unreadable.push({path, code: errorCode(error)})
    return null
  }
}

function newestInput(dir: string, configs: string[], unreadable: Unreadable[]): number {
  let newest = 0
  const seen = (path: string) => {
    const mtime = mtimeOf(path, unreadable)
    if (mtime !== null) newest = Math.max(newest, mtime)
  }
  for (const name of [...configs, 'package.json']) seen(join(dir, name))
  walkFiles(
    ['src', 'app'].map((name) => join(dir, name)),
    (name) => /\.[cm]?[jt]sx?$|\.css$/.test(name),
    seen,
    unreadable,
  )
  return newest
}

/**
 * Depth-first over `roots`, calling `visit` on each matching file, capped. A
 * root that does not exist (ENOENT) or is not a directory (ENOTDIR) is
 * skipped; a directory that cannot be read for any other reason is recorded
 * in `unreadable`.
 */
function walkFiles(
  roots: string[],
  matches: (name: string) => boolean,
  visit: (path: string) => void,
  unreadable: Unreadable[],
): void {
  const stack = [...roots].reverse()
  let budget = SOURCE_SCAN_LIMIT
  while (stack.length > 0 && budget > 0) {
    const current = stack.pop()!
    let entries
    try {
      entries = readdirSync(current, {withFileTypes: true})
    } catch (error) {
      const code = errorCode(error)
      if (code !== 'ENOENT' && code !== 'ENOTDIR') unreadable.push({path: current, code})
      continue
    }
    const dirs: string[] = []
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
      const path = join(current, entry.name)
      if (entry.isDirectory()) dirs.push(path)
      else if (matches(entry.name)) {
        if (--budget < 0) return
        visit(path)
      }
    }
    stack.push(...dirs.reverse())
  }
}

/**
 * A media query cannot read a custom property: `@media (max-width:
 * var(--x))` never matches, so the rules inside never apply. It happens when
 * `@duro-app/tokens/tokens/breakpoints.css.ts` reaches the CSS without the
 * StyleX/RSD compile that turns its consts into px. Reads built CSS only, and
 * only output newer than every config and source file: stale output says
 * nothing about the code as it is. `skipped` when there is no fresh build;
 * a path it could not read is a warning, never silently left out.
 */
function checkMediaVar(
  dir: string,
  configs: string[],
  rel: (path: string) => string,
): {checked: string[]; findings: DoctorFinding[]; skipped: boolean} {
  const unreadable: Unreadable[] = []
  const newest = newestInput(dir, configs, unreadable)
  const fresh: string[] = []
  walkFiles(
    BUILD_DIRS.map((name) => join(dir, name)),
    (name) => name.endsWith('.css'),
    (path) => {
      const mtime = mtimeOf(path, unreadable)
      if (mtime !== null && mtime > newest) fresh.push(path)
    },
    unreadable,
  )
  // What could not be read is said, not silently left out of the check.
  const findings: DoctorFinding[] = unreadable.map(({path, code}) => ({
    rule: 'media-var',
    severity: 'warn',
    file: rel(path),
    message: `${rel(path)} could not be read (${code}), so media-var did not check it or what it holds.`,
    fix: `Make ${rel(path)} readable by the user running doctor, or remove it.`,
  }))
  if (fresh.length === 0) return {checked: [], findings, skipped: true}
  for (const path of fresh) {
    const source = readText(path)
    if (source === null) continue
    const css = maskComments(source, {line: false})
    const broken = [...css.matchAll(MEDIA_RULE)].filter((m) => m[1]!.includes('var(--'))
    const first = broken[0]
    if (!first) continue
    const query = clip(`@media${first[1]!.replace(/\s+/g, ' ').trimEnd()}`)
    const more = broken.length > 1 ? ` (and ${broken.length - 1} more)` : ''
    findings.push({
      rule: 'media-var',
      severity: 'error',
      file: rel(path),
      line: lineOf(source, first.index),
      message: `${query}${more} compares against a CSS variable, which a media query cannot read: it never matches, so the rules inside never apply.`,
      fix: 'compile `@duro-app/tokens/tokens/breakpoints.css.ts` through the StyleX/RSD babel step, rebuild, re-run `npx -y @duro-app/cli doctor`',
    })
  }
  return {checked: fresh.map(rel), findings, skipped: false}
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

/** What each kind of error does to the app, for the session block's first line. */
const CONSEQUENCE: Record<DoctorRule, string> = {
  'runtime-injection': 'components render with their spacing flattened',
  'layered-extraction': 'components render with their spacing flattened',
  'css-imported': 'components render with their spacing flattened',
  'css-load-order': 'components render with their spacing flattened',
  'unlayered-reset': 'components render with their spacing flattened',
  'version-skew': 'the CLI checks a different version than the one installed',
  'tokens-compiled': 'css.create cannot use the design tokens',
  'media-var': 'breakpoint media queries never match',
}

function report(
  findings: DoctorFinding[],
  checked: string[],
  packages: string[],
  session: boolean,
  skipped: string[] = [],
): CommandResult {
  const errors = findings.filter((finding) => finding.severity === 'error')
  const warnings = findings.filter((finding) => finding.severity === 'warn')
  const data = {ok: errors.length === 0, findings, checked, skipped, packages}
  const where = (finding: DoctorFinding) =>
    finding.line ? `${finding.file}:${finding.line}` : finding.file
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

  if (session) {
    if (findings.length === 0) return {text: '', data}
    const effects = [...new Set(errors.map((finding) => CONSEQUENCE[finding.rule]))]
    return {
      text: [
        errors.length > 0
          ? `DURO DOCTOR — ${plural(errors.length, 'error')} in this repo's @duro-app/ui setup: ${effects.join('; ')} until fixed. Fix before any styling work:`
          : `DURO DOCTOR — ${plural(warnings.length, 'warning')} about this repo's @duro-app/ui setup:`,
        ...findings.map(
          (finding) =>
            `- [${finding.severity}] ${finding.rule} at ${where(finding)}: ${finding.message} Fix: ${finding.fix}`,
        ),
        'Re-check with: npx -y @duro-app/cli doctor',
      ].join('\n'),
      data,
    }
  }

  const tail = [
    `  checked: ${checked.join(', ')}`,
    ...(skipped.length > 0 ? [`  skipped: ${skipped.join(', ')}`] : []),
  ]
  if (findings.length === 0) {
    return {
      text: ['duro doctor: no problems found', ...tail].join('\n'),
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
      ...tail,
    ].join('\n'),
    data,
    exitCode: errors.length > 0 ? 1 : undefined,
  }
}
