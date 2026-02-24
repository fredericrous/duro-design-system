import babelConfig from "./babel.config.js"

export default {
  plugins: {
    "react-strict-dom/postcss-plugin": {
      include: ["src/**/*.{ts,tsx}", ".storybook/**/*.{ts,tsx}"],
      babelConfig,
      useLayers: true,
    },
  },
}
