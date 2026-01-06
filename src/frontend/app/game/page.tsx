"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const NamespaceForest = dynamic(() => import("@/worlds/NamespaceForest"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center scanlines">
      {/* Circuit background */}
      <div className="fixed inset-0 circuit-bg opacity-20 pointer-events-none" />

      <div className="text-center space-y-6 relative z-10">
        {/* Loading animation */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto relative">
            {/* Outer ring */}
            <div className="absolute inset-0 border-2 border-terminal-green/30 rounded-full animate-pulse" />
            {/* Middle ring */}
            <div className="absolute inset-2 border-2 border-terminal-cyan/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
            {/* Inner ring */}
            <div className="absolute inset-4 border-2 border-terminal-green/50 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            {/* Center dot */}
            <div className="absolute inset-8 bg-terminal-green/20 rounded-full animate-pulse" />
            <div className="absolute inset-9 bg-terminal-green rounded-full shadow-glow-green" />
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <div className="text-terminal-green text-2xl font-mono font-bold animate-text-glow">
            SECTOR_01: NAMESPACE_FOREST
          </div>
          <div className="text-terminal-cyan text-sm font-mono">
            Establishing secure connection...
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-terminal-panel rounded-full overflow-hidden border border-terminal-green/20">
            <div
              className="h-full bg-gradient-to-r from-terminal-green to-terminal-cyan animate-pulse"
              style={{
                width: '60%',
                animation: 'pulse 1s ease-in-out infinite',
              }}
            />
          </div>
          <div className="text-xs text-terminal-gray font-mono mt-2">
            Loading cluster protocols...
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function GamePage() {
  return (
    <ErrorBoundary>
      <NamespaceForest />
    </ErrorBoundary>
  );
}
