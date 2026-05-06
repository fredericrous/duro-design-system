import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      name: 'DuroDiagrams',
      entry: './src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom'],
    },
    sourcemap: true,
    target: 'es2020',
    cssCodeSplit: false,
  },
  plugins: [react({babel: {configFile: false, babelrc: false}}), dts({insertTypesEntry: true})],
  publicDir: false,
})
