import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'
import babel from 'vite-plugin-babel'

export default defineConfig({
  build: {
    lib: {
      name: 'DuroTokens',
      entry: {
        index: './src/index.ts',
        raw: './src/raw.ts',
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
    dts({insertTypesEntry: true}),
  ],
  publicDir: false,
})
