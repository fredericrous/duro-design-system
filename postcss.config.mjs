import reactStrictPostCSS from 'react-strict-dom/postcss-plugin'

export default {
  plugins: [
    reactStrictPostCSS({
      include: [
        'packages/lexical-multi/src/**/*.{ts,tsx}',
        'packages/ui/src/**/*.{ts,tsx}',
      ],
    }),
  ],
}
