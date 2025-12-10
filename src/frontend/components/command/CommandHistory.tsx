"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";

interface CommandHistoryProps {
  history: string[];
  onSelectCommand: (command: string) => void;
  maxItems?: number;
}

export function CommandHistory({
  history,
  onSelectCommand,
  maxItems = 10,
}: CommandHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (history.length === 0) return null;

  const displayHistory = history.slice(-maxItems).reverse();

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        title="View command history"
      >
        📜 History ({history.length})
      </Button>

      {isOpen && (
        <Card
          variant="bordered"
          className="absolute right-0 mt-2 w-96 z-10 max-h-96 overflow-y-auto"
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Command History</CardTitle>
              <Button variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {displayHistory.map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelectCommand(cmd);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded font-mono text-xs text-gray-300 transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

