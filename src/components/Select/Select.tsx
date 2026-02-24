import type { ReactNode } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { css } from "react-strict-dom";
import { styles } from "./styles.css";

// Bridge helper: extracts className + style from css.props() for base-ui
function rsd(
  ...rsdStyles: Parameters<typeof css.props>
): { className: string; style?: React.CSSProperties } {
  return css.props(...rsdStyles) as { className: string; style?: React.CSSProperties };
}

// --- Root ---
interface RootProps {
  name?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

function Root({ children, ...props }: RootProps) {
  return <BaseSelect.Root {...props}>{children}</BaseSelect.Root>;
}

// --- Trigger ---
interface TriggerProps {
  children: ReactNode;
}

function Trigger({ children }: TriggerProps) {
  return (
    <BaseSelect.Trigger {...rsd(styles.trigger)}>
      {children}
    </BaseSelect.Trigger>
  );
}

// --- Value ---
function Value({ placeholder }: { placeholder?: string }) {
  return <BaseSelect.Value placeholder={placeholder} />;
}

// --- Icon ---
function Icon({ children }: { children?: ReactNode }) {
  return (
    <BaseSelect.Icon {...rsd(styles.icon)}>
      {children ?? <>&#9662;</>}
    </BaseSelect.Icon>
  );
}

// --- Portal ---
function Portal({ children }: { children: ReactNode }) {
  return <BaseSelect.Portal>{children}</BaseSelect.Portal>;
}

// --- Positioner ---
interface PositionerProps {
  side?: "top" | "bottom";
  alignment?: "start" | "center" | "end";
  sideOffset?: number;
  children: ReactNode;
}

function Positioner({ children, ...props }: PositionerProps) {
  return (
    <BaseSelect.Positioner {...props}>{children}</BaseSelect.Positioner>
  );
}

// --- Popup ---
function Popup({ children }: { children: ReactNode }) {
  return (
    <BaseSelect.Popup {...rsd(styles.popup)}>{children}</BaseSelect.Popup>
  );
}

// --- Item ---
interface ItemProps {
  value: string;
  children: ReactNode;
}

function Item({ value, children }: ItemProps) {
  return (
    <BaseSelect.Item value={value} {...rsd(styles.item)}>
      {children}
    </BaseSelect.Item>
  );
}

// --- ItemText ---
function ItemText({ children }: { children: ReactNode }) {
  return <BaseSelect.ItemText>{children}</BaseSelect.ItemText>;
}

export const Select = {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Positioner,
  Popup,
  Item,
  ItemText,
};
