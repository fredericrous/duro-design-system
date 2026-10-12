import path from 'node:path'
import {fileURLToPath} from 'node:url'
import type {Plugin} from 'vite'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

const isNativeOnly = (id: string): boolean =>
  id === 'react-native' ||
  id.startsWith('react-native/') ||
  id.startsWith('react-native-') ||
  id === '@shopify/react-native-skia' ||
  id.startsWith('@shopify/react-native-skia/')

/**
 * Fails the web build when a native-only package enters the web graph. The
 * native peers belong in `.native.tsx` files, which Vite's extension list
 * never picks.
 */
export function webGraphGuard(): Plugin {
  return {
    name: 'duro:web-graph-guard',
    enforce: 'pre',
    resolveId(id, importer) {
      if (!isNativeOnly(id)) return null
      const from = importer ? path.relative(repoRoot, importer.split('?')[0]) : '<entry>'
      this.error(
        `${id} reached from the web graph via ${from} — move the import into a .native.tsx file`,
      )
    },
  }
}
