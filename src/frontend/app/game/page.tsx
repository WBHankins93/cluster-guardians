"use client";

import dynamic from "next/dynamic";

const NamespaceForest = dynamic(() => import("@/worlds/NamespaceForest"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-k8s-blue-light text-2xl">Loading Namespace Forest...</div>
    </div>
  ),
});

export default function GamePage() {
  return <NamespaceForest />;
}
