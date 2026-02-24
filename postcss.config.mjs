import reactStrictPostCSS from "react-strict-dom/postcss-plugin";

export default {
  plugins: [
    reactStrictPostCSS({
      include: ["src/**/*.{ts,tsx}"],
      babelConfig: {
        presets: ["@babel/preset-typescript"],
      },
    }),
  ],
};
