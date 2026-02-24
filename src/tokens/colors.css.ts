import { css } from "react-strict-dom"

export const colors = css.defineVars({
  // Backgrounds
  bg: "#0f0f0f",
  bgCard: "#1a1a1a",
  bgCardHover: "#242424",

  // Text
  text: "#e5e5e5",
  textMuted: "#888888",

  // Accent
  accent: "#3b82f6",
  accentHover: "#2563eb",

  // Border
  border: "#333333",

  // Semantic — Error
  error: "#ef4444",
  errorBg: "rgba(239, 68, 68, 0.1)",
  errorBorder: "rgba(239, 68, 68, 0.3)",
  errorText: "#fca5a5",

  // Semantic — Success
  success: "#22c55e",
  successBg: "rgba(34, 197, 94, 0.1)",
  successBorder: "rgba(34, 197, 94, 0.3)",
  successText: "#86efac",

  // Semantic — Warning
  warning: "#fbbf24",
  warningBg: "rgba(251, 191, 36, 0.1)",
  warningBorder: "rgba(251, 191, 36, 0.3)",
  warningText: "#fde68a",

  // Semantic — Info (uses accent)
  infoBg: "rgba(59, 130, 246, 0.1)",
  infoBorder: "rgba(59, 130, 246, 0.3)",
  infoText: "#93c5fd",
})
