import { css } from "react-strict-dom"
import { colors } from "../tokens/colors.css"
import { shadows } from "../tokens/shadows.css"

export const highContrastTheme = css.createTheme(colors, {
  bg: "#000000",
  bgCard: "#111111",
  bgCardHover: "#1a1a1a",
  text: "#ffffff",
  textMuted: "#b0b0b0",
  accent: "#60a5fa",
  accentHover: "#93c5fd",
  accentContrast: "#000000",
  border: "#555555",
  error: "#f87171",
  errorHover: "#fca5a5",
  errorBg: "rgba(248, 113, 113, 0.15)",
  errorBorder: "rgba(248, 113, 113, 0.5)",
  errorText: "#fca5a5",
  errorContrast: "#000000",
  success: "#4ade80",
  successBg: "rgba(74, 222, 128, 0.15)",
  successBorder: "rgba(74, 222, 128, 0.5)",
  successText: "#86efac",
  warning: "#fcd34d",
  warningBg: "rgba(252, 211, 77, 0.15)",
  warningBorder: "rgba(252, 211, 77, 0.5)",
  warningText: "#fef08a",
  infoBg: "rgba(96, 165, 250, 0.15)",
  infoBorder: "rgba(96, 165, 250, 0.5)",
  infoText: "#bfdbfe",
})

export const highContrastShadows = css.createTheme(shadows, {
  sm: "0 2px 4px rgba(0, 0, 0, 0.6)",
  md: "0 4px 12px rgba(0, 0, 0, 0.7)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.8)",
})
