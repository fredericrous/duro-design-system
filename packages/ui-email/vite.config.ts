import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// Plain React → ESM library. Unlike @duro-app/ui this does NOT use the
// react-strict-dom / StyleX babel preset — email components are plain
// @react-email/components JSX, so we bypass the repo's upward babel config
// (babelrc:false, configFile:false) and let the React plugin's automatic
// runtime handle JSX.
export default defineConfig({
  build: {
    lib: {
      name: 'DuroUIEmail',
      entry: './src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', '@react-email/components', '@duro-app/tokens/raw'],
    },
    sourcemap: true,
    target: 'es2020',
    cssCodeSplit: false,
  },
  plugins: [react({babel: {babelrc: false, configFile: false}}), dts({insertTypesEntry: true})],
  publicDir: false,
})
