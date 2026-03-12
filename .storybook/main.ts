import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import type {StorybookConfig} from '@storybook/react-vite'
import type {UserConfig} from 'vite'
import {withoutVitePlugins} from '@storybook/builder-vite'
import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel'

const config: StorybookConfig = {
  stories: [
    '../packages/*/src/**/*.stories.@(ts|tsx)',
    '../packages/*/src/**/*.mdx',
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

    config.plugins.push(
      react({babel: {configFile: true}}),
      babel(),
    )

    config.resolve = {
      ...config.resolve,
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
