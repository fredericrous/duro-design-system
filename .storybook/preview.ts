import type { Preview } from "@storybook/react-vite";
import "../src/strict.css";
import "../src/tokens/global-reset.css";
import { ThemeDecorator } from "./ThemeDecorator";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Global theme for components",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "light", title: "Light", icon: "sun" },
          { value: "high-contrast", title: "High Contrast", icon: "eye" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "dark",
    backgrounds: { value: "transparent" },
  },
  decorators: [ThemeDecorator],
};

export default preview;
