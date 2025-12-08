import { TerminalRift, TerminalChallenge } from "../types/game";

/**
 * Terminal Rift Challenges for World 1: Namespace Forest
 */

export const world1TerminalRifts: TerminalRift[] = [
  {
    id: "rift-crashloop-fix",
    worldId: "namespace-forest",
    name: "Crashloop Debugging Sprint",
    description: "Fix a pod stuck in CrashLoopBackOff within 90 seconds",
    isUnlocked: false,
    isCompleted: false,
    challenge: {
      type: "fix-crashloop",
      description: "A pod is crashing repeatedly. Find the error in the logs and apply a fix.",
      timeLimit: 90, // 1.5 minutes
      initialState: {
        scenarioId: "world1-quest2", // Loads the crashloop scenario
      },
      successCondition: {
        type: "pod-running",
        target: "treant-pod",
      },
      hints: [
        "Use 'kubectl logs treant-pod -n forest' to see why it's crashing",
        "The container command is invalid. You'll need to fix the YAML.",
        "Replace 'invalid-command' with a valid shell command like 'sh -c sleep 3600'",
      ],
    },
  },
  {
    id: "rift-selector-debug",
    worldId: "namespace-forest",
    name: "Selector Mismatch Mystery",
    description: "Fix a service that can't find its pods due to label mismatch",
    isUnlocked: false,
    isCompleted: false,
    challenge: {
      type: "debug-selector",
      description: "A service has 0 endpoints. Match the labels to restore traffic flow.",
      timeLimit: 120, // 2 minutes
      initialState: {
        scenarioId: "world1-quest3",
      },
      successCondition: {
        type: "service-accessible",
        target: "web-service",
      },
      hints: [
        "Use 'kubectl describe service web-service -n forest' to see the selector",
        "Use 'kubectl describe pod web-pod -n forest' to see the pod's labels",
        "The labels don't match! Fix either the service selector or the pod labels.",
      ],
    },
  },
  {
    id: "rift-namespace-rescue",
    worldId: "namespace-forest",
    name: "Namespace Rescue Mission",
    description: "Move a lost pod to the correct namespace quickly",
    isUnlocked: false,
    isCompleted: false,
    challenge: {
      type: "fix-crashloop",
      description: "A pod is pending in a non-existent namespace. Move it to 'forest' namespace.",
      timeLimit: 60, // 1 minute
      initialState: {
        scenarioId: "world1-quest1",
      },
      successCondition: {
        type: "pod-running",
        target: "lost-pod",
      },
      hints: [
        "The pod is in 'wrong-namespace' which doesn't exist",
        "You need to update the pod's namespace in the YAML to 'forest'",
        "Use kubectl apply to create the pod in the correct namespace",
      ],
    },
  },
];

/**
 * Helper to unlock rifts based on quest completion
 */
export function getAvailableRifts(completedQuests: string[]): TerminalRift[] {
  return world1TerminalRifts.map((rift) => {
    let isUnlocked = false;

    // Unlock rifts based on quest completion
    if (rift.id === "rift-namespace-rescue" && completedQuests.includes("quest1")) {
      isUnlocked = true;
    }
    if (rift.id === "rift-crashloop-fix" && completedQuests.includes("quest2")) {
      isUnlocked = true;
    }
    if (rift.id === "rift-selector-debug" && completedQuests.includes("quest3")) {
      isUnlocked = true;
    }

    return {
      ...rift,
      isUnlocked,
    };
  });
}
