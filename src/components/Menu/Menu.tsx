import type { ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { css } from "react-strict-dom";
import { styles } from "./styles.css";

// Bridge helper
function rsd(
  ...rsdStyles: Parameters<typeof css.props>
): { className: string; style?: React.CSSProperties } {
  return css.props(...rsdStyles) as { className: string; style?: React.CSSProperties };
}

// --- Root ---
interface RootProps {
  modal?: boolean;
  children: ReactNode;
}

function Root({ children, ...props }: RootProps) {
  return <BaseMenu.Root {...props}>{children}</BaseMenu.Root>;
}

// --- Trigger ---
function Trigger({ children }: { children: ReactNode }) {
  return (
    <BaseMenu.Trigger {...rsd(styles.trigger)}>
      {children}
    </BaseMenu.Trigger>
  );
}

// --- Portal ---
function Portal({ children }: { children: ReactNode }) {
  return <BaseMenu.Portal>{children}</BaseMenu.Portal>;
}

// --- Positioner ---
interface PositionerProps {
  side?: "top" | "bottom";
  alignment?: "start" | "center" | "end";
  sideOffset?: number;
  children: ReactNode;
}

function Positioner({ children, ...props }: PositionerProps) {
  return <BaseMenu.Positioner {...props}>{children}</BaseMenu.Positioner>;
}

// --- Popup ---
function Popup({ children }: { children: ReactNode }) {
  return (
    <BaseMenu.Popup {...rsd(styles.popup)}>{children}</BaseMenu.Popup>
  );
}

// --- Item ---
interface ItemProps {
  onClick?: () => void;
  children: ReactNode;
}

function Item({ onClick, children }: ItemProps) {
  return (
    <BaseMenu.Item onClick={onClick} {...rsd(styles.item)}>
      {children}
    </BaseMenu.Item>
  );
}

// --- LinkItem ---
interface LinkItemProps {
  href: string;
  children: ReactNode;
}

function LinkItem({ href, children }: LinkItemProps) {
  return (
    <BaseMenu.Item
      render={<a href={href} />}
      {...rsd(styles.item)}
    >
      {children}
    </BaseMenu.Item>
  );
}

export const Menu = {
  Root,
  Trigger,
  Portal,
  Positioner,
  Popup,
  Item,
  LinkItem,
};
