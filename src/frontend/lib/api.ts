import { ClusterState } from "@/shared/types/kubernetes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface KubectlResponse {
  output: string;
  exitCode: number;
}

interface ApplyResponse {
  message: string;
  resource: any;
}

interface ScenarioResponse {
  message: string;
  state: ClusterState;
}

/**
 * API Client for Cluster Guardians Backend
 */
export const api = {
  /**
   * Health check
   */
  async health(): Promise<{ status: string; version: string }> {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error("Health check failed");
    }
    return response.json();
  },

  /**
   * Get current cluster state
   */
  async getClusterState(): Promise<ClusterState> {
    const response = await fetch(`${API_BASE_URL}/api/cluster/state`);
    if (!response.ok) {
      throw new Error("Failed to fetch cluster state");
    }
    return response.json();
  },

  /**
   * Reset cluster to initial state
   */
  async resetCluster(): Promise<{ message: string; state: ClusterState }> {
    const response = await fetch(`${API_BASE_URL}/api/cluster/reset`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to reset cluster");
    }
    return response.json();
  },

  /**
   * Execute a kubectl command
   */
  async executeKubectl(command: string): Promise<KubectlResponse> {
    const response = await fetch(`${API_BASE_URL}/api/kubectl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        output: data.error || "Command failed",
        exitCode: 1,
      };
    }

    return data;
  },

  /**
   * Apply YAML configuration
   */
  async applyYAML(yaml: string): Promise<ApplyResponse> {
    const response = await fetch(`${API_BASE_URL}/api/kubectl/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ yaml }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to apply YAML");
    }

    return response.json();
  },

  /**
   * Load a scenario (quest setup)
   */
  async loadScenario(scenarioId: string): Promise<ScenarioResponse> {
    const response = await fetch(`${API_BASE_URL}/api/scenario/load`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scenarioId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to load scenario");
    }

    return response.json();
  },
};

/**
 * Helper functions for common operations
 */
export const helpers = {
  /**
   * Get pods in a namespace
   */
  async getPodsInNamespace(namespace: string = "default"): Promise<KubectlResponse> {
    return api.executeKubectl(`kubectl get pods -n ${namespace}`);
  },

  /**
   * Describe a resource
   */
  async describeResource(
    resourceType: string,
    name: string,
    namespace: string = "default"
  ): Promise<KubectlResponse> {
    return api.executeKubectl(`kubectl describe ${resourceType} ${name} -n ${namespace}`);
  },

  /**
   * Get logs from a pod
   */
  async getPodLogs(podName: string, namespace: string = "default"): Promise<KubectlResponse> {
    return api.executeKubectl(`kubectl logs ${podName} -n ${namespace}`);
  },

  /**
   * Delete a resource
   */
  async deleteResource(
    resourceType: string,
    name: string,
    namespace: string = "default"
  ): Promise<KubectlResponse> {
    return api.executeKubectl(`kubectl delete ${resourceType} ${name} -n ${namespace}`);
  },
};
