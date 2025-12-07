/**
 * Game-specific types for Cluster Guardians
 */

export interface Player {
  id: string;
  name: string;
  avatar: PlayerAvatar;
  xp: number;
  level: number;
  currentWorld: string;
  inventory: InventoryItem[];
  titles: string[];
  completedQuests: string[];
}

export interface PlayerAvatar {
  skin: string;
  accessories: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  type: "cosmetic" | "resource" | "key";
  description: string;
  icon?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  worldId: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  prerequisites?: string[]; // Quest IDs that must be completed first
  isCompleted: boolean;
  isActive: boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: "fix-pod" | "create-service" | "scale-deployment" | "talk-to-npc" | "terminal-challenge";
  target?: string; // Resource name or NPC ID
  isCompleted: boolean;
}

export interface QuestReward {
  xp: number;
  items?: InventoryItem[];
  title?: string;
}

export interface World {
  id: string;
  name: string;
  description: string;
  theme: string; // e.g., "Namespace Forest", "Deployment Hills"
  npcs: NPC[];
  quests: Quest[];
  boss?: Boss;
  isUnlocked: boolean;
  requiredLevel?: number;
}

export interface NPC {
  id: string;
  name: string;
  type: NPCType;
  description: string;
  dialogTree: DialogNode;
  k8sRepresents?: string; // What K8s object this NPC represents
  sprite?: string;
}

export type NPCType =
  | "pod"
  | "deployment"
  | "service"
  | "configmap"
  | "secret"
  | "pvc"
  | "node"
  | "sage"
  | "scheduler"
  | "controller";

export interface DialogNode {
  id: string;
  text: string;
  speaker: string;
  choices?: DialogChoice[];
  nextNodeId?: string;
  action?: DialogAction;
}

export interface DialogChoice {
  text: string;
  nextNodeId: string;
  condition?: string; // Quest state or condition
}

export interface DialogAction {
  type: "start-quest" | "complete-quest" | "give-item" | "open-terminal-rift";
  payload?: any;
}

export interface Boss {
  id: string;
  name: string;
  description: string;
  represents: string; // e.g., "CrashLoopBackOff"
  health: number;
  maxHealth: number;
  phases: BossPhase[];
  currentPhase: number;
  isDefeated: boolean;
  sprite?: string;
}

export interface BossPhase {
  id: string;
  name: string;
  description: string;
  puzzle: BossPuzzle;
}

export interface BossPuzzle {
  type: "fix-yaml" | "debug-logs" | "match-labels" | "multi-step";
  challenge: string;
  hint?: string;
  solution: any; // The correct state or YAML
}

export interface TerminalRift {
  id: string;
  worldId: string;
  name: string;
  description: string;
  challenge: TerminalChallenge;
  isUnlocked: boolean;
  isCompleted: boolean;
  bestTime?: number;
  bestScore?: number;
}

export interface TerminalChallenge {
  type: "fix-crashloop" | "debug-selector" | "create-ingress" | "bind-pvc" | "scale-deployment";
  description: string;
  timeLimit: number; // seconds
  initialState: any; // Initial cluster state for this challenge
  successCondition: SuccessCondition;
  hints?: string[];
}

export interface SuccessCondition {
  type: "pod-running" | "service-accessible" | "replicas-match" | "pvc-bound";
  target: string;
  expectedValue?: any;
}

export interface TerminalSession {
  id: string;
  riftId: string;
  startTime: number;
  endTime?: number;
  commandHistory: TerminalCommand[];
  isComplete: boolean;
  score?: number;
}

export interface TerminalCommand {
  timestamp: number;
  command: string;
  output: string;
  exitCode: number;
}

// Game state (client-side)
export interface GameState {
  player: Player;
  worlds: World[];
  activeQuest?: Quest;
  currentDialog?: DialogNode;
  terminalRifts: TerminalRift[];
  activeTerminalSession?: TerminalSession;
}
