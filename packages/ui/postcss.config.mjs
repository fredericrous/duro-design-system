import babelConfig from '../../babel.config.js'
import reactStrictPostCSS from 'react-strict-dom/postcss-plugin'

export default {
  plugins: [
    reactStrictPostCSS({
      include: [
        '../tokens/src/**/*.{ts,tsx}',
        'src/**/*.css.ts',
      ],
      babelConfig,
    }),
  ],
}
