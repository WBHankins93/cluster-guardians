/**
 * Quest Hints - Step-by-step guidance for each quest objective
 */

export interface QuestHint {
  objectiveId: string;
  hints: string[];
  exampleCommands?: string[];
  exampleYaml?: string;
}

export const questHints: Record<string, QuestHint> = {
  // Quest 1: The Lost Pod
  "obj1-1": {
    objectiveId: "obj1-1",
    hints: [
      "Click on the 'Lost Pod' NPC in the Characters section",
      "The Lost Pod will tell you about its problem",
      "Listen carefully to what namespace it needs to be in",
    ],
  },
  "obj1-2": {
    objectiveId: "obj1-2",
    hints: [
      "Use the 'Get Pods' button or run: kubectl get pods -n wrong-namespace",
      "You can also click on the pod in the Cluster State viewer",
      "The pod status will show 'Pending' because the namespace doesn't exist",
    ],
    exampleCommands: ["kubectl get pods -n wrong-namespace", "kubectl describe pod lost-pod -n wrong-namespace"],
  },
  "obj1-3": {
    objectiveId: "obj1-3",
    hints: [
      "Click 'Apply YAML' button to open the YAML editor",
      "Load the template for Quest 1 (Lost Pod Template)",
      "Change the namespace from 'wrong-namespace' to 'forest'",
      "Make sure the indentation is correct (use spaces, not tabs)",
    ],
    exampleYaml: `apiVersion: v1
kind: Pod
metadata:
  name: lost-pod
  namespace: forest  # Changed from 'wrong-namespace'
  labels:
    app: web
spec:
  containers:
    - name: nginx
      image: nginx:latest`,
  },
  "obj1-4": {
    objectiveId: "obj1-4",
    hints: [
      "After editing the YAML, click 'Apply YAML' button",
      "Wait for the success message",
      "Check the Cluster State viewer to see the pod is now Running",
      "The pod should be in the 'forest' namespace",
    ],
  },

  // Quest 2: The Crashing Treant
  "obj2-1": {
    objectiveId: "obj2-1",
    hints: [
      "Click on the 'Treant Pod' NPC",
      "It will tell you it's crashing repeatedly",
      "Listen to what it says about the error",
    ],
  },
  "obj2-2": {
    objectiveId: "obj2-2",
    hints: [
      "Use kubectl logs to see why the pod is crashing",
      "Run: kubectl logs treant-pod -n forest",
      "The logs will show the error message",
      "Look for 'command not found' or similar errors",
    ],
    exampleCommands: ["kubectl logs treant-pod -n forest", "kubectl describe pod treant-pod -n forest"],
  },
  "obj2-3": {
    objectiveId: "obj2-3",
    hints: [
      "The error shows 'invalid-command' doesn't exist",
      "Load the Treant Pod template from the YAML editor",
      "Replace the command with a valid one like: ['sh', '-c', 'sleep 3600']",
      "Valid commands include: sh, sleep, nginx, etc.",
    ],
    exampleYaml: `apiVersion: v1
kind: Pod
metadata:
  name: treant-pod
  namespace: forest
spec:
  containers:
    - name: app
      image: busybox:latest
      command: ["sh", "-c", "sleep 3600"]  # Fixed command`,
  },
  "obj2-4": {
    objectiveId: "obj2-4",
    hints: [
      "Apply the fixed YAML",
      "Wait a moment for the pod to restart",
      "Check the pod status - it should change from CrashLoopBackOff to Running",
      "Use 'kubectl get pods -n forest' to verify",
    ],
  },

  // Quest 3: The Mismatched Labels
  "obj3-1": {
    objectiveId: "obj3-1",
    hints: [
      "Click on the 'Service Guardian' NPC",
      "It will tell you it can't find any pods",
      "The problem is a label mismatch",
    ],
  },
  "obj3-2": {
    objectiveId: "obj3-2",
    hints: [
      "Use kubectl describe to see the service selector",
      "Run: kubectl describe service web-service -n forest",
      "Look for the 'Selector' field",
      "Note what labels the service is looking for",
    ],
    exampleCommands: ["kubectl describe service web-service -n forest"],
  },
  "obj3-3": {
    objectiveId: "obj3-3",
    hints: [
      "Now check the pod's labels",
      "Run: kubectl describe pod web-pod -n forest",
      "Look for the 'Labels' field",
      "Compare the pod labels with the service selector",
    ],
    exampleCommands: ["kubectl describe pod web-pod -n forest"],
  },
  "obj3-4": {
    objectiveId: "obj3-4",
    hints: [
      "The service looks for 'app: web' but the pod has 'app: webapp'",
      "You can fix either the service selector OR the pod labels",
      "Load the appropriate template (Service Fix or Pod Fix)",
      "Make the labels match, then apply the YAML",
      "After applying, the service should find the pod",
    ],
    exampleYaml: `# Option 1: Fix the service selector
apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: forest
spec:
  selector:
    app: webapp  # Changed to match pod label
  ports:
    - port: 80

# Option 2: Fix the pod label
apiVersion: v1
kind: Pod
metadata:
  name: web-pod
  namespace: forest
  labels:
    app: web  # Changed to match service selector
spec:
  containers:
    - name: nginx
      image: nginx:latest`,
  },
};

/**
 * Get hints for an objective
 */
export function getHintsForObjective(objectiveId: string): QuestHint | null {
  return questHints[objectiveId] || null;
}

