import { NPC } from "@/shared/types/game";
import { Card, CardContent, Badge } from "@/components/ui";
import { NPCAvatar } from "./NPCAvatar";

interface NPCCardProps {
  npc: NPC;
  onInteract: () => void;
  hasQuestIndicator?: boolean;
}

export function NPCCard({ npc, onInteract, hasQuestIndicator = false }: NPCCardProps) {
  return (
    <button
      onClick={onInteract}
      className="relative group transition-transform hover:scale-105"
    >
      <Card variant="bordered" padding="sm" className="hover:border-k8s-blue transition-all">
        <CardContent>
          <div className="flex flex-col items-center text-center space-y-2">
            {/* Quest Indicator */}
            {hasQuestIndicator && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
                !
              </div>
            )}

            {/* Avatar */}
            <NPCAvatar type={npc.type} name={npc.name} />

            {/* Name */}
            <div>
              <div className="font-bold text-gray-100">{npc.name}</div>
              {npc.k8sRepresents && (
                <div className="text-xs text-gray-500 mt-1">{npc.k8sRepresents}</div>
              )}
            </div>

            {/* Type Badge */}
            <Badge variant="info" size="sm">
              {npc.type}
            </Badge>

            {/* Hover hint */}
            <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to interact
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
