import type {StorybookConfig} from '@storybook/react-vite'
import type {UserConfig} from 'vite'
import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel'

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

    // Remove any existing react plugin (Storybook adds one by default)
    config.plugins = (config.plugins || []).filter((plugin: any) => {
      const name = Array.isArray(plugin) ? plugin[0]?.name : plugin?.name
      return name !== 'vite:react-babel' && name !== 'vite:react-refresh'
    })

    config.plugins.push(
      react({babel: {configFile: true}}),
      babel(),
    )

    config.resolve = {
      ...config.resolve,
      extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    }

    return config
  },
}

export default config
