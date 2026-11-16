import type { ReactNode } from "react";

type AlertTone = "danger" | "warning" | "success" | "info";

interface AlertProps {
  tone: AlertTone;
  title: string;
  children: ReactNode;
}

/**
 * Semantic alert panel. The tone is always paired with a text title, so
 * meaning never depends on colour alone.
 */
export function Alert({ tone, title, children }: AlertProps) {
  return (
    <div className={`alert alert-${tone}`} role="status">
      <strong>{title}</strong>
      <div>{children}</div>
    </div>
  );
}
