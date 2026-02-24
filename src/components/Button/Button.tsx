import type { ReactNode, ButtonHTMLAttributes } from "react";
import { html } from "react-strict-dom";
import { styles } from "./styles.css";

export type ButtonVariant = "primary" | "secondary" | "link" | "danger";
export type ButtonSize = "default" | "small";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: () => void;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "default",
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  children,
}: ButtonProps) {
  return (
    <html.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={[
        styles.base,
        size === "default" ? styles.sizeDefault : styles.sizeSmall,
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
    >
      {children}
    </html.button>
  );
}
