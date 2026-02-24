import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  framework: "@storybook/react-vite",
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
  ],
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};

export default config;
