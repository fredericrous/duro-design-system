import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'
import path from 'node:path'
import {addDtsExtensions} from '../../scripts/dts-extensions.mjs'
import babel from 'vite-plugin-babel'

export default defineConfig({
  build: {
    lib: {
      name: 'DuroTokens',
      entry: {
        index: './src/index.ts',
        raw: './src/raw.ts',
        theme: './src/theme.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['react-strict-dom'],
    },
    sourcemap: true,
    target: 'es2020',
    cssCodeSplit: false,
  },
  plugins: [
    babel({filter: /\.(tsx?|jsx?)$/, babelConfig: {rootMode: 'upward'}}),
    dts({
      insertTypesEntry: true,
      afterBuild: () => addDtsExtensions(path.resolve(__dirname, 'dist')),
    }),
  ],
  publicDir: false,
})
