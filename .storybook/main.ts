import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import type {StorybookConfig} from '@storybook/react-vite'
import type {UserConfig} from 'vite'
import {withoutVitePlugins} from '@storybook/builder-vite'
import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel'
import {webGraphGuard} from '../packages/ui/vite/web-graph-guard'

const config: StorybookConfig = {
  stories: [
    '../packages/*/src/**/*.stories.@(ts|tsx)',
    '../packages/*/src/**/*.mdx',
    '../docs/ai/recipes/*.stories.@(ts|tsx)',
  ],
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

    config.plugins.push(webGraphGuard(), react({babel: {configFile: true}}), babel())

    // @duro-app/tokens/theme is the one tokens entry built to dist/ (the CLI runs it
    // under Node); every other entry points at src. Read its source here too, so
    // Storybook and its tests need no library build first.
    const tokensTheme = {
      find: /^@duro-app\/tokens\/theme$/,
      replacement: resolve(
        dirname(fileURLToPath(import.meta.url)),
        '../packages/tokens/src/theme.ts',
      ),
    }
    const alias = config.resolve?.alias
    config.resolve = {
      ...config.resolve,
      alias: Array.isArray(alias)
        ? [tokensTheme, ...alias]
        : [
            tokensTheme,
            ...Object.entries(alias ?? {}).map(([find, replacement]) => ({find, replacement})),
          ],
      extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    }

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
