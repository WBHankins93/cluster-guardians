/**
 * Kubernetes Object Types for Cluster Guardians
 * Simplified models for game simulation
 */

export type PodStatus =
  | "Pending"
  | "Running"
  | "Succeeded"
  | "Failed"
  | "CrashLoopBackOff"
  | "ImagePullBackOff"
  | "ContainerCreating"
  | "ErrImagePull";

export type ServiceType = "ClusterIP" | "NodePort" | "LoadBalancer" | "ExternalName";

export interface Labels {
  [key: string]: string;
}

export interface Annotations {
  [key: string]: string;
}

export interface Container {
  name: string;
  image: string;
  command?: string[];
  args?: string[];
  env?: EnvVar[];
  ports?: ContainerPort[];
}

export interface EnvVar {
  name: string;
  value?: string;
  valueFrom?: {
    secretKeyRef?: {
      name: string;
      key: string;
    };
    configMapKeyRef?: {
      name: string;
      key: string;
    };
  };
}

export interface ContainerPort {
  name?: string;
  containerPort: number;
  protocol?: "TCP" | "UDP";
}

export interface Pod {
  apiVersion: string;
  kind: "Pod";
  metadata: {
    name: string;
    namespace: string;
    labels?: Labels;
    annotations?: Annotations;
  };
  spec: {
    containers: Container[];
    restartPolicy?: "Always" | "OnFailure" | "Never";
  };
  status?: {
    phase: PodStatus;
    message?: string;
    reason?: string;
    conditions?: PodCondition[];
    containerStatuses?: ContainerStatus[];
  };
}

export interface PodCondition {
  type: string;
  status: "True" | "False" | "Unknown";
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface ContainerStatus {
  name: string;
  ready: boolean;
  restartCount: number;
  state?: {
    waiting?: {
      reason: string;
      message?: string;
    };
    running?: {
      startedAt: string;
    };
    terminated?: {
      exitCode: number;
      reason?: string;
      message?: string;
    };
  };
}

export interface Deployment {
  apiVersion: string;
  kind: "Deployment";
  metadata: {
    name: string;
    namespace: string;
    labels?: Labels;
  };
  spec: {
    replicas: number;
    selector: {
      matchLabels: Labels;
    };
    template: {
      metadata: {
        labels: Labels;
      };
      spec: {
        containers: Container[];
      };
    };
  };
  status?: {
    availableReplicas?: number;
    readyReplicas?: number;
    replicas?: number;
    updatedReplicas?: number;
  };
}

export interface Service {
  apiVersion: string;
  kind: "Service";
  metadata: {
    name: string;
    namespace: string;
    labels?: Labels;
  };
  spec: {
    type: ServiceType;
    selector: Labels;
    ports: ServicePort[];
    clusterIP?: string;
  };
  status?: {
    loadBalancer?: {
      ingress?: Array<{
        ip?: string;
        hostname?: string;
      }>;
    };
  };
}

export interface ServicePort {
  name?: string;
  port: number;
  targetPort: number | string;
  nodePort?: number;
  protocol?: "TCP" | "UDP";
}

export interface ConfigMap {
  apiVersion: string;
  kind: "ConfigMap";
  metadata: {
    name: string;
    namespace: string;
  };
  data: {
    [key: string]: string;
  };
}

export interface Secret {
  apiVersion: string;
  kind: "Secret";
  metadata: {
    name: string;
    namespace: string;
  };
  type: string;
  data: {
    [key: string]: string; // base64 encoded
  };
}

export interface PersistentVolumeClaim {
  apiVersion: string;
  kind: "PersistentVolumeClaim";
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    accessModes: string[];
    resources: {
      requests: {
        storage: string;
      };
    };
    storageClassName?: string;
  };
  status?: {
    phase: "Pending" | "Bound" | "Lost";
  };
}

export interface Namespace {
  apiVersion: string;
  kind: "Namespace";
  metadata: {
    name: string;
  };
  status?: {
    phase: "Active" | "Terminating";
  };
}

// Union type for all K8s resources
export type KubernetesResource =
  | Pod
  | Deployment
  | Service
  | ConfigMap
  | Secret
  | PersistentVolumeClaim
  | Namespace;

// Cluster state representation
export interface ClusterState {
  namespaces: Namespace[];
  pods: Pod[];
  deployments: Deployment[];
  services: Service[];
  configMaps: ConfigMap[];
  secrets: Secret[];
  pvcs: PersistentVolumeClaim[];
}
