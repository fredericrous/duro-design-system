import type { ReactNode } from "react";
import { css, html } from "react-strict-dom";
import { lightTheme, lightShadows } from "../../themes/light.css";
import {
  highContrastTheme,
  highContrastShadows,
} from "../../themes/high-contrast.css";

export type ThemeName = "dark" | "light" | "high-contrast";

interface ThemeProviderProps {
  theme?: ThemeName;
  children: ReactNode;
}

const themeMap: Record<
  string,
  readonly [ReturnType<typeof css.createTheme>, ReturnType<typeof css.createTheme>]
> = {
  light: [lightTheme, lightShadows],
  "high-contrast": [highContrastTheme, highContrastShadows],
};

const styles = css.create({
  root: {
    display: "contents",
  },
});

export function ThemeProvider({ theme = "dark", children }: ThemeProviderProps) {
  const overrides = themeMap[theme];

  return (
    <html.div style={[overrides?.[0], overrides?.[1], styles.root]}>
      {children}
    </html.div>
  );
}
