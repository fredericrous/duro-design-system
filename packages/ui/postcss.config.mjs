import babelConfig from '../../babel.config.js'
import reactStrictPostCSS from 'react-strict-dom/postcss-plugin'

export default {
  plugins: [
    reactStrictPostCSS({
      include: ['../tokens/src/**/*.{ts,tsx}', 'src/**/*.css.ts', 'src/components/**/*.tsx'],
      // Native files never reach the web stylesheet, and their createTheme
      // calls take runtime values, which StyleX's static extraction rejects.
      exclude: ['**/*.native.*'],
      babelConfig,
    }),
  ],
}
