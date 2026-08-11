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
        // Alias the tokens subpaths to their src/*.ts files so the drift
        // tests don't depend on the tokens package having been built first
        // (CI's lint job never builds it — Node would demand dist/keys.js).
        resolve: {
          alias: {
            '@duro-app/tokens/keys': path.join(dirname, 'packages/tokens/src/keys.ts'),
            '@duro-app/tokens/raw': path.join(dirname, 'packages/tokens/src/raw.ts'),
          },
        },
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
