import type { ReactNode } from "react";

type BadgeTone = "green" | "amber" | "red" | "grey";

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone, children }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
