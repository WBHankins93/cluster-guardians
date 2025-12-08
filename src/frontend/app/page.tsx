"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartGame = () => {
    setIsStarting(true);
    router.push("/game");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-k8s-blue-light tracking-tight">
            Cluster Guardians
          </h1>
          <p className="text-xl text-gray-400">
            Learn Kubernetes Through Adventure
          </p>
        </div>

        {/* Game Description */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 space-y-4">
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-k8s-blue mb-2">
                Story-Driven Learning
              </h3>
              <p className="text-sm text-gray-400">
                Explore worlds representing Kubernetes concepts, solve puzzles,
                and defeat corruption bosses
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🔧</div>
              <h3 className="font-semibold text-k8s-blue mb-2">
                Hands-On Challenges
              </h3>
              <p className="text-sm text-gray-400">
                Terminal rifts let you practice real kubectl commands against a
                simulated cluster
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🧱</div>
              <h3 className="font-semibold text-k8s-blue mb-2">
                Lightweight Simulation
              </h3>
              <p className="text-sm text-gray-400">
                No cloud costs, no cluster required. Learn at your own pace
                offline
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="space-y-4">
          <button
            onClick={handleStartGame}
            disabled={isStarting}
            className="px-8 py-4 bg-k8s-blue hover:bg-k8s-blue-light disabled:bg-gray-600
                     text-white font-semibold rounded-lg text-lg transition-colors
                     disabled:cursor-not-allowed"
          >
            {isStarting ? "Loading..." : "Begin Your Journey"}
          </button>
          <p className="text-sm text-gray-500">
            Start in the Namespace Forest and master Pods, Deployments,
            Services, and more
          </p>
        </div>

        {/* Version */}
        <div className="text-xs text-gray-600 font-mono">
          v0.1.0 MVP - World 1: Namespace Forest
        </div>
      </div>
    </main>
  );
}
