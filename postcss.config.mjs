import reactStrictPostCSS from 'react-strict-dom/postcss-plugin'

export default {
  plugins: [
    reactStrictPostCSS({
      include: ['packages/tokens/src/**/*.{ts,tsx}', 'packages/ui/src/**/*.{ts,tsx}'],
      // Native files never reach the web stylesheet, and their createTheme
      // calls take runtime values, which StyleX's static extraction rejects.
      exclude: ['**/*.native.*'],
    }),
  ],
}
