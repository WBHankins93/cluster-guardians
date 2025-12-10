/**
 * Error Translator - Converts technical Kubernetes errors into beginner-friendly messages
 */

export interface FriendlyError {
  title: string;
  message: string;
  suggestions: string[];
  exampleCommand?: string;
  exampleYaml?: string;
}

const errorPatterns: Array<{
  pattern: RegExp;
  friendly: FriendlyError;
}> = [
  {
    pattern: /NamespaceNotFound|namespace.*does not exist/i,
    friendly: {
      title: "Namespace Not Found",
      message: "The namespace you're trying to use doesn't exist in the cluster.",
      suggestions: [
        "Use 'forest' namespace for quest-related resources",
        "Use 'default' namespace for general resources",
        "Check the namespace spelling - it's case-sensitive",
        "Make sure you're using the correct namespace in your YAML",
      ],
      exampleYaml: `metadata:
  name: my-pod
  namespace: forest  # Make sure this namespace exists`,
    },
  },
  {
    pattern: /CrashLoopBackOff|crash.*loop/i,
    friendly: {
      title: "Pod is Crashing",
      message: "The container inside the pod is starting and then immediately crashing, repeating this cycle.",
      suggestions: [
        "Check the pod logs: kubectl logs <pod-name> -n <namespace>",
        "The container command might be invalid - use valid commands like 'sh', 'sleep', 'nginx'",
        "The container image might be wrong - use valid images like 'nginx:latest', 'busybox:latest'",
        "Check if the container needs environment variables or configuration",
      ],
      exampleCommand: "kubectl logs treant-pod -n forest",
      exampleYaml: `spec:
  containers:
    - name: app
      image: busybox:latest
      command: ["sh", "-c", "sleep 3600"]  # Use a valid command`,
    },
  },
  {
    pattern: /ImagePullBackOff|Failed to pull image/i,
    friendly: {
      title: "Can't Pull Container Image",
      message: "Kubernetes can't download the container image you specified.",
      suggestions: [
        "Use a valid, publicly available image like 'nginx:latest' or 'busybox:latest'",
        "Check the image name spelling - it's case-sensitive",
        "Make sure the image exists in a public registry",
        "Try using a different tag (e.g., 'latest' instead of a specific version)",
      ],
      exampleYaml: `spec:
  containers:
    - name: app
      image: nginx:latest  # Use a valid image name`,
    },
  },
  {
    pattern: /selector.*match|no endpoints|0 endpoints/i,
    friendly: {
      title: "Service Can't Find Pods",
      message: "The service's label selector doesn't match any pod labels, so it has no endpoints.",
      suggestions: [
        "Check the service selector: kubectl describe service <name> -n <namespace>",
        "Check the pod labels: kubectl describe pod <name> -n <namespace>",
        "Make sure the labels match exactly (including case)",
        "You can fix either the service selector OR the pod labels to make them match",
      ],
      exampleCommand: "kubectl describe service web-service -n forest",
      exampleYaml: `# Make sure these match:
# Service selector:
spec:
  selector:
    app: web

# Pod labels:
metadata:
  labels:
    app: web  # Must match the service selector`,
    },
  },
  {
    pattern: /Invalid.*YAML|YAML.*error|parse.*error/i,
    friendly: {
      title: "YAML Format Error",
      message: "There's a problem with the YAML format - it might be missing required fields or have incorrect indentation.",
      suggestions: [
        "Check your indentation - use spaces, not tabs",
        "Make sure all required fields are present: apiVersion, kind, metadata, spec",
        "Check for typos in field names",
        "Use the YAML templates provided - they have the correct format",
        "Make sure colons (:) have a space after them",
      ],
      exampleYaml: `apiVersion: v1  # Required
kind: Pod      # Required
metadata:      # Required
  name: my-pod
spec:          # Required
  containers:
    - name: app
      image: nginx:latest`,
    },
  },
  {
    pattern: /command not found|invalid command/i,
    friendly: {
      title: "Invalid Container Command",
      message: "The command specified in the container doesn't exist or isn't valid.",
      suggestions: [
        "Use valid shell commands like 'sh', 'bash', 'sleep'",
        "For long-running containers, use: ['sh', '-c', 'sleep 3600']",
        "For web servers, use: ['nginx', '-g', 'daemon off;']",
        "Check the container image documentation for valid commands",
      ],
      exampleYaml: `spec:
  containers:
    - name: app
      image: busybox:latest
      command: ["sh", "-c", "sleep 3600"]  # Valid command`,
    },
  },
  {
    pattern: /resource.*not found|not found/i,
    friendly: {
      title: "Resource Not Found",
      message: "The resource you're looking for doesn't exist in the specified namespace.",
      suggestions: [
        "Check the resource name spelling",
        "Make sure you're using the correct namespace",
        "List all resources first: kubectl get pods -n <namespace>",
        "The resource might not have been created yet",
      ],
      exampleCommand: "kubectl get pods -n forest",
    },
  },
];

/**
 * Translate a technical error into a beginner-friendly message
 */
export function translateError(error: string): FriendlyError | null {
  for (const { pattern, friendly } of errorPatterns) {
    if (pattern.test(error)) {
      return friendly;
    }
  }

  // Default friendly error
  return {
    title: "Something Went Wrong",
    message: error,
    suggestions: [
      "Check the error message above for clues",
      "Try using the help panel (📖 button) for guidance",
      "Make sure you're using the correct namespace",
      "Verify your YAML format is correct",
    ],
  };
}

/**
 * Format error for display
 */
export function formatError(error: string): {
  friendly: FriendlyError | null;
  original: string;
} {
  return {
    friendly: translateError(error),
    original: error,
  };
}

