"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const NamespaceForest = dynamic(() => import("@/worlds/NamespaceForest"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-b from-fantasy-stone-dark via-purple-900/30 to-fantasy-stone-dark flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-6xl animate-pulse">🌲</div>
        <div className="text-fantasy-gold text-3xl font-fantasy font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(212,175,55,0.5)' }}>
          Entering the Namespace Forest...
        </div>
        <div className="text-fantasy-parchment text-lg">Preparing your quest...</div>
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
