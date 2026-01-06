import { ClusterSimulator } from "./clusterSimulator";
import { Pod, Service, Deployment } from "../../../shared/types/kubernetes";

interface CommandResult {
  output: string;
  exitCode: number;
}

/**
 * KubectlParser - Parses and executes kubectl commands
 */
export class KubectlParser {
  private simulator: ClusterSimulator;

  constructor(simulator: ClusterSimulator) {
    this.simulator = simulator;
  }

  /**
   * Execute a kubectl command
   */
  public execute(command: string): CommandResult {
    const trimmed = command.trim();

    // Remove 'kubectl' prefix if present
    const cmd = trimmed.startsWith("kubectl ")
      ? trimmed.substring(8)
      : trimmed;

    const parts = this.parseCommand(cmd);
    const [action, ...args] = parts;

    try {
      switch (action) {
        case "get":
          return this.handleGet(args);
        case "describe":
          return this.handleDescribe(args);
        case "logs":
          return this.handleLogs(args);
        case "delete":
          return this.handleDelete(args);
        case "apply":
          return { output: "Use /api/kubectl/apply endpoint for YAML", exitCode: 1 };
        default:
          return {
            output: `Error: unknown command "${action}" for "kubectl"`,
            exitCode: 1,
          };
      }
    } catch (error) {
      return {
        output: error instanceof Error ? error.message : "Unknown error",
        exitCode: 1,
      };
    }
  }

  private parseCommand(cmd: string): string[] {
    // Simple parsing - split by spaces but respect quotes
    const parts: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < cmd.length; i++) {
      const char = cmd[i];

      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === " " && !inQuotes) {
        if (current) {
          parts.push(current);
          current = "";
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  private handleGet(args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        output: "Error: resource type required",
        exitCode: 1,
      };
    }

    const resourceType = args[0];
    const namespace = this.extractFlag(args, "-n", "--namespace") || "default";

    // Get resource name (second arg that doesn't start with -)
    let resourceName: string | undefined;
    if (args.length > 1 && !args[1].startsWith("-")) {
      resourceName = args[1];
    }

    const state = this.simulator.getState();

    // Handle specific resource
    if (resourceName) {
      const resource = this.simulator.getResource(resourceType, resourceName, namespace);
      if (!resource) {
        return {
          output: `Error from server (NotFound): ${resourceType} "${resourceName}" not found`,
          exitCode: 1,
        };
      }

      return {
        output: this.formatResource(resource),
        exitCode: 0,
      };
    }

    // Handle list
    switch (resourceType.toLowerCase()) {
      case "pods":
      case "pod":
      case "po":
        return this.formatPodList(
          state.pods.filter((p) => p.metadata.namespace === namespace)
        );
      case "services":
      case "service":
      case "svc":
        return this.formatServiceList(
          state.services.filter((s) => s.metadata.namespace === namespace)
        );
      case "deployments":
      case "deployment":
      case "deploy":
        return this.formatDeploymentList(
          state.deployments.filter((d) => d.metadata.namespace === namespace)
        );
      case "namespaces":
      case "namespace":
      case "ns":
        return this.formatNamespaceList(state.namespaces);
      default:
        return {
          output: `Error: the server doesn't have a resource type "${resourceType}"`,
          exitCode: 1,
        };
    }
  }

  private handleDescribe(args: string[]): CommandResult {
    if (args.length < 2) {
      return {
        output: "Error: resource type and name required",
        exitCode: 1,
      };
    }

    const [resourceType, resourceName] = args;
    const namespace = this.extractFlag(args, "-n", "--namespace") || "default";

    const resource = this.simulator.getResource(resourceType, resourceName, namespace);

    if (!resource) {
      return {
        output: `Error from server (NotFound): ${resourceType} "${resourceName}" not found`,
        exitCode: 1,
      };
    }

    return {
      output: this.formatDescribe(resource),
      exitCode: 0,
    };
  }

  private handleLogs(args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        output: "Error: pod name required",
        exitCode: 1,
      };
    }

    const podName = args[0];
    const namespace = this.extractFlag(args, "-n", "--namespace") || "default";

    const pod = this.simulator.getResource("pod", podName, namespace) as Pod | null;

    if (!pod) {
      return {
        output: `Error from server (NotFound): pods "${podName}" not found`,
        exitCode: 1,
      };
    }

    return {
      output: this.formatLogs(pod),
      exitCode: 0,
    };
  }

  private handleDelete(args: string[]): CommandResult {
    if (args.length < 2) {
      return {
        output: "Error: resource type and name required",
        exitCode: 1,
      };
    }

    const [resourceType, resourceName] = args;
    const namespace = this.extractFlag(args, "-n", "--namespace") || "default";

    const deleted = this.simulator.deleteResource(resourceType, resourceName, namespace);

    if (!deleted) {
      return {
        output: `Error from server (NotFound): ${resourceType} "${resourceName}" not found`,
        exitCode: 1,
      };
    }

    return {
      output: `${resourceType} "${resourceName}" deleted`,
      exitCode: 0,
    };
  }

  private extractFlag(args: string[], ...flags: string[]): string | null {
    for (let i = 0; i < args.length; i++) {
      if (flags.includes(args[i]) && i + 1 < args.length) {
        return args[i + 1];
      }
    }
    return null;
  }

  private formatPodList(pods: Pod[]): CommandResult {
    if (pods.length === 0) {
      return {
        output: "No resources found",
        exitCode: 0,
      };
    }

    const header = "NAME                    READY   STATUS              RESTARTS   AGE";
    const rows = pods.map((pod) => {
      const status = pod.status?.phase || "Unknown";
      const restarts =
        pod.status?.containerStatuses?.[0]?.restartCount?.toString() || "0";
      return `${pod.metadata.name.padEnd(24)}0/1     ${status.padEnd(20)}${restarts.padEnd(11)}1m`;
    });

    return {
      output: [header, ...rows].join("\n"),
      exitCode: 0,
    };
  }

  private formatServiceList(services: Service[]): CommandResult {
    if (services.length === 0) {
      return {
        output: "No resources found",
        exitCode: 0,
      };
    }

    const header = "NAME           TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE";
    const rows = services.map((svc) => {
      const clusterIP = svc.spec.clusterIP || "10.0.0.1";
      const ports = svc.spec.ports.map((p) => `${p.port}/${p.protocol || "TCP"}`).join(",");
      return `${svc.metadata.name.padEnd(15)}${svc.spec.type.padEnd(12)}${clusterIP.padEnd(15)}<none>        ${ports.padEnd(10)}1m`;
    });

    return {
      output: [header, ...rows].join("\n"),
      exitCode: 0,
    };
  }

  private formatDeploymentList(deployments: Deployment[]): CommandResult {
    if (deployments.length === 0) {
      return {
        output: "No resources found",
        exitCode: 0,
      };
    }

    const header = "NAME       READY   UP-TO-DATE   AVAILABLE   AGE";
    const rows = deployments.map((deploy) => {
      const ready = `${deploy.status?.readyReplicas || 0}/${deploy.spec.replicas}`;
      return `${deploy.metadata.name.padEnd(11)}${ready.padEnd(8)}${deploy.spec.replicas.toString().padEnd(13)}${(deploy.status?.availableReplicas || 0).toString().padEnd(12)}1m`;
    });

    return {
      output: [header, ...rows].join("\n"),
      exitCode: 0,
    };
  }

  private formatNamespaceList(namespaces: any[]): CommandResult {
    const header = "NAME       STATUS   AGE";
    const rows = namespaces.map((ns) => {
      return `${ns.metadata.name.padEnd(11)}${(ns.status?.phase || "Active").padEnd(9)}1m`;
    });

    return {
      output: [header, ...rows].join("\n"),
      exitCode: 0,
    };
  }

  private formatResource(resource: any): string {
    return JSON.stringify(resource, null, 2);
  }

  private formatDescribe(resource: any): string {
    const lines: string[] = [];

    lines.push(`Name:         ${resource.metadata.name}`);
    lines.push(`Namespace:    ${resource.metadata.namespace || "N/A"}`);

    if (resource.kind === "Pod") {
      const pod = resource as Pod;
      lines.push(`Status:       ${pod.status?.phase || "Unknown"}`);

      if (pod.status?.message) {
        lines.push(`Message:      ${pod.status.message}`);
      }

      lines.push("\nContainers:");
      pod.spec.containers.forEach((container) => {
        lines.push(`  ${container.name}:`);
        lines.push(`    Image:    ${container.image}`);
        if (container.command) {
          lines.push(`    Command:  ${container.command.join(" ")}`);
        }
      });

      if (pod.status?.containerStatuses) {
        lines.push("\nContainer Statuses:");
        pod.status.containerStatuses.forEach((cs) => {
          lines.push(`  ${cs.name}:`);
          lines.push(`    Ready:         ${cs.ready}`);
          lines.push(`    Restart Count: ${cs.restartCount}`);
          if (cs.state?.waiting) {
            lines.push(`    State:         Waiting`);
            lines.push(`      Reason:      ${cs.state.waiting.reason}`);
            if (cs.state.waiting.message) {
              lines.push(`      Message:     ${cs.state.waiting.message}`);
            }
          }
        });
      }
    }

    return lines.join("\n");
  }

  private formatLogs(pod: Pod): string {
    // Simulate logs based on pod status
    if (pod.status?.phase === "CrashLoopBackOff") {
      const containerStatus = pod.status?.containerStatuses?.[0];
      if (containerStatus?.state?.waiting?.message) {
        return containerStatus.state.waiting.message;
      }
      return "Error: container failed to start";
    }

    if (pod.status?.phase === "ImagePullBackOff") {
      return `Error: Failed to pull image "${pod.spec.containers[0]?.image}"`;
    }

    if (pod.status?.phase === "Running") {
      return "Application started successfully\nListening on port 80";
    }

    return "No logs available";
  }
}
