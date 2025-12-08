import { NPCType } from "@/shared/types/game";

interface NPCAvatarProps {
  type: NPCType;
  name: string;
  className?: string;
}

export function NPCAvatar({ type, name, className = "" }: NPCAvatarProps) {
  const getAvatarEmoji = (type: NPCType): string => {
    switch (type) {
      case "sage":
        return "🧙";
      case "pod":
        return "📦";
      case "deployment":
        return "⚔️";
      case "service":
        return "🛡️";
      case "configmap":
        return "📜";
      case "secret":
        return "🔒";
      case "pvc":
        return "💾";
      case "node":
        return "🏔️";
      case "scheduler":
        return "⚡";
      case "controller":
        return "🎮";
      default:
        return "❓";
    }
  };

  const getTypeColor = (type: NPCType): string => {
    switch (type) {
      case "sage":
        return "from-purple-500 to-blue-500";
      case "pod":
        return "from-green-500 to-emerald-500";
      case "deployment":
        return "from-blue-500 to-cyan-500";
      case "service":
        return "from-yellow-500 to-orange-500";
      case "configmap":
        return "from-gray-500 to-slate-500";
      case "secret":
        return "from-red-500 to-pink-500";
      default:
        return "from-gray-600 to-gray-700";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`w-20 h-20 rounded-full bg-gradient-to-br ${getTypeColor(
          type
        )} flex items-center justify-center text-4xl shadow-lg border-4 border-gray-700`}
      >
        {getAvatarEmoji(type)}
      </div>
      {/* Pulse effect for interactive NPCs */}
      <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity cursor-pointer" />
    </div>
  );
}
