import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import babel from 'vite-plugin-babel'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      name: 'DuroUI',
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
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    alias: {
      'react-native': path.resolve(__dirname, 'src/stubs/react-native.ts'),
      '@react-native/assets-registry/registry': path.resolve(
        __dirname,
        'src/stubs/assets-registry.ts',
      ),
    },
  },
  plugins: [react({babel: {configFile: true}}), babel(), dts({insertTypesEntry: true})],
  publicDir: false,
})
