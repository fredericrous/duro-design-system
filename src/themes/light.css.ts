import { css } from "react-strict-dom"
import { colors } from "../tokens/colors.css"
import { shadows } from "../tokens/shadows.css"

export const lightTheme = css.createTheme(colors, {
  bg: "#ffffff",
  bgCard: "#f5f5f5",
  bgCardHover: "#e8e8e8",
  text: "#1a1a1a",
  textMuted: "#666666",
  accent: "#2563eb",
  accentHover: "#1d4ed8",
  border: "#d4d4d4",
  error: "#dc2626",
  errorBg: "rgba(220, 38, 38, 0.08)",
  errorBorder: "rgba(220, 38, 38, 0.3)",
  errorText: "#dc2626",
  success: "#16a34a",
  successBg: "rgba(22, 163, 74, 0.08)",
  successBorder: "rgba(22, 163, 74, 0.3)",
  successText: "#16a34a",
  warning: "#d97706",
  warningBg: "rgba(217, 119, 6, 0.08)",
  warningBorder: "rgba(217, 119, 6, 0.3)",
  warningText: "#d97706",
  infoBg: "rgba(37, 99, 235, 0.08)",
  infoBorder: "rgba(37, 99, 235, 0.3)",
  infoText: "#2563eb",
})

export const lightShadows = css.createTheme(shadows, {
  sm: "0 2px 4px rgba(0, 0, 0, 0.08)",
  md: "0 4px 12px rgba(0, 0, 0, 0.12)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.16)",
})
