"use client";

import { useState } from "react";
import { Tooltip } from "./Tooltip";

interface HelpIconProps {
  content: string;
  className?: string;
}

export function HelpIcon({ content, className = "" }: HelpIconProps) {
  return (
    <Tooltip content={content} position="right">
      <span
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-k8s-blue/20 text-k8s-blue-light text-xs cursor-help hover:bg-k8s-blue/30 transition-colors ${className}`}
        title={content}
      >
        ?
      </span>
    </Tooltip>
  );
}

