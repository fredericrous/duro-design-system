import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const rsdPlugin = require.resolve('react-strict-dom/babel-preset').replace('preset.js', 'plugin.js')
const dev = process.env.NODE_ENV !== 'production'

export default {
  parserOpts: {
    plugins: ['typescript', 'jsx'],
  },
  plugins: [
    ['babel-plugin-react-compiler', {}],
    [rsdPlugin, {debug: true}],
    [
      '@stylexjs/babel-plugin',
      {
        debug: true,
        dev,
        importSources: [{from: 'react-strict-dom', as: 'css'}],
        runtimeInjection: false,
        styleResolution: 'property-specificity',
        unstable_moduleResolution: {
          rootDir: process.cwd(),
          themeFileExtension: '.css',
          type: 'commonJS',
        },
      },
    ],
  ],
}
