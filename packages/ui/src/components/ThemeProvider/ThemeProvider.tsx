import type { ReactNode } from "react"
import { css, html } from "react-strict-dom"
import { lightTheme, lightShadows } from "../../themes/light.css"
import { highContrastTheme, highContrastShadows } from "../../themes/high-contrast.css"

export type ThemeName = "dark" | "light" | "high-contrast"

interface ThemeProviderProps {
  theme?: ThemeName
  children: ReactNode
}

const themeMap: Partial<Record<ThemeName, readonly [typeof lightTheme, typeof lightShadows]>> = {
  light: [lightTheme, lightShadows],
  "high-contrast": [highContrastTheme, highContrastShadows],
}

const styles = css.create({
  root: {
    display: "contents",
  },
})

// react-strict-dom's style prop rejects Theme<VarGroup<{named keys}>> because the
// concrete VarGroup lacks the generic index signature. This is a known typing gap.
type DivStyle = Parameters<typeof html.div>[0]["style"]

export function ThemeProvider({ theme = "dark", children }: ThemeProviderProps) {
  const overrides = themeMap[theme]
  const themeStyles = [overrides?.[0], overrides?.[1], styles.root] as DivStyle

  return <html.div style={themeStyles}>{children}</html.div>
}
