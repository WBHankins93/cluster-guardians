"use client";

import { Tooltip } from "./Tooltip";

interface HelpIconProps {
  content: string;
  className?: string;
}

export function HelpIcon({ content, className = "" }: HelpIconProps) {
  return (
    <Tooltip content={content} position="right">
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-terminal-cyan/10 text-terminal-cyan text-xs font-mono cursor-help hover:bg-terminal-cyan/20 border border-terminal-cyan/30 transition-colors ${className}`}
        title={content}
      >
        ?
      </span>
    </Tooltip>
  );
}
