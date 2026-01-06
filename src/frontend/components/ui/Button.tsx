import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  glow?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  glow = false,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-mono font-semibold rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cyber-button relative overflow-hidden border";

  const variants = {
    primary:
      "bg-terminal-green/10 hover:bg-terminal-green/20 text-terminal-green border-terminal-green/50 hover:border-terminal-green hover:shadow-glow-green disabled:hover:bg-terminal-green/10 disabled:hover:border-terminal-green/50",
    secondary:
      "bg-terminal-panel hover:bg-terminal-border/50 text-terminal-white border-terminal-border hover:border-terminal-cyan/50 disabled:hover:bg-terminal-panel",
    danger:
      "bg-terminal-red/10 hover:bg-terminal-red/20 text-terminal-red border-terminal-red/50 hover:border-terminal-red hover:shadow-glow-red disabled:hover:bg-terminal-red/10",
    ghost:
      "bg-transparent hover:bg-terminal-green/10 text-terminal-green/70 hover:text-terminal-green border-transparent hover:border-terminal-green/30 disabled:hover:bg-transparent",
    outline:
      "bg-transparent hover:bg-terminal-cyan/10 text-terminal-cyan border-terminal-cyan/50 hover:border-terminal-cyan hover:shadow-glow-cyan disabled:hover:bg-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const glowStyles = glow ? "animate-pulse-glow" : "";

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], glowStyles, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
