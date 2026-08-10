import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {defineConfig} from 'vitest/config'
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin'
import {playwright} from '@vitest/browser-playwright'

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  optimizeDeps: {
    include: ['react-strict-dom/runtime', 'react', 'react-dom', 'react/jsx-runtime'],
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({configDir: path.join(dirname, '.storybook')})],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            // Use the chromium-headless-shell build (a single, smaller asset)
            // instead of full Chrome for Testing — fewer/smaller downloads from
            // cdn.playwright.dev, which the runner's egress chokes on.
            provider: playwright({launchOptions: {channel: 'chromium-headless-shell'}}),
            instances: [{browser: 'chromium'}],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
      {
        // No `extends: true`: the root config's optimizeDeps is browser-project
        // plumbing and doesn't apply to Node-side rule tests.
        test: {
          name: 'unit',
          environment: 'node',
          include: ['packages/eslint-plugin/test/**/*.test.ts'],
          setupFiles: ['packages/eslint-plugin/test/setup.ts'],
        },
      },
    ],
  },
})
