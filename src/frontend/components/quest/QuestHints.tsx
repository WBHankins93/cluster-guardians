"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@/components/ui";
import { QuestObjective } from "@/shared/types/game";
import { getHintsForObjective } from "@/shared/data/questHints";
import { getSettings } from "@/lib/settings";

interface QuestHintsProps {
  objective: QuestObjective;
  onShowHint: () => void;
}

export function QuestHints({ objective, onShowHint }: QuestHintsProps) {
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  const hintData = getHintsForObjective(objective.id);
  const hints = hintData?.hints || [];
  const exampleCommands = hintData?.exampleCommands || [];
  const exampleYaml = hintData?.exampleYaml;

  const handleShowHints = () => {
    setShowHints(true);
    setCurrentHintIndex(0);
    onShowHint();
  };

  const handleNextHint = () => {
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const handlePreviousHint = () => {
    if (currentHintIndex > 0) {
      setCurrentHintIndex(currentHintIndex - 1);
    }
  };

  const settings = getSettings();
  const shouldAutoShow = settings.easyMode && settings.autoShowHints && !showHints;

  // Auto-show hints in Easy Mode
  useEffect(() => {
    if (shouldAutoShow) {
      const timer = setTimeout(() => {
        handleShowHints();
      }, 5000); // Show after 5 seconds in Easy Mode

      return () => clearTimeout(timer);
    }
  }, [shouldAutoShow]);

  if (!hintData || hints.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      {!showHints ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleShowHints}
          className="w-full"
        >
          💡 Show Hints
        </Button>
      ) : (
        <Card variant="bordered" className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Hint navigation */}
              <div className="flex justify-between items-center">
                <div className="text-sm font-semibold text-blue-200">
                  Hint {currentHintIndex + 1} of {hints.length}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePreviousHint}
                    disabled={currentHintIndex === 0}
                  >
                    ←
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleNextHint}
                    disabled={currentHintIndex === hints.length - 1}
                  >
                    →
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowHints(false)}
                  >
                    Hide
                  </Button>
                </div>
              </div>

              {/* Current hint */}
              <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                <p className="text-sm text-gray-200 leading-relaxed">
                  {hints[currentHintIndex]}
                </p>
              </div>

              {/* Example commands */}
              {exampleCommands.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-1">
                    Example Commands:
                  </div>
                  <div className="space-y-1">
                    {exampleCommands.map((cmd, index) => (
                      <div
                        key={index}
                        className="bg-gray-900 p-2 rounded font-mono text-xs text-k8s-blue-light border border-gray-700"
                      >
                        {cmd}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Example YAML */}
              {exampleYaml && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-1">
                    Example YAML:
                  </div>
                  <pre className="bg-gray-900 p-2 rounded font-mono text-xs text-gray-300 border border-gray-700 overflow-x-auto">
                    {exampleYaml}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

