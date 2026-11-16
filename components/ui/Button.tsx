import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "secondary"
      ? "button-secondary"
      : variant === "danger"
        ? "button-danger"
        : "";
  return (
    <button
      type={type}
      className={`button ${variantClass} ${className}`.trim()}
      {...props}
    />
  );
}
