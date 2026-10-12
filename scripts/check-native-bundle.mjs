#!/usr/bin/env node
/**
 * Count the copies of the shared runtime packages in examples/native's
 * exported bundles. Each must appear from exactly one package root: two
 * react-strict-dom copies split its theme context and css.defineVars
 * registry, two React copies break hooks, and two copies of a native peer
 * (react-native-svg, Reanimated) register its native views twice.
 *
 * Reads the `sources` array of each source map with JSON.parse: a source map
 * is a single line, so a line count (`grep -c`) cannot see a second copy.
 *
 * Exits 0 when every package has one root, 1 when one has more or none, and 2
 * when no source map is found (run `pnpm native:export` first).
 */
import {readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(repoRoot, 'examples/native/dist/_expo/static/js')
const shared = [
  'react-strict-dom',
  'react',
  'react-native',
  'react-native-svg',
  'react-native-reanimated',
]

function sourceMaps() {
  let platforms
  try {
    platforms = readdirSync(distDir)
  } catch {
    return []
  }
  return platforms.flatMap((platform) =>
    readdirSync(path.join(distDir, platform))
      .filter((file) => file.endsWith('.map'))
      .map((file) => ({platform, file: path.join(distDir, platform, file)})),
  )
}

/** The package roots (path up to and including node_modules/<name>/) a map draws from. */
function rootsOf(sources, name) {
  const marker = `node_modules/${name}/`
  const roots = new Set()
  for (const source of sources) {
    const at = source.lastIndexOf(marker)
    if (at !== -1) roots.add(source.slice(0, at + marker.length))
  }
  return roots
}

const maps = sourceMaps()
if (maps.length === 0) {
  console.error(
    `check-native-bundle: no source map under ${path.relative(repoRoot, distDir)} — run pnpm native:export first`,
  )
  process.exit(2)
}

let failed = false
for (const {platform, file} of maps) {
  const {sources} = JSON.parse(readFileSync(file, 'utf8'))
  const counts = shared.map((name) => `${name} ${rootsOf(sources, name).size}`)
  console.log(`${platform}: ${sources.length} modules; ${counts.join(', ')}`)
  for (const name of shared) {
    const size = rootsOf(sources, name).size
    if (size !== 1) {
      console.error(`${platform}: ${name} comes from ${size} package roots, expected 1`)
      failed = true
    }
  }
}
process.exit(failed ? 1 : 0)
