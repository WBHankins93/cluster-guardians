import { World, Quest, NPC, DialogNode, Boss } from "../types/game";

/**
 * World 1: Namespace Forest
 * Teaches: namespaces, pods, basic YAML
 */

// Dialog Trees
export const kubeSageDialogTree: Record<string, DialogNode> = {
  intro: {
    id: "intro",
    text: "Greetings, Cluster Guardian! I am the Kube Sage, keeper of YAML wisdom and protector of the Namespace Forest.\n\nOur forest is in turmoil... pods have become corrupted, lost in wrong namespaces, crashing endlessly.",
    speaker: "Kube Sage",
    choices: [
      {
        text: "What happened here?",
        nextNodeId: "what-happened",
      },
      {
        text: "How can I help?",
        nextNodeId: "how-to-help",
      },
    ],
  },
  "what-happened": {
    id: "what-happened",
    text: "The corruption spreads from the CrashLoop Treant, an ancient being that has fallen into an endless cycle of failure. Its influence has destabilized the entire forest.\n\nPods wander into wrong namespaces, containers crash repeatedly, and services can no longer find their endpoints.",
    speaker: "Kube Sage",
    nextNodeId: "corruption-details",
  },
  "corruption-details": {
    id: "corruption-details",
    text: "You must restore balance by fixing the corrupted pods and understanding the root causes. Only then can you face the Treant itself.",
    speaker: "Kube Sage",
    choices: [
      {
        text: "I'm ready to begin",
        nextNodeId: "quest1-start",
      },
      {
        text: "Tell me about namespaces first",
        nextNodeId: "namespace-lesson",
      },
    ],
  },
  "how-to-help": {
    id: "how-to-help",
    text: "You must restore the corrupted pods scattered throughout the forest. Each one teaches a lesson about Kubernetes fundamentals.",
    speaker: "Kube Sage",
    nextNodeId: "quest1-start",
  },
  "namespace-lesson": {
    id: "namespace-lesson",
    text: "Namespaces are like villages within our forest. Each provides isolation for its resources. Pods must reside in the correct namespace, or they become... lost.\n\nThe 'default' namespace is the main village, but we also have 'forest' where nature-aligned pods thrive.",
    speaker: "Kube Sage",
    nextNodeId: "quest1-start",
  },
  "quest1-start": {
    id: "quest1-start",
    text: "There is a pod named 'lost-pod' that has wandered into a namespace that doesn't exist. Find it and guide it home to the 'forest' namespace.",
    speaker: "Kube Sage",
    action: {
      type: "start-quest",
      payload: { questId: "quest1" },
    },
  },
  "quest1-complete": {
    id: "quest1-complete",
    text: "Well done! You've mastered namespace basics. But our troubles are far from over...",
    speaker: "Kube Sage",
    nextNodeId: "quest2-intro",
  },
  "quest2-intro": {
    id: "quest2-intro",
    text: "The Treant Pod in the heart of the forest is trapped in a CrashLoopBackOff. It starts, fails, restarts, fails again... endlessly.\n\nYou must examine its logs and fix the broken command.",
    speaker: "Kube Sage",
    action: {
      type: "start-quest",
      payload: { questId: "quest2" },
    },
  },
  "quest2-complete": {
    id: "quest2-complete",
    text: "Excellent! The Treant Pod now runs smoothly. You're learning the ways of debugging quickly.",
    speaker: "Kube Sage",
    nextNodeId: "quest3-intro",
  },
  "quest3-intro": {
    id: "quest3-intro",
    text: "One final test remains. A Service is trying to route traffic to pods, but the labels don't match. The Service's selector cannot find any endpoints.\n\nFix this networking issue, and you'll be ready to face the CrashLoop Treant.",
    speaker: "Kube Sage",
    action: {
      type: "start-quest",
      payload: { questId: "quest3" },
    },
  },
  "quest3-complete": {
    id: "quest3-complete",
    text: "You have proven yourself, Guardian. The forest's pods are healthy, namespaces are organized, and services flow freely.\n\nNow... it is time to confront the CrashLoop Treant and end this corruption once and for all!",
    speaker: "Kube Sage",
    action: {
      type: "start-quest",
      payload: { questId: "boss-battle" },
    },
  },
};

export const lostPodDialog: Record<string, DialogNode> = {
  initial: {
    id: "initial",
    text: "*shimmer shimmer* I... I don't know where I am! The namespace around me feels wrong... empty... it doesn't exist!",
    speaker: "Lost Pod",
    choices: [
      {
        text: "Let me check your configuration",
        nextNodeId: "check-config",
      },
      {
        text: "What namespace should you be in?",
        nextNodeId: "correct-namespace",
      },
    ],
  },
  "check-config": {
    id: "check-config",
    text: "My YAML says I'm in 'wrong-namespace' but... I feel so lost. I need to be in the 'forest' namespace where I belong!",
    speaker: "Lost Pod",
    nextNodeId: "help-request",
  },
  "correct-namespace": {
    id: "correct-namespace",
    text: "I belong in the 'forest' namespace! That's my home, where all the nature pods live.",
    speaker: "Lost Pod",
    nextNodeId: "help-request",
  },
  "help-request": {
    id: "help-request",
    text: "Can you update my YAML and apply it? Please, I want to be Pending no more!",
    speaker: "Lost Pod",
  },
  fixed: {
    id: "fixed",
    text: "*glows brightly* I'm Running! I'm finally Running! Thank you, Guardian! The forest namespace feels like home!",
    speaker: "Lost Pod",
  },
};

export const treantPodDialog: Record<string, DialogNode> = {
  initial: {
    id: "initial",
    text: "*crash* ... *restart* ... *crash* ... ERROR: command not found... *crash* ...\n\nPlease... make it stop... the crashing...",
    speaker: "Treant Pod",
    choices: [
      {
        text: "Let me check your logs",
        nextNodeId: "logs-hint",
      },
      {
        text: "What command are you trying to run?",
        nextNodeId: "command-hint",
      },
    ],
  },
  "logs-hint": {
    id: "logs-hint",
    text: "*crash* The logs show: 'Error: command not found: invalid-command' ... *crash*",
    speaker: "Treant Pod",
    nextNodeId: "solution-hint",
  },
  "command-hint": {
    id: "command-hint",
    text: "I'm trying to run 'invalid-command' but it doesn't exist! *crash* I need a valid shell command like 'sh' or 'sleep'!",
    speaker: "Treant Pod",
    nextNodeId: "solution-hint",
  },
  "solution-hint": {
    id: "solution-hint",
    text: "Please fix my container's command in the YAML... make the crashing stop!",
    speaker: "Treant Pod",
  },
  fixed: {
    id: "fixed",
    text: "*stands tall and strong* The crashing has stopped! I am finally at peace, Running as I should be. Thank you, brave Guardian!",
    speaker: "Treant Pod",
  },
};

export const serviceGuardianDialog: Record<string, DialogNode> = {
  initial: {
    id: "initial",
    text: "Greetings, traveler. I am a Service, a router of traffic. But I have a problem...\n\nMy selector seeks pods with label 'app: web', but I find... nothing. Zero endpoints.",
    speaker: "Service Guardian",
    choices: [
      {
        text: "What labels does the pod actually have?",
        nextNodeId: "label-mismatch",
      },
      {
        text: "Let me describe the resources",
        nextNodeId: "describe-hint",
      },
    ],
  },
  "label-mismatch": {
    id: "label-mismatch",
    text: "The pod has label 'app: webapp', but I'm looking for 'app: web'. Close... but not quite right.\n\nEither change my selector, or change the pod's labels.",
    speaker: "Service Guardian",
    nextNodeId: "solution",
  },
  "describe-hint": {
    id: "describe-hint",
    text: "Use kubectl describe to see the labels on both the pod and the service. You'll spot the mismatch.",
    speaker: "Service Guardian",
    nextNodeId: "solution",
  },
  solution: {
    id: "solution",
    text: "Fix either the pod labels or my selector in the YAML, then apply it. Traffic will flow once more!",
    speaker: "Service Guardian",
  },
  fixed: {
    id: "fixed",
    text: "*glows with satisfaction* Endpoints found! Traffic flows! You have restored balance to the network. Well done!",
    speaker: "Service Guardian",
  },
};

// Quests
export const world1Quests: Quest[] = [
  {
    id: "quest1",
    title: "The Lost Pod",
    description: "A pod has wandered into a non-existent namespace. Guide it back to the forest namespace.",
    worldId: "namespace-forest",
    objectives: [
      {
        id: "obj1-1",
        description: "Talk to the Lost Pod",
        type: "talk-to-npc",
        target: "lost-pod",
        isCompleted: false,
      },
      {
        id: "obj1-2",
        description: "Examine the pod's current namespace",
        type: "fix-pod",
        target: "lost-pod",
        isCompleted: false,
      },
      {
        id: "obj1-3",
        description: "Update the pod YAML to use namespace 'forest'",
        type: "fix-pod",
        target: "lost-pod",
        isCompleted: false,
      },
      {
        id: "obj1-4",
        description: "Apply the corrected YAML",
        type: "fix-pod",
        target: "lost-pod",
        isCompleted: false,
      },
    ],
    rewards: {
      xp: 100,
      title: "Namespace Navigator",
    },
    isCompleted: false,
    isActive: false,
  },
  {
    id: "quest2",
    title: "The Crashing Treant",
    description: "The Treant Pod is stuck in CrashLoopBackOff. Investigate its logs and fix the broken command.",
    worldId: "namespace-forest",
    objectives: [
      {
        id: "obj2-1",
        description: "Talk to the Treant Pod",
        type: "talk-to-npc",
        target: "treant-pod",
        isCompleted: false,
      },
      {
        id: "obj2-2",
        description: "Check the pod's logs to find the error",
        type: "fix-pod",
        target: "treant-pod",
        isCompleted: false,
      },
      {
        id: "obj2-3",
        description: "Fix the invalid command in the container spec",
        type: "fix-pod",
        target: "treant-pod",
        isCompleted: false,
      },
      {
        id: "obj2-4",
        description: "Apply the fix and verify the pod is Running",
        type: "fix-pod",
        target: "treant-pod",
        isCompleted: false,
      },
    ],
    rewards: {
      xp: 150,
      title: "Crash Detective",
    },
    isCompleted: false,
    isActive: false,
  },
  {
    id: "quest3",
    title: "The Mismatched Labels",
    description: "A Service cannot find its pods due to label mismatch. Fix the selector or the pod labels.",
    worldId: "namespace-forest",
    objectives: [
      {
        id: "obj3-1",
        description: "Talk to the Service Guardian",
        type: "talk-to-npc",
        target: "service-guardian",
        isCompleted: false,
      },
      {
        id: "obj3-2",
        description: "Describe the service to see its selector",
        type: "fix-pod",
        target: "web-service",
        isCompleted: false,
      },
      {
        id: "obj3-3",
        description: "Describe the pod to see its labels",
        type: "fix-pod",
        target: "web-pod",
        isCompleted: false,
      },
      {
        id: "obj3-4",
        description: "Fix the label mismatch and apply the change",
        type: "fix-pod",
        isCompleted: false,
      },
    ],
    rewards: {
      xp: 150,
      title: "Label Master",
    },
    isCompleted: false,
    isActive: false,
  },
];

// NPCs
export const world1NPCs: NPC[] = [
  {
    id: "kube-sage",
    name: "Kube Sage",
    type: "sage",
    description: "An ancient being who guides cluster guardians and maintains YAML wisdom",
    dialogTree: kubeSageDialogTree.intro,
    k8sRepresents: "Kubernetes API Server",
  },
  {
    id: "lost-pod",
    name: "Lost Pod",
    type: "pod",
    description: "A confused pod stuck in a non-existent namespace",
    dialogTree: lostPodDialog.initial,
    k8sRepresents: "Pod with namespace error",
  },
  {
    id: "treant-pod",
    name: "Treant Pod",
    type: "pod",
    description: "A pod trapped in an endless crash loop",
    dialogTree: treantPodDialog.initial,
    k8sRepresents: "Pod in CrashLoopBackOff",
  },
  {
    id: "service-guardian",
    name: "Service Guardian",
    type: "service",
    description: "A service unable to find its pod endpoints",
    dialogTree: serviceGuardianDialog.initial,
    k8sRepresents: "Service with selector mismatch",
  },
];

// Boss
export const crashLoopTreant: Boss = {
  id: "crashloop-treant",
  name: "CrashLoop Treant",
  description: "An ancient tree-like being trapped in an endless cycle of falling and regrowing, spreading corruption throughout the forest",
  represents: "CrashLoopBackOff - The ultimate debugging challenge",
  health: 100,
  maxHealth: 100,
  currentPhase: 0,
  isDefeated: false,
  phases: [
    {
      id: "phase1",
      name: "The Falling",
      description: "The Treant falls and crashes, its roots unable to find purchase",
      puzzle: {
        type: "fix-yaml",
        challenge: "The Treant's main container has an invalid image. Fix the YAML.",
        hint: "Check the image field - it might be pulling from a non-existent repository",
        solution: {
          image: "nginx:latest", // Should be a valid image
        },
      },
    },
    {
      id: "phase2",
      name: "The Restart",
      description: "The Treant regrows, but its branches (init containers) fail",
      puzzle: {
        type: "fix-yaml",
        challenge: "The init container is failing. Fix its command.",
        hint: "The init container command is invalid - use a valid shell command",
        solution: {
          command: ["sh", "-c", "echo 'Init complete'"],
        },
      },
    },
    {
      id: "phase3",
      name: "The Final Stand",
      description: "The Treant stands tall, but needs proper resource limits to stabilize",
      puzzle: {
        type: "fix-yaml",
        challenge: "Add resource limits to prevent the Treant from consuming too much",
        hint: "Set memory and CPU limits in the resources section",
        solution: {
          resources: {
            limits: {
              memory: "128Mi",
              cpu: "100m",
            },
          },
        },
      },
    },
  ],
};

// Complete World Data
export const namespaceForestWorld: World = {
  id: "namespace-forest",
  name: "Namespace Forest",
  description: "A mystical forest where pods dwell in organized namespaces. Corruption has spread, causing pods to crash and wander lost.",
  theme: "Ancient woodland with YAML-shaped trees and glowing pod spirits",
  npcs: world1NPCs,
  quests: world1Quests,
  boss: crashLoopTreant,
  isUnlocked: true,
  requiredLevel: 1,
};
