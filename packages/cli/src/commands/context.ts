import {createHash} from 'node:crypto'
import {mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs'
import {homedir} from 'node:os'
import {join, relative, resolve} from 'node:path'
import type {Registry} from '../registry-types.js'
import {renderCatalog} from '../catalog.js'
import {isDuroConsumer, runDoctor} from './doctor.js'
import type {CommandResult} from './lookup.js'
import {cliVersion} from './manifest.js'

export interface ContextOptions {
  /** Print only the catalog; leave the doctor block out. */
  catalogOnly?: boolean
  /** Repo root. Defaults to the process cwd. */
  cwd?: string
  /** Where the doctor cache lives. Defaults to `${XDG_CACHE_HOME:-~/.cache}`. */
  cacheHome?: string
}

/** Directories the build-file scan never enters. */
const PRUNED = new Set(['node_modules', '.git', 'dist', 'build'])
const SCAN_DEPTH = 4
/** The files `duro doctor` reads: build config, entries, stylesheets, manifests. */
const BUILD_FILE =
  /^(?:package\.json|pnpm-workspace\.yaml|.*\.css|vite.*|babel.*|\.babelrc.*|.*\.babel\..*|postcss.*|root\.tsx|main\.tsx|index\.tsx)$/

function defaultCacheHome(): string {
  const xdg = process.env.XDG_CACHE_HOME
  return xdg ? xdg : join(homedir(), '.cache')
}

/** Every build file under `root` within SCAN_DEPTH, as repo-relative POSIX paths, sorted. */
function buildFiles(root: string): string[] {
  const found: string[] = []
  const walk = (dir: string, depth: number): void => {
    let entries
    try {
      entries = readdirSync(dir, {withFileTypes: true})
    } catch {
      return
    }
    for (const entry of entries) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (depth < SCAN_DEPTH && !PRUNED.has(entry.name)) walk(path, depth + 1)
      } else if (entry.isFile() && BUILD_FILE.test(entry.name)) {
        found.push(relative(root, path).split('\\').join('/'))
      }
    }
  }
  walk(root, 1)
  return found.sort()
}

/** Changes when any build file, or the CLI that reads them, changes. */
function buildKey(root: string): string {
  const hash = createHash('sha1').update(`duro ${cliVersion()}\n`)
  for (const path of buildFiles(root)) {
    try {
      hash
        .update(`${path}\0`)
        .update(readFileSync(join(root, path)))
        .update('\0')
    } catch {
      hash.update(`${path}\0unreadable\0`)
    }
  }
  return hash.digest('hex')
}

function readCache(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

/** tmp-then-rename; a failed write is silent, the next session recomputes. */
function writeCache(path: string, content: string): void {
  try {
    mkdirSync(join(path, '..'), {recursive: true})
    const partialPath = `${path}.tmp`
    writeFileSync(partialPath, content, 'utf8')
    renameSync(partialPath, path)
  } catch {
    // The cache is an optimisation: an unwritable cache dir costs a rerun.
  }
}

/** `duro doctor --session` output, re-run only when the build files' key changes. */
function cachedDoctor(root: string, cacheHome: string): string {
  const dir = join(cacheHome, 'duro', createHash('sha1').update(root).digest('hex').slice(0, 16))
  const key = buildKey(root)
  if (readCache(join(dir, 'doctor.key')) === key) {
    const cached = readCache(join(dir, 'doctor'))
    if (cached !== null) return cached
  }
  const text = runDoctor({session: true, cwd: root}).text
  writeCache(join(dir, 'doctor'), text)
  writeCache(join(dir, 'doctor.key'), key)
  return text
}

/**
 * `duro context`: what a session should know about the design system. The
 * catalog, then the doctor block when the build wiring is wrong. Outside a
 * Duro consumer it prints nothing, so a harness can run it anywhere.
 */
export function runContext(registry: Registry, options: ContextOptions = {}): CommandResult {
  const root = resolve(options.cwd ?? process.cwd())
  if (!isDuroConsumer(root)) return {text: '', data: {consumer: false}}
  const catalog = renderCatalog(registry)
  if (options.catalogOnly) return {text: catalog.text, data: catalog.data}
  const doctor = cachedDoctor(root, options.cacheHome ?? defaultCacheHome())
  return {
    text: doctor === '' ? catalog.text : `${catalog.text}\n\n${doctor}`,
    data: {...catalog.data, doctor},
  }
}
