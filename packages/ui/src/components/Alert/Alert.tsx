import type { ReactNode } from "react"
import { html } from "react-strict-dom"
import { styles } from "./styles.css"

export type AlertVariant = "error" | "success" | "warning" | "info"

interface AlertProps {
  variant?: AlertVariant
  children: ReactNode
}

export function Alert({ variant = "info", children }: AlertProps) {
  return (
    <html.div role="alert" style={[styles.base, styles[variant]]}>
      {children}
    </html.div>
  )
}
