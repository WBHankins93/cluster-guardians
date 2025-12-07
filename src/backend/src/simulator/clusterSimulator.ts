import * as yaml from "js-yaml";
import { v4 as uuidv4 } from "uuid";
import {
  ClusterState,
  Pod,
  Deployment,
  Service,
  Namespace,
  KubernetesResource,
} from "../../../shared/types/kubernetes";

/**
 * ClusterSimulator - Simulates a Kubernetes cluster for the game
 */
export class ClusterSimulator {
  private state: ClusterState;
  private scenarios: Map<string, () => void>;

  constructor() {
    this.state = this.createInitialState();
    this.scenarios = new Map();
    this.registerScenarios();
  }

  private createInitialState(): ClusterState {
    return {
      namespaces: [
        {
          apiVersion: "v1",
          kind: "Namespace",
          metadata: {
            name: "default",
          },
          status: {
            phase: "Active",
          },
        },
        {
          apiVersion: "v1",
          kind: "Namespace",
          metadata: {
            name: "forest",
          },
          status: {
            phase: "Active",
          },
        },
      ],
      pods: [],
      deployments: [],
      services: [],
      configMaps: [],
      secrets: [],
      pvcs: [],
    };
  }

  private registerScenarios(): void {
    // World 1 Quest 1: Pod is Pending due to wrong namespace
    this.scenarios.set("world1-quest1", () => {
      this.state.pods = [
        {
          apiVersion: "v1",
          kind: "Pod",
          metadata: {
            name: "lost-pod",
            namespace: "wrong-namespace",
            labels: {
              app: "web",
            },
          },
          spec: {
            containers: [
              {
                name: "nginx",
                image: "nginx:latest",
                ports: [{ containerPort: 80 }],
              },
            ],
          },
          status: {
            phase: "Pending",
            reason: "NamespaceNotFound",
            message: "Namespace 'wrong-namespace' does not exist",
          },
        },
      ];
    });

    // World 1 Quest 2: CrashLoop due to bad command
    this.scenarios.set("world1-quest2", () => {
      this.state.pods = [
        {
          apiVersion: "v1",
          kind: "Pod",
          metadata: {
            name: "treant-pod",
            namespace: "forest",
            labels: {
              app: "treant",
            },
          },
          spec: {
            containers: [
              {
                name: "app",
                image: "busybox:latest",
                command: ["invalid-command"],
              },
            ],
          },
          status: {
            phase: "CrashLoopBackOff",
            reason: "CrashLoopBackOff",
            message: "Back-off restarting failed container",
            containerStatuses: [
              {
                name: "app",
                ready: false,
                restartCount: 5,
                state: {
                  waiting: {
                    reason: "CrashLoopBackOff",
                    message: "Error: command not found: invalid-command",
                  },
                },
              },
            ],
          },
        },
      ];
    });

    // World 1 Quest 3: Service can't find pod (label mismatch)
    this.scenarios.set("world1-quest3", () => {
      this.state.pods = [
        {
          apiVersion: "v1",
          kind: "Pod",
          metadata: {
            name: "web-pod",
            namespace: "forest",
            labels: {
              app: "webapp", // Wrong label!
            },
          },
          spec: {
            containers: [
              {
                name: "nginx",
                image: "nginx:latest",
                ports: [{ containerPort: 80 }],
              },
            ],
          },
          status: {
            phase: "Running",
          },
        },
      ];

      this.state.services = [
        {
          apiVersion: "v1",
          kind: "Service",
          metadata: {
            name: "web-service",
            namespace: "forest",
          },
          spec: {
            type: "ClusterIP",
            selector: {
              app: "web", // Looking for app: web
            },
            ports: [
              {
                port: 80,
                targetPort: 80,
              },
            ],
          },
        },
      ];
    });
  }

  /**
   * Get current cluster state
   */
  public getState(): ClusterState {
    return JSON.parse(JSON.stringify(this.state)); // Deep clone
  }

  /**
   * Reset cluster to initial state
   */
  public reset(): void {
    this.state = this.createInitialState();
  }

  /**
   * Load a scenario (quest setup)
   */
  public loadScenario(scenarioId: string): void {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario "${scenarioId}" not found`);
    }
    this.reset();
    scenario();
  }

  /**
   * Apply YAML configuration
   */
  public applyYAML(yamlContent: string): { message: string; resource: any } {
    try {
      const parsed = yaml.load(yamlContent) as KubernetesResource;

      if (!parsed || !parsed.kind) {
        throw new Error("Invalid YAML: missing 'kind' field");
      }

      switch (parsed.kind) {
        case "Pod":
          return this.applyPod(parsed as Pod);
        case "Deployment":
          return this.applyDeployment(parsed as Deployment);
        case "Service":
          return this.applyService(parsed as Service);
        case "Namespace":
          return this.applyNamespace(parsed as Namespace);
        default:
          throw new Error(`Unsupported resource kind: ${parsed.kind}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to parse YAML: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private applyPod(pod: Pod): { message: string; resource: Pod } {
    // Validate namespace exists
    const namespaceExists = this.state.namespaces.some(
      (ns) => ns.metadata.name === pod.metadata.namespace
    );

    if (!namespaceExists) {
      pod.status = {
        phase: "Pending",
        reason: "NamespaceNotFound",
        message: `Namespace '${pod.metadata.namespace}' does not exist`,
      };
    } else {
      // Simulate pod creation
      pod.status = this.determinePodStatus(pod);
    }

    // Update or create pod
    const existingIndex = this.state.pods.findIndex(
      (p) =>
        p.metadata.name === pod.metadata.name &&
        p.metadata.namespace === pod.metadata.namespace
    );

    if (existingIndex >= 0) {
      this.state.pods[existingIndex] = pod;
      return {
        message: `pod/${pod.metadata.name} configured`,
        resource: pod,
      };
    } else {
      this.state.pods.push(pod);
      return {
        message: `pod/${pod.metadata.name} created`,
        resource: pod,
      };
    }
  }

  private determinePodStatus(pod: Pod): Pod["status"] {
    // Check for bad commands
    for (const container of pod.spec.containers) {
      if (container.command && container.command.includes("invalid-command")) {
        return {
          phase: "CrashLoopBackOff",
          reason: "CrashLoopBackOff",
          message: "Back-off restarting failed container",
          containerStatuses: [
            {
              name: container.name,
              ready: false,
              restartCount: 0,
              state: {
                waiting: {
                  reason: "CrashLoopBackOff",
                  message: `Error: command not found: ${container.command[0]}`,
                },
              },
            },
          ],
        };
      }

      // Check for invalid images
      if (container.image.includes("invalid") || container.image.includes("notfound")) {
        return {
          phase: "ImagePullBackOff",
          reason: "ImagePullBackOff",
          message: "Failed to pull image",
          containerStatuses: [
            {
              name: container.name,
              ready: false,
              restartCount: 0,
              state: {
                waiting: {
                  reason: "ImagePullBackOff",
                  message: `Failed to pull image "${container.image}"`,
                },
              },
            },
          ],
        };
      }
    }

    // Default: Running
    return {
      phase: "Running",
      containerStatuses: pod.spec.containers.map((c) => ({
        name: c.name,
        ready: true,
        restartCount: 0,
        state: {
          running: {
            startedAt: new Date().toISOString(),
          },
        },
      })),
    };
  }

  private applyDeployment(deployment: Deployment): { message: string; resource: Deployment } {
    const existingIndex = this.state.deployments.findIndex(
      (d) =>
        d.metadata.name === deployment.metadata.name &&
        d.metadata.namespace === deployment.metadata.namespace
    );

    if (existingIndex >= 0) {
      this.state.deployments[existingIndex] = deployment;
      return {
        message: `deployment/${deployment.metadata.name} configured`,
        resource: deployment,
      };
    } else {
      this.state.deployments.push(deployment);
      return {
        message: `deployment/${deployment.metadata.name} created`,
        resource: deployment,
      };
    }
  }

  private applyService(service: Service): { message: string; resource: Service } {
    const existingIndex = this.state.services.findIndex(
      (s) =>
        s.metadata.name === service.metadata.name &&
        s.metadata.namespace === service.metadata.namespace
    );

    if (existingIndex >= 0) {
      this.state.services[existingIndex] = service;
      return {
        message: `service/${service.metadata.name} configured`,
        resource: service,
      };
    } else {
      this.state.services.push(service);
      return {
        message: `service/${service.metadata.name} created`,
        resource: service,
      };
    }
  }

  private applyNamespace(namespace: Namespace): { message: string; resource: Namespace } {
    const existingIndex = this.state.namespaces.findIndex(
      (ns) => ns.metadata.name === namespace.metadata.name
    );

    namespace.status = { phase: "Active" };

    if (existingIndex >= 0) {
      this.state.namespaces[existingIndex] = namespace;
      return {
        message: `namespace/${namespace.metadata.name} configured`,
        resource: namespace,
      };
    } else {
      this.state.namespaces.push(namespace);
      return {
        message: `namespace/${namespace.metadata.name} created`,
        resource: namespace,
      };
    }
  }

  /**
   * Get resource by type and name
   */
  public getResource(
    kind: string,
    name: string,
    namespace: string = "default"
  ): KubernetesResource | null {
    switch (kind.toLowerCase()) {
      case "pod":
      case "pods":
      case "po":
        return (
          this.state.pods.find(
            (p) => p.metadata.name === name && p.metadata.namespace === namespace
          ) || null
        );
      case "deployment":
      case "deployments":
      case "deploy":
        return (
          this.state.deployments.find(
            (d) => d.metadata.name === name && d.metadata.namespace === namespace
          ) || null
        );
      case "service":
      case "services":
      case "svc":
        return (
          this.state.services.find(
            (s) => s.metadata.name === name && s.metadata.namespace === namespace
          ) || null
        );
      case "namespace":
      case "namespaces":
      case "ns":
        return this.state.namespaces.find((ns) => ns.metadata.name === name) || null;
      default:
        return null;
    }
  }

  /**
   * Delete resource
   */
  public deleteResource(kind: string, name: string, namespace: string = "default"): boolean {
    switch (kind.toLowerCase()) {
      case "pod":
      case "pods":
      case "po":
        const podIndex = this.state.pods.findIndex(
          (p) => p.metadata.name === name && p.metadata.namespace === namespace
        );
        if (podIndex >= 0) {
          this.state.pods.splice(podIndex, 1);
          return true;
        }
        break;
      case "service":
      case "services":
      case "svc":
        const svcIndex = this.state.services.findIndex(
          (s) => s.metadata.name === name && s.metadata.namespace === namespace
        );
        if (svcIndex >= 0) {
          this.state.services.splice(svcIndex, 1);
          return true;
        }
        break;
    }
    return false;
  }
}
