import { type ReactNode, createContext, useContext, useState, useCallback } from "react";
import { html } from "react-strict-dom";
import { styles } from "./styles.css";

// --- Context ---
interface MenuContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menu compound components must be used within Menu.Root");
  return ctx;
}

// --- Root ---
interface RootProps {
  children: ReactNode;
}

function Root({ children }: RootProps) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <MenuContext.Provider value={{ open, toggle, close }}>
      <html.div style={styles.root}>{children}</html.div>
    </MenuContext.Provider>
  );
}

// --- Trigger ---
function Trigger({ children }: { children: ReactNode }) {
  const { toggle } = useMenu();

  return (
    <html.button type="button" onClick={toggle} style={styles.trigger}>
      {children}
    </html.button>
  );
}

// --- Popup ---
function Popup({ children }: { children: ReactNode }) {
  const { open, close } = useMenu();

  if (!open) return null;

  return (
    <>
      <html.div style={styles.backdrop} onClick={close} />
      <html.div role="menu" style={styles.popup}>
        {children}
      </html.div>
    </>
  );
}

// --- Item ---
interface ItemProps {
  onClick?: () => void;
  children: ReactNode;
}

function Item({ onClick, children }: ItemProps) {
  const { close } = useMenu();

  const handleClick = () => {
    onClick?.();
    close();
  };

  return (
    <html.div role="menuitem" onClick={handleClick} style={styles.item}>
      {children}
    </html.div>
  );
}

// --- LinkItem ---
interface LinkItemProps {
  href: string;
  children: ReactNode;
}

function LinkItem({ href, children }: LinkItemProps) {
  const { close } = useMenu();

  return (
    <html.a href={href} onClick={close} role="menuitem" style={[styles.item, styles.linkItem]}>
      {children}
    </html.a>
  );
}

export const Menu = {
  Root,
  Trigger,
  Popup,
  Item,
  LinkItem,
};
