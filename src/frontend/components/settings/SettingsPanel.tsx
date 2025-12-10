"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@/components/ui";
import { getSettings, saveSettings, GameSettings } from "@/lib/settings";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState<GameSettings>(getSettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings());
    }
  }, [isOpen]);

  const handleToggle = (key: keyof GameSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card variant="bordered" className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-k8s-blue-light">⚙️ Game Settings</CardTitle>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Easy Mode */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-200">Easy Mode</h3>
                    {settings.easyMode && (
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    When enabled, Easy Mode provides:
                  </p>
                  <ul className="text-sm text-gray-300 mt-2 space-y-1 list-disc list-inside">
                    <li>More detailed hints and examples</li>
                    <li>Longer time limits in Terminal Rifts</li>
                    <li>Auto-display of hints after 15 seconds (instead of 30)</li>
                    <li>More forgiving scoring system</li>
                    <li>Additional quest guidance</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleToggle("easyMode")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.easyMode ? "bg-k8s-blue" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.easyMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Auto Show Hints */}
            <div className="space-y-3 border-t border-gray-700 pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-200">Auto-Show Hints</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Automatically display hints after a delay when stuck on an objective.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("autoShowHints")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoShowHints ? "bg-k8s-blue" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoShowHints ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Show Tutorials */}
            <div className="space-y-3 border-t border-gray-700 pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-200">Show Tutorials</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Display tutorial tips and onboarding when starting the game.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("showTutorials")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showTutorials ? "bg-k8s-blue" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showTutorials ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mt-4">
              <p className="text-sm text-blue-200">
                💡 Settings are saved automatically and will persist across sessions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

