import { ReactNode } from "react";
import clsx from "clsx";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({ children, variant = "default", size = "md", className }: BadgeProps) {
  const variants = {
    default: "bg-fantasy-stone-dark/60 text-fantasy-parchment border-2 border-fantasy-gold/40",
    success: "bg-pod-running/20 text-pod-running border-2 border-pod-running shadow-medieval",
    warning: "bg-pod-pending/20 text-pod-pending border-2 border-pod-pending shadow-medieval",
    danger: "bg-pod-crash/20 text-pod-crash border-2 border-pod-crash shadow-medieval",
    info: "bg-k8s-blue/20 text-k8s-blue-light border-2 border-k8s-blue shadow-medieval",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-lg font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
