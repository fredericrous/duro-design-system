import { resolve } from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import babel from "vite-plugin-babel"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        configFile: true,
      },
    }),
    babel(),
    dts({ tsconfigPath: "./tsconfig.json" }),
  ],
  resolve: {
    extensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js"],
  },
  ssr: {
    noExternal: ["react-strict-dom"],
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "react-strict-dom"],
    },
  },
})
