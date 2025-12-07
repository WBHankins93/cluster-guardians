/**
 * Game Constants
 */

export const GAME_VERSION = "0.1.0";
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 50;

export const WORLDS = {
  NAMESPACE_FOREST: "namespace-forest",
  DEPLOYMENT_HILLS: "deployment-hills",
  SERVICE_DOCKS: "service-docks",
  INGRESS_CANYON: "ingress-canyon",
  STORAGE_CAVERNS: "storage-caverns",
  SECRETS_AUDITORIUM: "secrets-auditorium",
  RBAC_CITADEL: "rbac-citadel",
} as const;

export const DEFAULT_NAMESPACE = "default";

// Pod status colors for UI
export const POD_STATUS_COLORS = {
  Running: "text-pod-running",
  Pending: "text-pod-pending",
  CrashLoopBackOff: "text-pod-crash",
  ImagePullBackOff: "text-pod-image",
  Failed: "text-pod-crash",
  Succeeded: "text-pod-running",
  ContainerCreating: "text-pod-pending",
  ErrImagePull: "text-pod-image",
} as const;

// kubectl command templates
export const KUBECTL_COMMANDS = {
  GET: "kubectl get",
  DESCRIBE: "kubectl describe",
  LOGS: "kubectl logs",
  APPLY: "kubectl apply",
  DELETE: "kubectl delete",
  EDIT: "kubectl edit",
  SCALE: "kubectl scale",
  EXEC: "kubectl exec",
} as const;

// Error messages that can appear in game
export const K8S_ERROR_MESSAGES = {
  IMAGE_PULL_BACKOFF: "Failed to pull image: image not found or invalid credentials",
  CRASHLOOP_BACKOFF: "Container is crashing repeatedly. Check logs for details.",
  PENDING: "Pod is waiting to be scheduled. Check node resources.",
  SELECTOR_MISMATCH: "Service selector does not match any pods. Check labels.",
  PORT_MISMATCH: "Container port does not match service target port.",
  NAMESPACE_NOT_FOUND: "Namespace does not exist.",
  RESOURCE_NOT_FOUND: "Resource not found in the specified namespace.",
} as const;
