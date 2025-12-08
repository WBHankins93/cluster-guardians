import { create } from "zustand";
import {
  GameState,
  Player,
  Quest,
  World,
  DialogNode,
  TerminalSession,
  TerminalRift,
} from "@/shared/types/game";
import { ClusterState } from "@/shared/types/kubernetes";

interface GameStore extends GameState {
  // Cluster state
  clusterState: ClusterState | null;
  setClusterState: (state: ClusterState) => void;

  // Player actions
  gainXP: (amount: number) => void;
  addItem: (item: any) => void;
  completeQuest: (questId: string) => void;
  unlockTitle: (title: string) => void;

  // Quest management
  setActiveQuest: (quest: Quest | undefined) => void;
  updateQuestObjective: (questId: string, objectiveId: string, completed: boolean) => void;

  // Dialog management
  setCurrentDialog: (dialog: DialogNode | undefined) => void;

  // World management
  updateWorld: (worldId: string, updates: Partial<World>) => void;
  unlockWorld: (worldId: string) => void;

  // Terminal Rift management
  startTerminalSession: (riftId: string) => void;
  endTerminalSession: (score: number) => void;
  setActiveTerminalSession: (session: TerminalSession | undefined) => void;

  // Reset game
  resetGame: () => void;
}

const createInitialPlayer = (): Player => ({
  id: "player-1",
  name: "Cluster Guardian",
  avatar: {
    skin: "default",
    accessories: [],
  },
  xp: 0,
  level: 1,
  currentWorld: "namespace-forest",
  inventory: [],
  titles: [],
  completedQuests: [],
});

const XP_PER_LEVEL = 100;

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  player: createInitialPlayer(),
  worlds: [],
  activeQuest: undefined,
  currentDialog: undefined,
  terminalRifts: [],
  activeTerminalSession: undefined,
  clusterState: null,

  // Cluster state
  setClusterState: (clusterState) => set({ clusterState }),

  // Player actions
  gainXP: (amount) =>
    set((state) => {
      const newXP = state.player.xp + amount;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      return {
        player: {
          ...state.player,
          xp: newXP,
          level: newLevel,
        },
      };
    }),

  addItem: (item) =>
    set((state) => ({
      player: {
        ...state.player,
        inventory: [...state.player.inventory, item],
      },
    })),

  completeQuest: (questId) =>
    set((state) => {
      const quest = state.worlds
        .flatMap((w) => w.quests)
        .find((q) => q.id === questId);

      if (!quest) return state;

      // Mark quest as completed
      const updatedWorlds = state.worlds.map((world) => ({
        ...world,
        quests: world.quests.map((q) =>
          q.id === questId ? { ...q, isCompleted: true, isActive: false } : q
        ),
      }));

      // Add to completed quests
      const completedQuests = [...state.player.completedQuests, questId];

      // Grant rewards
      let player = { ...state.player, completedQuests };
      if (quest.rewards.xp) {
        player.xp += quest.rewards.xp;
        player.level = Math.floor(player.xp / XP_PER_LEVEL) + 1;
      }
      if (quest.rewards.items) {
        player.inventory = [...player.inventory, ...quest.rewards.items];
      }
      if (quest.rewards.title) {
        player.titles = [...player.titles, quest.rewards.title];
      }

      return {
        worlds: updatedWorlds,
        player,
        activeQuest: undefined,
      };
    }),

  unlockTitle: (title) =>
    set((state) => ({
      player: {
        ...state.player,
        titles: [...state.player.titles, title],
      },
    })),

  // Quest management
  setActiveQuest: (activeQuest) => set({ activeQuest }),

  updateQuestObjective: (questId, objectiveId, completed) =>
    set((state) => {
      const updatedWorlds = state.worlds.map((world) => ({
        ...world,
        quests: world.quests.map((quest) => {
          if (quest.id !== questId) return quest;

          const updatedObjectives = quest.objectives.map((obj) =>
            obj.id === objectiveId ? { ...obj, isCompleted: completed } : obj
          );

          // Check if all objectives are completed
          const allCompleted = updatedObjectives.every((obj) => obj.isCompleted);

          return {
            ...quest,
            objectives: updatedObjectives,
            isCompleted: allCompleted,
          };
        }),
      }));

      return { worlds: updatedWorlds };
    }),

  // Dialog management
  setCurrentDialog: (currentDialog) => set({ currentDialog }),

  // World management
  updateWorld: (worldId, updates) =>
    set((state) => ({
      worlds: state.worlds.map((world) =>
        world.id === worldId ? { ...world, ...updates } : world
      ),
    })),

  unlockWorld: (worldId) =>
    set((state) => ({
      worlds: state.worlds.map((world) =>
        world.id === worldId ? { ...world, isUnlocked: true } : world
      ),
    })),

  // Terminal Rift management
  startTerminalSession: (riftId) =>
    set((state) => {
      const session: TerminalSession = {
        id: `session-${Date.now()}`,
        riftId,
        startTime: Date.now(),
        commandHistory: [],
        isComplete: false,
      };
      return { activeTerminalSession: session };
    }),

  endTerminalSession: (score) =>
    set((state) => {
      if (!state.activeTerminalSession) return state;

      const completedSession = {
        ...state.activeTerminalSession,
        endTime: Date.now(),
        isComplete: true,
        score,
      };

      // Update rift with best score
      const updatedRifts = state.terminalRifts.map((rift) => {
        if (rift.id === completedSession.riftId) {
          const bestScore = rift.bestScore ? Math.max(rift.bestScore, score) : score;
          const duration = completedSession.endTime! - completedSession.startTime;
          const bestTime = rift.bestTime
            ? Math.min(rift.bestTime, duration)
            : duration;

          return {
            ...rift,
            isCompleted: true,
            bestScore,
            bestTime,
          };
        }
        return rift;
      });

      return {
        terminalRifts: updatedRifts,
        activeTerminalSession: undefined,
      };
    }),

  setActiveTerminalSession: (activeTerminalSession) =>
    set({ activeTerminalSession }),

  // Reset game
  resetGame: () =>
    set({
      player: createInitialPlayer(),
      worlds: [],
      activeQuest: undefined,
      currentDialog: undefined,
      terminalRifts: [],
      activeTerminalSession: undefined,
      clusterState: null,
    }),
}));
