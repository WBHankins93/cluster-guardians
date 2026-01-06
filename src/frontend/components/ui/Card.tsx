import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "bordered" | "elevated" | "terminal";
  padding?: "none" | "sm" | "md" | "lg";
  glow?: boolean;
}

export function Card({
  children,
  className,
  variant = "default",
  padding = "md",
  glow = false,
}: CardProps) {
  const variants = {
    default: "cyber-card bg-terminal-panel",
    bordered: "cyber-card bg-terminal-panel border border-terminal-green/20",
    elevated: "cyber-card bg-terminal-panel shadow-terminal-lg",
    terminal: "terminal-panel",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  const glowStyles = glow ? "animate-border-pulse" : "";

  return (
    <div className={clsx("rounded-lg", variants[variant], paddings[padding], glowStyles, className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={clsx("mb-4 pb-3 border-b border-terminal-green/10", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glow";
}

export function CardTitle({ children, className, variant = "default" }: CardTitleProps) {
  const titleStyles = variant === "glow"
    ? "text-xl font-bold text-terminal-green font-mono neon-text"
    : "text-xl font-bold text-terminal-green font-mono";

  return <h3 className={clsx(titleStyles, className)}>{children}</h3>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={clsx("text-terminal-white/80 font-mono", className)}>{children}</div>;
}

// Terminal-style card with header dots
export function TerminalCard({
  children,
  title,
  className,
  padding = "md",
}: {
  children: ReactNode;
  title?: string;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div className={clsx("terminal-panel rounded-lg overflow-hidden", className)}>
      <div className="terminal-header">
        <div className="terminal-header-dot red" />
        <div className="terminal-header-dot yellow" />
        <div className="terminal-header-dot green" />
        {title && (
          <span className="ml-3 text-sm text-terminal-gray font-mono">{title}</span>
        )}
      </div>
      <div className={clsx(paddings[padding])}>{children}</div>
    </div>
  );
}
