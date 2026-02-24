import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        presets: [
          [
            "react-strict-dom/babel-preset",
            {
              debug: false,
              dev: true,
              platform: "web",
            },
          ],
        ],
      },
    }),
  ],
  resolve: {
    extensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js"],
  },
});
