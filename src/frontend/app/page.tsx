"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Animated cluster node component
function ClusterNode({ delay, x, y, size = 8 }: { delay: number; x: string; y: string; size?: number }) {
  return (
    <div
      className="absolute rounded-full bg-terminal-green/20 animate-pulse-slow"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        animationDelay: `${delay}s`,
        boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
      }}
    >
      <div
        className="absolute inset-1 rounded-full bg-terminal-green/40"
        style={{ boxShadow: '0 0 5px rgba(0, 255, 65, 0.5)' }}
      />
    </div>
  );
}

// Network line component
function NetworkLine({ x1, y1, x2, y2, delay }: { x1: string; y1: string; x2: string; y2: string; delay: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="rgba(0, 255, 65, 0.1)"
        strokeWidth="1"
        strokeDasharray="5,5"
        className="animate-pulse-slow"
        style={{ animationDelay: `${delay}s` }}
      />
    </svg>
  );
}

// Terminal typing effect
function TypingText({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(cursorTimer);
    };
  }, [text, speed]);

  return (
    <span>
      {displayText}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} text-terminal-green`}>_</span>
    </span>
  );
}

// Matrix rain effect component
function MatrixRain() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute text-terminal-green text-xs font-mono whitespace-nowrap"
          style={{
            left: `${i * 5}%`,
            top: '-100%',
            animation: `matrix-rain ${15 + Math.random() * 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          {[...Array(30)].map((_, j) => (
            <div key={j} className="opacity-50">
              {String.fromCharCode(0x30A0 + Math.random() * 96)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartGame = () => {
    setIsStarting(true);
    router.push("/game");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-terminal-bg relative overflow-hidden scanlines">
      {/* Background grid pattern */}
      <div className="fixed inset-0 circuit-bg opacity-30 pointer-events-none" />

      {/* Hex pattern overlay */}
      <div className="fixed inset-0 hex-bg opacity-20 pointer-events-none" />

      {/* Matrix rain effect */}
      <MatrixRain />

      {/* Animated cluster nodes */}
      <div className="fixed inset-0 pointer-events-none">
        <ClusterNode delay={0} x="10%" y="20%" size={12} />
        <ClusterNode delay={0.5} x="85%" y="15%" size={10} />
        <ClusterNode delay={1} x="75%" y="70%" size={14} />
        <ClusterNode delay={1.5} x="15%" y="75%" size={8} />
        <ClusterNode delay={2} x="50%" y="10%" size={10} />
        <ClusterNode delay={2.5} x="90%" y="50%" size={12} />
        <ClusterNode delay={3} x="5%" y="45%" size={10} />
        <ClusterNode delay={3.5} x="60%" y="85%" size={8} />

        {/* Network lines connecting nodes */}
        <NetworkLine x1="10%" y1="20%" x2="50%" y2="10%" delay={0} />
        <NetworkLine x1="50%" y1="10%" x2="85%" y2="15%" delay={0.5} />
        <NetworkLine x1="85%" y1="15%" x2="90%" y2="50%" delay={1} />
        <NetworkLine x1="90%" y1="50%" x2="75%" y2="70%" delay={1.5} />
        <NetworkLine x1="15%" y1="75%" x2="60%" y2="85%" delay={2} />
        <NetworkLine x1="5%" y1="45%" x2="10%" y2="20%" delay={2.5} />
      </div>

      {/* Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        {/* Terminal-style header */}
        <div className="terminal-panel p-6 mb-8">
          <div className="terminal-header -m-6 mb-4 rounded-t-lg">
            <div className="terminal-header-dot red" />
            <div className="terminal-header-dot yellow" />
            <div className="terminal-header-dot green" />
            <span className="ml-4 text-sm text-terminal-gray font-mono">cluster-guardians.exe</span>
          </div>

          <div className="text-left font-mono text-sm text-terminal-green/70 mb-4">
            <div className="mb-1">&gt; Initializing secure connection...</div>
            <div className="mb-1">&gt; Loading cluster defense protocols...</div>
            <div className="text-terminal-cyan">&gt; {mounted ? <TypingText text="Welcome to CLUSTER GUARDIANS" speed={40} /> : "Welcome to CLUSTER GUARDIANS"}</div>
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-4">
          <h1
            className="text-6xl md:text-7xl font-bold font-display tracking-wider glitch neon-text"
            data-text="CLUSTER GUARDIANS"
          >
            CLUSTER GUARDIANS
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-terminal-green/50 to-transparent" />
            <p className="text-xl text-terminal-cyan font-mono tracking-wide">
              [ KUBERNETES DEFENSE SYSTEM ]
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-terminal-green/50 to-transparent" />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="cyber-card p-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-terminal-green/10 border border-terminal-green/30 flex items-center justify-center group-hover:bg-terminal-green/20 transition-colors">
                  <svg className="w-5 h-5 text-terminal-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-terminal-green font-mono">
                  STORY_MODE
                </h3>
              </div>
              <p className="text-sm text-terminal-white/70 font-mono leading-relaxed">
                Navigate through cluster sectors, encounter rogue pods, and restore system integrity through narrative missions.
              </p>
            </div>

            <div className="group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-terminal-cyan/10 border border-terminal-cyan/30 flex items-center justify-center group-hover:bg-terminal-cyan/20 transition-colors">
                  <svg className="w-5 h-5 text-terminal-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-terminal-cyan font-mono">
                  TERMINAL_OPS
                </h3>
              </div>
              <p className="text-sm text-terminal-white/70 font-mono leading-relaxed">
                Execute real kubectl commands in a simulated environment. Practice debugging without the risk.
              </p>
            </div>

            <div className="group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-terminal-purple/10 border border-terminal-purple/30 flex items-center justify-center group-hover:bg-terminal-purple/20 transition-colors">
                  <svg className="w-5 h-5 text-terminal-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-terminal-purple font-mono">
                  SANDBOX_ENV
                </h3>
              </div>
              <p className="text-sm text-terminal-white/70 font-mono leading-relaxed">
                Zero cloud costs. No cluster required. Train anywhere, anytime with our lightweight simulation engine.
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="space-y-6">
          <button
            onClick={handleStartGame}
            disabled={isStarting}
            className="group relative px-12 py-5 bg-transparent border-2 border-terminal-green text-terminal-green
                     font-bold font-mono rounded text-xl transition-all duration-300
                     hover:bg-terminal-green hover:text-terminal-black hover:shadow-glow-green
                     disabled:cursor-not-allowed disabled:opacity-50
                     cyber-button"
          >
            <span className="relative z-10 flex items-center gap-3">
              {isStarting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  INITIALIZING...
                </>
              ) : (
                <>
                  <span>&gt;</span>
                  ENTER_CLUSTER
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>

          <p className="text-sm text-terminal-green/60 font-mono">
            &gt; Begin at Sector 01: Namespace Forest<br/>
            &gt; Master pods, deployments, and service protocols
          </p>
        </div>

        {/* System Status */}
        <div className="flex items-center justify-center gap-8 text-xs font-mono text-terminal-gray">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <span>SYSTEM: ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-terminal-cyan" />
            <span>CLUSTER: SIMULATED</span>
          </div>
          <div className="text-terminal-green/50">v0.1.0</div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(10, 14, 20, 0.8), transparent)',
        }}
      />
    </main>
  );
}
