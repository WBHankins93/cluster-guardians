/**
 * YAML Templates for quests - Pre-filled templates to help beginners
 */

export interface YAMLTemplate {
  questId: string;
  name: string;
  description: string;
  yaml: string;
  editableFields?: string[]; // Fields that should be highlighted as editable
}

export const yamlTemplates: Record<string, YAMLTemplate> = {
  "quest1-lost-pod": {
    questId: "quest1",
    name: "Lost Pod Template",
    description: "Template for fixing the lost pod namespace issue",
    yaml: `apiVersion: v1
kind: Pod
metadata:
  name: lost-pod
  namespace: forest  # Change this from 'wrong-namespace' to 'forest'
  labels:
    app: web
spec:
  containers:
    - name: nginx
      image: nginx:latest
      ports:
        - containerPort: 80`,
    editableFields: ["namespace"],
  },
  "quest2-treant-pod": {
    questId: "quest2",
    name: "Treant Pod Template",
    description: "Template for fixing the CrashLoopBackOff issue",
    yaml: `apiVersion: v1
kind: Pod
metadata:
  name: treant-pod
  namespace: forest
  labels:
    app: treant
spec:
  containers:
    - name: app
      image: busybox:latest
      command: ["sh", "-c", "sleep 3600"]  # Replace 'invalid-command' with a valid command
      # Examples of valid commands:
      # ["sh", "-c", "sleep 3600"]
      # ["sh", "-c", "echo 'Hello' && sleep 3600"]
      # ["nginx", "-g", "daemon off;"]`,
    editableFields: ["command"],
  },
  "quest3-service-fix": {
    questId: "quest3",
    name: "Service Label Fix Template",
    description: "Template for fixing service selector mismatch",
    yaml: `apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: forest
spec:
  type: ClusterIP
  selector:
    app: webapp  # Change this to match the pod's label, OR change the pod's label to 'web'
  ports:
    - port: 80
      targetPort: 80`,
    editableFields: ["selector"],
  },
  "quest3-pod-fix": {
    questId: "quest3",
    name: "Pod Label Fix Template",
    description: "Alternative: Fix the pod labels instead",
    yaml: `apiVersion: v1
kind: Pod
metadata:
  name: web-pod
  namespace: forest
  labels:
    app: web  # Change this from 'webapp' to 'web' to match the service
spec:
  containers:
    - name: nginx
      image: nginx:latest
      ports:
        - containerPort: 80`,
    editableFields: ["labels"],
  },
};

/**
 * Get template for a quest
 */
export function getTemplateForQuest(questId: string): YAMLTemplate | null {
  const templates = Object.values(yamlTemplates).filter((t) => t.questId === questId);
  return templates[0] || null;
}

/**
 * Get all templates for a quest
 */
export function getTemplatesForQuest(questId: string): YAMLTemplate[] {
  return Object.values(yamlTemplates).filter((t) => t.questId === questId);
}

