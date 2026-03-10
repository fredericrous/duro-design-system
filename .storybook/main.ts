import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import type {StorybookConfig} from '@storybook/react-vite'
import type {Plugin, UserConfig} from 'vite'
import {withoutVitePlugins} from '@storybook/builder-vite'
import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel'

// Stub react-native and its subpath imports (e.g. react-native/Libraries/...).
// react-strict-dom's .web.js code paths don't need react-native, but
// react-native-svg's fabric modules import deep RN paths that contain
// Flow/JSX syntax Vite can't parse.
function stubReactNative(): Plugin {
  const STUB = 'export default {};\n'
  const RN_RE = /^react-native(\/|$)/
  const shimPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../packages/ui/src/stubs/react-native.ts',
  )

  return {
    name: 'stub-react-native',
    enforce: 'pre',
    resolveId(source) {
      // Bare 'react-native' → use the project's shim with real exports
      if (source === 'react-native') return shimPath
      // Subpath imports (e.g. react-native/Libraries/...) → empty stub
      if (RN_RE.test(source)) return `\0rn-stub:${source}`
    },
    load(id) {
      if (id.startsWith('\0rn-stub:')) return STUB
    },
  }
}

const config: StorybookConfig = {
  stories: ['../packages/*/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config: UserConfig) {
    // Ensure react-strict-dom's css.create() calls are compiled by the babel plugin.
    // Without this, dev mode serves uncompiled RSD code that errors at runtime.

    // Remove Storybook's default react plugin (we need our own with babel config).
    // Also remove react-docgen — its babel parser chokes on TypeScript syntax
    // in .storybook/preview.tsx and we don't need generated prop tables.
    config.plugins = await withoutVitePlugins(config.plugins, [
      'vite:react-babel',
      'vite:react-refresh',
      'storybook:react-docgen-plugin',
    ])

    config.plugins.push(
      stubReactNative(),
      react({babel: {configFile: true}}),
      babel(),
    )

    config.resolve = {
      ...config.resolve,
      extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    }

    // Stub react-native during esbuild dep optimization so react-native-svg
    // can be pre-bundled (CJS→ESM) without pulling in RN's Flow source.
    const rnShimPath = resolve(dirname(fileURLToPath(import.meta.url)), '../packages/ui/src/stubs/react-native.ts')
    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.esbuildOptions = config.optimizeDeps.esbuildOptions || {}
    config.optimizeDeps.esbuildOptions.plugins = config.optimizeDeps.esbuildOptions.plugins || []
    config.optimizeDeps.esbuildOptions.plugins.push({
      name: 'stub-react-native',
      setup(build) {
        build.onResolve({filter: /^react-native$/}, () => ({path: rnShimPath}))
        build.onResolve({filter: /^react-native\//}, () => ({
          path: 'rn-stub',
          namespace: 'rn-stub',
        }))
        build.onLoad({filter: /.*/, namespace: 'rn-stub'}, () => ({
          contents: 'export default {};',
          loader: 'js',
        }))
      },
    })

    // Storybook sets server.fs.strict but doesn't initialize the allow list,
    // so its own allow-storybook-dir plugin silently no-ops.
    const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
    config.server = config.server || {}
    config.server.fs = config.server.fs || {}
    config.server.fs.allow = config.server.fs.allow || []
    config.server.fs.allow.push(projectRoot)

    return config
  },
}

export default config
