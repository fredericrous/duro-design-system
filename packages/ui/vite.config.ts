import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import babel from 'vite-plugin-babel'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      name: 'DuroUI',
      // Two entries, so the TanStack-aware code is a separate chunk the root
      // never pulls in. One entry would put `@tanstack/react-table` back in
      // the root's graph and undo the point of the `./table` subpath.
      entry: {
        index: './src/index.ts',
        table: './src/table.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'react-hook-form',
        '@hookform/resolvers/effect-ts',
        'effect',
        'effect/Schema',
        '@tanstack/react-table',
        '@tanstack/react-virtual',
      ],
      output: {
        // With one entry Rollup named the CSS bundle after it ("index.css").
        // With several it falls back to the package name ("ui.css"), which
        // silently breaks every consumer importing
        // "@duro-app/ui/dist/index.css" — a resolve error in their build, not
        // ours. Pin the name so splitting the JS entries stays invisible to
        // the stylesheet's path.
        assetFileNames: (info) => {
          const name = info.names?.[0] ?? info.name ?? ''
          return name.endsWith('.css') ? 'index.css' : '[name][extname]'
        },
      },
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
