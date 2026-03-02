import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'
import babel from 'vite-plugin-babel'

export default defineConfig({
  build: {
    lib: {
      name: 'DuroTokens',
      entry: './src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react-strict-dom'],
    },
    sourcemap: true,
    target: 'es2020',
    cssCodeSplit: false,
  },
  plugins: [babel(), dts({insertTypesEntry: true})],
  publicDir: false,
})
