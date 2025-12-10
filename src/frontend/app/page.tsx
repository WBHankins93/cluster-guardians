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
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-fantasy-stone-dark via-purple-900/30 to-fantasy-stone-dark relative">
      {/* Medieval background pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-7xl font-bold text-fantasy-gold font-fantasy tracking-wide drop-shadow-2xl" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(212,175,55,0.6)' }}>
            Cluster Guardians
          </h1>
          <p className="text-2xl text-fantasy-parchment font-fantasy">
            Master Kubernetes Through Ancient Adventure
          </p>
        </div>

        {/* Game Description */}
        <div className="medieval-card p-8 space-y-4">
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-fantasy-gold font-fantasy mb-2 text-lg">
                Story-Driven Learning
              </h3>
              <p className="text-sm text-fantasy-parchment">
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
            className="medieval-button px-12 py-5 bg-gradient-to-r from-k8s-blue to-k8s-blue-dark hover:from-k8s-blue-light hover:to-k8s-blue 
                     text-white font-bold font-fantasy rounded-lg text-xl transition-all border-4 border-fantasy-gold/50 hover:border-fantasy-gold
                     disabled:cursor-not-allowed shadow-medieval-lg hover:shadow-glow disabled:opacity-50"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
          >
            {isStarting ? "Preparing the Realm..." : "Begin Your Quest"}
          </button>
          <p className="text-base text-fantasy-parchment font-fantasy">
            Enter the Namespace Forest and master the ancient arts of Pods, Deployments, and Services
          </p>
        </div>

        {/* Version */}
        <div className="text-xs text-fantasy-gold/60 font-mono">
          v0.1.0 MVP - World 1: Namespace Forest
        </div>
      </div>
    </main>
  );
}
