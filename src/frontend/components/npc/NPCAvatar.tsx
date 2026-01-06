import { NPCType } from "@/shared/types/game";

interface NPCAvatarProps {
  type: NPCType;
  name: string;
  className?: string;
}

export function NPCAvatar({ type, name, className = "" }: NPCAvatarProps) {
  const getAvatarIcon = (type: NPCType): string => {
    switch (type) {
      case "sage":
        return "◈"; // Diamond - System Admin
      case "pod":
        return "⬡"; // Hexagon - Pod container
      case "deployment":
        return "▣"; // Grid - Deployment
      case "service":
        return "◉"; // Target - Service endpoint
      case "configmap":
        return "≡"; // Lines - Config
      case "secret":
        return "◆"; // Diamond filled - Secret
      case "pvc":
        return "▤"; // Storage blocks
      case "node":
        return "⬢"; // Hexagon filled - Node
      case "scheduler":
        return "⚡"; // Lightning - Scheduler
      case "controller":
        return "⎈"; // Helm wheel - Controller
      default:
        return "?";
    }
  };

  const getTypeColors = (type: NPCType): { border: string; bg: string; text: string; glow: string } => {
    switch (type) {
      case "sage":
        return {
          border: "border-terminal-cyan",
          bg: "bg-terminal-cyan/10",
          text: "text-terminal-cyan",
          glow: "shadow-glow-cyan",
        };
      case "pod":
        return {
          border: "border-terminal-green",
          bg: "bg-terminal-green/10",
          text: "text-terminal-green",
          glow: "shadow-glow-green",
        };
      case "deployment":
        return {
          border: "border-terminal-purple",
          bg: "bg-terminal-purple/10",
          text: "text-terminal-purple",
          glow: "",
        };
      case "service":
        return {
          border: "border-terminal-blue",
          bg: "bg-terminal-blue/10",
          text: "text-terminal-blue",
          glow: "",
        };
      case "configmap":
        return {
          border: "border-terminal-gray",
          bg: "bg-terminal-gray/10",
          text: "text-terminal-gray",
          glow: "",
        };
      case "secret":
        return {
          border: "border-terminal-red",
          bg: "bg-terminal-red/10",
          text: "text-terminal-red",
          glow: "shadow-glow-red",
        };
      default:
        return {
          border: "border-terminal-green",
          bg: "bg-terminal-green/10",
          text: "text-terminal-green",
          glow: "",
        };
    }
  };

  const colors = getTypeColors(type);

  return (
    <div className={`relative group ${className}`}>
      {/* Outer ring with animation */}
      <div className={`absolute inset-0 rounded-full ${colors.border} border opacity-30 animate-ping`} style={{ animationDuration: '3s' }} />

      {/* Main avatar */}
      <div
        className={`relative w-16 h-16 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center font-mono text-2xl ${colors.glow} transition-all duration-300 group-hover:scale-110`}
      >
        {/* Icon */}
        <span className={`${colors.text} drop-shadow-lg`}>
          {getAvatarIcon(type)}
        </span>

        {/* Inner glow effect */}
        <div className={`absolute inset-2 rounded-full ${colors.bg} opacity-50 blur-sm`} />
      </div>

      {/* Status indicator */}
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center`}>
        <div className={`w-2 h-2 rounded-full bg-terminal-green animate-pulse`} />
      </div>
    </div>
  );
}
