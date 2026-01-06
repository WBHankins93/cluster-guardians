"use client";

import { Quest } from "@/shared/types/game";
import { Card, CardHeader, CardTitle, CardContent, Badge, TerminalCard } from "@/components/ui";

interface QuestTrackerProps {
  quest: Quest | undefined;
  className?: string;
}

export function QuestTracker({ quest, className }: QuestTrackerProps) {
  if (!quest) {
    return (
      <TerminalCard title="active_mission.log" className={className}>
        <CardTitle className="text-lg mb-3">ACTIVE MISSION</CardTitle>
        <p className="text-terminal-gray text-sm font-mono">[STANDBY] No active mission</p>
        <p className="text-terminal-cyan/50 text-xs font-mono mt-2">
          &gt; Interact with cluster entities to receive missions
        </p>
      </TerminalCard>
    );
  }

  const completedObjectives = quest.objectives.filter((obj) => obj.isCompleted).length;
  const totalObjectives = quest.objectives.length;
  const progress = (completedObjectives / totalObjectives) * 100;

  return (
    <TerminalCard title="active_mission.log" className={className}>
      <div className="flex items-start justify-between mb-4">
        <CardTitle className="text-lg">{quest.title}</CardTitle>
        <Badge variant="success" pulse>ACTIVE</Badge>
      </div>

      {/* Description */}
      <p className="text-terminal-white/70 text-sm mb-4 font-mono">{quest.description}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-terminal-gray mb-2 font-mono">
          <span>PROGRESS</span>
          <span className="text-terminal-green">
            {completedObjectives}/{totalObjectives}
          </span>
        </div>
        <div className="w-full bg-terminal-black rounded-full h-2 border border-terminal-green/30">
          <div
            className="bg-gradient-to-r from-terminal-green to-terminal-cyan h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-2">
        {quest.objectives.map((objective) => (
          <div
            key={objective.id}
            className="flex items-start space-x-2 text-sm font-mono"
          >
            <div className="mt-0.5">
              {objective.isCompleted ? (
                <span className="text-terminal-green">[✓]</span>
              ) : (
                <span className="text-terminal-gray">[○]</span>
              )}
            </div>
            <div
              className={`flex-1 ${
                objective.isCompleted ? "text-terminal-gray line-through" : "text-terminal-white/80"
              }`}
            >
              {objective.description}
            </div>
          </div>
        ))}
      </div>

      {/* Rewards */}
      {quest.rewards && (
        <div className="mt-4 pt-4 border-t border-terminal-green/20">
          <div className="text-xs font-semibold text-terminal-cyan mb-2 font-mono">REWARDS:</div>
          <div className="flex flex-wrap gap-2">
            {quest.rewards.xp && (
              <Badge variant="success" size="sm">
                +{quest.rewards.xp} XP
              </Badge>
            )}
            {quest.rewards.title && (
              <Badge variant="purple" size="sm">
                {quest.rewards.title}
              </Badge>
            )}
            {quest.rewards.items &&
              quest.rewards.items.map((item, index) => (
                <Badge key={index} variant="default" size="sm">
                  {item.name}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </TerminalCard>
  );
}
