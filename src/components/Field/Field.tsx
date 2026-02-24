import { type ReactNode, useId, useMemo } from "react";
import { html } from "react-strict-dom";
import { FieldContext, useFieldContext } from "./FieldContext";
import { styles } from "./styles.css";

// --- Root ---
interface RootProps {
  invalid?: boolean;
  children: ReactNode;
}

function Root({ invalid = false, children }: RootProps) {
  const id = useId();
  const ctx = useMemo(
    () => ({
      controlId: `${id}-control`,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      invalid,
    }),
    [id, invalid],
  );

  return (
    <FieldContext.Provider value={ctx}>
      <html.div style={styles.root}>{children}</html.div>
    </FieldContext.Provider>
  );
}

// --- Label ---
interface LabelProps {
  children: ReactNode;
}

function Label({ children }: LabelProps) {
  const ctx = useFieldContext();
  return (
    <html.label for={ctx?.controlId} style={styles.label}>
      {children}
    </html.label>
  );
}

// --- Description ---
interface DescriptionProps {
  children: ReactNode;
}

function Description({ children }: DescriptionProps) {
  const ctx = useFieldContext();
  return (
    <html.span id={ctx?.descriptionId} style={styles.description}>
      {children}
    </html.span>
  );
}

// --- Error ---
interface ErrorProps {
  children?: ReactNode;
}

function Error({ children }: ErrorProps) {
  const ctx = useFieldContext();
  if (!ctx?.invalid && !children) return null;

  return (
    <html.span id={ctx?.errorId} role="alert" style={styles.error}>
      {children}
    </html.span>
  );
}

export const Field = {
  Root,
  Label,
  Description,
  Error,
};
