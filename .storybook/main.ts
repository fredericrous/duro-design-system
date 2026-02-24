import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  framework: "@storybook/react-vite",
  addons: [
    "@storybook/addon-a11y",
  ],
  typescript: {
    reactDocgen: false,
  },
};

export default config;
