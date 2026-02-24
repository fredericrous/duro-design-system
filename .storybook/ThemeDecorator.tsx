import type { Decorator } from "@storybook/react-vite";
import { css, html } from "react-strict-dom";
import {
  ThemeProvider,
  type ThemeName,
} from "../src/components/ThemeProvider/ThemeProvider";
import { colors } from "../src/tokens/colors.css";
import { typography } from "../src/tokens/typography.css";

const styles = css.create({
  wrapper: {
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: typography.fontFamily,
    padding: 24,
    minHeight: "100%",
  },
});

export const ThemeDecorator: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? "dark") as ThemeName;

  return (
    <ThemeProvider theme={theme}>
      <html.div style={styles.wrapper}>
        <Story />
      </html.div>
    </ThemeProvider>
  );
};
