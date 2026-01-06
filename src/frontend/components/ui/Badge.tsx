import { ReactNode } from "react";
import clsx from "clsx";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  size?: "sm" | "md" | "lg";
  className?: string;
  pulse?: boolean;
}

export function Badge({ children, variant = "default", size = "md", className, pulse = false }: BadgeProps) {
  const variants = {
    default: "bg-terminal-panel text-terminal-white border border-terminal-border",
    success: "bg-terminal-green/10 text-terminal-green border border-terminal-green/50 status-glow-green",
    warning: "bg-terminal-amber/10 text-terminal-amber border border-terminal-amber/50 status-glow-yellow",
    danger: "bg-terminal-red/10 text-terminal-red border border-terminal-red/50 status-glow-red",
    info: "bg-terminal-cyan/10 text-terminal-cyan border border-terminal-cyan/50",
    purple: "bg-terminal-purple/10 text-terminal-purple border border-terminal-purple/50",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const pulseStyles = pulse ? "animate-pulse" : "";

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded font-mono font-medium",
        variants[variant],
        sizes[size],
        pulseStyles,
        className
      )}
    >
      {children}
    </span>
  );
}

// Status badge with dot indicator
export function StatusBadge({
  status,
  label,
  className,
}: {
  status: "online" | "offline" | "warning" | "error";
  label?: string;
  className?: string;
}) {
  const statusColors = {
    online: "bg-terminal-green",
    offline: "bg-terminal-gray",
    warning: "bg-terminal-amber",
    error: "bg-terminal-red",
  };

  const textColors = {
    online: "text-terminal-green",
    offline: "text-terminal-gray",
    warning: "text-terminal-amber",
    error: "text-terminal-red",
  };

  return (
    <span className={clsx("inline-flex items-center gap-2 font-mono text-sm", className)}>
      <span
        className={clsx(
          "w-2 h-2 rounded-full",
          statusColors[status],
          status === "online" && "animate-pulse"
        )}
      />
      {label && <span className={textColors[status]}>{label}</span>}
    </span>
  );
}
