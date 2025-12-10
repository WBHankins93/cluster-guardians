import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "bordered" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  className,
  variant = "default",
  padding = "md",
}: CardProps) {
  const variants = {
    default: "medieval-card bg-gradient-to-b from-fantasy-stone-dark to-fantasy-stone",
    bordered: "medieval-card bg-gradient-to-b from-fantasy-stone-dark to-fantasy-stone border-4 border-fantasy-gold/40",
    elevated: "medieval-card bg-gradient-to-b from-fantasy-stone-dark to-fantasy-stone shadow-medieval-lg",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div className={clsx("rounded-lg", variants[variant], paddings[padding], className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={clsx("mb-4", className)}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return <h3 className={clsx("text-xl font-bold text-fantasy-gold font-fantasy", className)}>{children}</h3>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={clsx("text-fantasy-parchment", className)}>{children}</div>;
}
