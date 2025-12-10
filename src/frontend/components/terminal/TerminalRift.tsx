"use client";

import { useState, useEffect, useCallback } from "react";
import { Terminal } from "./Terminal";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { api } from "@/lib/api";
import { useGameStore } from "@/lib/store";
import { TerminalChallenge } from "@/shared/types/game";
import { getSettings } from "@/lib/settings";

interface TerminalRiftProps {
  challenge: TerminalChallenge;
  onComplete: (score: number, timeElapsed: number) => void;
  onExit: () => void;
}

export function TerminalRift({ challenge, onComplete, onExit }: TerminalRiftProps) {
  const { clusterState, setClusterState } = useGameStore();
  const [timeRemaining, setTimeRemaining] = useState(challenge.timeLimit);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [commandCount, setCommandCount] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [autoHintShown, setAutoHintShown] = useState(false);

  // Timer
  useEffect(() => {
    if (!isActive || isCompleted || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isCompleted, timeRemaining]);

  // Auto-show first hint (15s in Easy Mode, 30s otherwise)
  useEffect(() => {
    if (isActive && !isCompleted && !autoHintShown && challenge.hints && challenge.hints.length > 0) {
      const settings = getSettings();
      const delay = settings.easyMode ? 15000 : 30000;
      const timeThreshold = settings.easyMode ? 15 : 30;
      const firstHint = challenge.hints[0];
      
      const autoHintTimer = setTimeout(() => {
        if (timeRemaining < challenge.timeLimit - timeThreshold && firstHint) {
          setHints([firstHint]);
          setCurrentHintIndex(1);
          setAutoHintShown(true);
        }
      }, delay);

      return () => clearTimeout(autoHintTimer);
    }
  }, [isActive, isCompleted, autoHintShown, challenge.hints, timeRemaining, challenge.timeLimit]);

  // Start challenge
  const handleStart = async () => {
    // Load initial state
    if (challenge.initialState) {
      // Reset cluster and load challenge scenario
      await api.resetCluster();
      // For simplicity, we'll use our scenario system
      // In a real implementation, you'd load the challenge's specific state
    }

    setIsActive(true);
  };

  // Handle timeout
  const handleTimeout = () => {
    setIsActive(false);
    const score = calculateScore();
    onComplete(score, challenge.timeLimit);
  };

  // Execute kubectl command
  const handleCommand = async (command: string): Promise<string> => {
    if (!isActive || isCompleted) {
      return "Challenge not active";
    }

    setCommandCount((prev) => prev + 1);

    try {
      const result = await api.executeKubectl(command);

      // Refresh cluster state
      const newState = await api.getClusterState();
      setClusterState(newState);

      // Check if challenge is complete
      if (checkSuccess(newState)) {
        handleSuccess();
      }

      return result.output;
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  };

  // Check if success condition is met
  const checkSuccess = (state: any): boolean => {
    const { type, target, expectedValue } = challenge.successCondition;

    switch (type) {
      case "pod-running":
        const pod = state.pods.find((p: any) => p.metadata.name === target);
        return pod?.status?.phase === "Running";

      case "service-accessible":
        const service = state.services.find((s: any) => s.metadata.name === target);
        const matchingPods = state.pods.filter((p: any) => {
          const podLabels = p.metadata.labels || {};
          const serviceSelector = service?.spec.selector || {};
          return Object.keys(serviceSelector).every(
            (key) => podLabels[key] === serviceSelector[key]
          );
        });
        return matchingPods.length > 0 && matchingPods.every((p: any) => p.status?.phase === "Running");

      case "replicas-match":
        const deployment = state.deployments.find((d: any) => d.metadata.name === target);
        return deployment?.status?.readyReplicas === expectedValue;

      case "pvc-bound":
        const pvc = state.pvcs.find((p: any) => p.metadata.name === target);
        return pvc?.status?.phase === "Bound";

      default:
        return false;
    }
  };

  // Handle successful completion
  const handleSuccess = () => {
    setIsCompleted(true);
    setIsActive(false);

    const timeElapsed = challenge.timeLimit - timeRemaining;
    const score = calculateScore();

    onComplete(score, timeElapsed);
  };

  // Calculate score based on time and commands (hints are now free)
  const calculateScore = (): number => {
    const settings = getSettings();
    const timeBonus = Math.floor((timeRemaining / challenge.timeLimit) * 50);
    // More lenient penalty in Easy Mode
    const penaltyMultiplier = settings.easyMode ? 2 : 3;
    const commandThreshold = settings.easyMode ? 7 : 5;
    const commandPenalty = Math.max(0, (commandCount - commandThreshold) * penaltyMultiplier);
    const baseScore = isCompleted ? 100 : 0;

    return Math.max(0, baseScore + timeBonus - commandPenalty);
  };

  // Show hint
  const showHint = () => {
    if (challenge.hints && currentHintIndex < challenge.hints.length) {
      setHints([...hints, challenge.hints[currentHintIndex]]);
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-5xl space-y-4 animate-fade-in">
        {/* Header */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-k8s-blue-light">
                  ⚡ Terminal Rift Challenge
                </CardTitle>
                <p className="text-gray-400 text-sm mt-1">{challenge.description}</p>
              </div>
              <Button variant="danger" size="sm" onClick={onExit}>
                Exit Rift
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Challenge Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card variant="bordered" padding="sm">
            <CardContent>
              <div className="text-center">
                <div className="text-gray-400 text-xs mb-1">Time Remaining</div>
                <div
                  className={`text-2xl font-bold font-mono ${
                    timeRemaining < 30 ? "text-red-500" : "text-k8s-blue-light"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="sm">
            <CardContent>
              <div className="text-center">
                <div className="text-gray-400 text-xs mb-1">Commands Used</div>
                <div className="text-2xl font-bold font-mono text-gray-300">{commandCount}</div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="sm">
            <CardContent>
              <div className="text-center">
                <div className="text-gray-400 text-xs mb-1">Status</div>
                <Badge variant={isCompleted ? "success" : isActive ? "info" : "warning"}>
                  {isCompleted ? "Complete" : isActive ? "Active" : "Not Started"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terminal or Start Screen */}
        {isActive || isCompleted ? (
          <Card variant="bordered" padding="none">
            <Terminal
              onCommand={handleCommand}
              welcomeMessage={`Terminal Rift Challenge: ${challenge.description}\n\nObjective: ${challenge.successCondition.type.replace(/-/g, " ").toUpperCase()}\nTarget: ${challenge.successCondition.target || "N/A"}\n\nType kubectl commands to complete the challenge. Good luck!`}
              prompt="cluster-guardian $ "
            />
          </Card>
        ) : (
          <Card variant="bordered">
            <CardContent>
              <div className="text-center py-12 space-y-6">
                <div className="text-6xl">⚡</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-100 mb-2">
                    Ready to Enter the Terminal Rift?
                  </h3>
                  <p className="text-gray-400">
                    You have {Math.floor(challenge.timeLimit / 60)} minutes to complete this challenge.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Use real kubectl commands to solve the problem. Hints are free and will appear automatically after 30 seconds!
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    💡 First hint will appear automatically after 30 seconds if you need help
                  </p>
                </div>
                <Button onClick={handleStart} size="lg">
                  Start Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hints */}
        {isActive && !isCompleted && challenge.hints && challenge.hints.length > 0 && (
          <Card variant="bordered">
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-semibold text-gray-400">
                    Hints ({hints.length}/{challenge.hints.length})
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={showHint}
                    disabled={currentHintIndex >= (challenge.hints?.length || 0)}
                  >
                    Show Next Hint (Free)
                  </Button>
                </div>
                {hints.map((hint, index) => (
                  <div
                    key={index}
                    className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 text-sm text-yellow-200"
                  >
                    💡 {hint}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <Card variant="bordered">
            <CardContent>
              <div className="text-center py-6 space-y-4">
                <div className="text-6xl">🎉</div>
                <div>
                  <h3 className="text-2xl font-bold text-pod-running mb-2">
                    Challenge Complete!
                  </h3>
                  <p className="text-gray-400">
                    Score: {calculateScore()} points
                  </p>
                  <p className="text-gray-500 text-sm">
                    Completed in {formatTime(challenge.timeLimit - timeRemaining)} with{" "}
                    {commandCount} commands
                  </p>
                </div>
                <Button onClick={onExit} variant="primary">
                  Return to World
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
