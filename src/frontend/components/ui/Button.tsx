import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-k8s-blue hover:bg-k8s-blue-light text-white disabled:hover:bg-k8s-blue",
    secondary:
      "bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600 disabled:hover:bg-gray-700",
    danger: "bg-red-600 hover:bg-red-500 text-white disabled:hover:bg-red-600",
    ghost:
      "bg-transparent hover:bg-gray-800 text-gray-300 border border-gray-600 disabled:hover:bg-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
