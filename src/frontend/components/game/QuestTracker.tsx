"use client";

import { Quest } from "@/shared/types/game";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";

interface QuestTrackerProps {
  quest: Quest | undefined;
  className?: string;
}

export function QuestTracker({ quest, className }: QuestTrackerProps) {
  if (!quest) {
    return (
      <Card variant="bordered" className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Active Quest</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No active quest</p>
        </CardContent>
      </Card>
    );
  }

  const completedObjectives = quest.objectives.filter((obj) => obj.isCompleted).length;
  const totalObjectives = quest.objectives.length;
  const progress = (completedObjectives / totalObjectives) * 100;

  return (
    <Card variant="bordered" className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{quest.title}</CardTitle>
          <Badge variant="info">Active</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Description */}
        <p className="text-gray-400 text-sm mb-4">{quest.description}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>
              {completedObjectives}/{totalObjectives}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-k8s-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Objectives */}
        <div className="space-y-2">
          {quest.objectives.map((objective) => (
            <div
              key={objective.id}
              className="flex items-start space-x-2 text-sm"
            >
              <div className="mt-0.5">
                {objective.isCompleted ? (
                  <span className="text-pod-running">✓</span>
                ) : (
                  <span className="text-gray-600">○</span>
                )}
              </div>
              <div
                className={`flex-1 ${
                  objective.isCompleted ? "text-gray-500 line-through" : "text-gray-300"
                }`}
              >
                {objective.description}
              </div>
            </div>
          ))}
        </div>

        {/* Rewards */}
        {quest.rewards && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-xs font-semibold text-gray-400 mb-2">Rewards</div>
            <div className="flex flex-wrap gap-2">
              {quest.rewards.xp && (
                <Badge variant="info" size="sm">
                  +{quest.rewards.xp} XP
                </Badge>
              )}
              {quest.rewards.title && (
                <Badge variant="success" size="sm">
                  Title: {quest.rewards.title}
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
      </CardContent>
    </Card>
  );
}
