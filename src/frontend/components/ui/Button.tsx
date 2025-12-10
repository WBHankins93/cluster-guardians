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
    "font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed medieval-button relative overflow-hidden border-2";

  const variants = {
    primary: "bg-gradient-to-r from-k8s-blue to-k8s-blue-dark hover:from-k8s-blue-light hover:to-k8s-blue text-white border-fantasy-gold/50 hover:border-fantasy-gold shadow-medieval hover:shadow-glow disabled:hover:from-k8s-blue disabled:hover:to-k8s-blue",
    secondary:
      "bg-gradient-to-r from-fantasy-bronze/40 to-fantasy-stone-dark/60 hover:from-fantasy-bronze/60 hover:to-fantasy-stone-dark/80 text-fantasy-parchment border-fantasy-gold/40 hover:border-fantasy-gold/70 shadow-medieval disabled:hover:from-fantasy-bronze/40 disabled:hover:to-fantasy-stone-dark/60",
    danger: "bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white border-red-500/50 hover:border-red-400 shadow-medieval disabled:hover:from-red-700 disabled:hover:to-red-800",
    ghost:
      "bg-transparent/20 hover:bg-fantasy-stone-dark/40 text-fantasy-parchment border-fantasy-gold/30 hover:border-fantasy-gold/50 shadow-medieval disabled:hover:bg-transparent/20",
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
