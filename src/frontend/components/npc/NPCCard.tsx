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
      className="relative group transition-all duration-200 hover:scale-105 w-full"
    >
      <div className="cyber-card p-3 border border-terminal-green/20 hover:border-terminal-cyan transition-all rounded-lg">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Quest Indicator */}
          {hasQuestIndicator && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-terminal-amber rounded-full flex items-center justify-center text-xs font-bold font-mono animate-pulse shadow-glow-green text-terminal-black">
              !
            </div>
          )}

          {/* Avatar */}
          <NPCAvatar type={npc.type} name={npc.name} />

          {/* Name */}
          <div>
            <div className="font-bold text-terminal-white font-mono text-sm">{npc.name}</div>
            {npc.k8sRepresents && (
              <div className="text-xs text-terminal-cyan/70 mt-1 font-mono">{npc.k8sRepresents}</div>
            )}
          </div>

          {/* Type Badge */}
          <Badge variant="purple" size="sm">
            {npc.type}
          </Badge>

          {/* Hover hint */}
          <div className="text-xs text-terminal-green/50 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            [INTERACT]
          </div>
        </div>
      </div>
    </button>
  );
}
