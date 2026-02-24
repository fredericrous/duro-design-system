import { html } from "react-strict-dom";
import { useFieldContext } from "../Field/FieldContext";
import { styles } from "./styles.css";

export type InputVariant = "default" | "error";

interface InputProps {
  variant?: InputVariant;
  type?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input({
  variant = "default",
  type = "text",
  name,
  placeholder,
  required,
  minLength,
  pattern,
  autoComplete,
  value,
  defaultValue,
  disabled,
  onChange,
}: InputProps) {
  const ctx = useFieldContext();

  return (
    <html.input
      id={ctx?.controlId}
      type={type}
      name={name}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
      pattern={pattern}
      autoComplete={autoComplete}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      aria-describedby={
        ctx
          ? `${ctx.descriptionId} ${ctx.invalid ? ctx.errorId : ""}`.trim()
          : undefined
      }
      aria-invalid={ctx?.invalid || variant === "error" || undefined}
      onChange={onChange}
      style={[styles.base, styles[variant]]}
    />
  );
}
