"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div className="min-h-screen bg-gradient-to-b from-fantasy-stone-dark via-purple-900/30 to-fantasy-stone-dark flex items-center justify-center p-4">
          <div className="medieval-card max-w-2xl w-full p-8 text-center space-y-4">
            <div className="text-6xl">⚔️</div>
            <h1 className="text-3xl font-fantasy font-bold text-fantasy-gold">
              A Mysterious Error Has Occurred
            </h1>
            <p className="text-fantasy-parchment">
              The realm encountered an unexpected issue. Please check the console for details.
            </p>
            <pre className="bg-fantasy-stone-dark p-4 rounded text-left text-sm text-red-300 overflow-auto max-h-64">
              {this.state.error.message}
            </pre>
            <button
              onClick={this.reset}
              className="medieval-button px-6 py-3 bg-gradient-to-r from-k8s-blue to-k8s-blue-dark text-white font-bold rounded-lg border-2 border-fantasy-gold/50 hover:border-fantasy-gold"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

