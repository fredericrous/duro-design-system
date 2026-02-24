import { html } from "react-strict-dom";
import { useFieldContext } from "../Field/FieldContext";
import { styles } from "./styles.css";

type StrictInputProps = React.ComponentProps<typeof html.input>;
export type InputType = NonNullable<StrictInputProps["type"]>;

export type InputVariant = "default" | "error";

interface InputProps {
  variant?: InputVariant;
  type?: InputType;
  name?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: "on" | "off" | "email" | "username" | "current-password" | "new-password" | "name" | "tel" | "url";
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
