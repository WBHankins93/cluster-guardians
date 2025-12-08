"use client";

import { ClusterState, Pod, Service, PodStatus } from "@/shared/types/kubernetes";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { useState } from "react";

interface ClusterStateViewerProps {
  clusterState: ClusterState | null;
  onResourceClick?: (type: string, name: string, namespace: string) => void;
}

export function ClusterStateViewer({ clusterState, onResourceClick }: ClusterStateViewerProps) {
  const [selectedTab, setSelectedTab] = useState<"pods" | "services" | "deployments">("pods");

  if (!clusterState) {
    return (
      <Card variant="bordered">
        <CardContent>
          <p className="text-gray-500 text-center py-8">No cluster state available</p>
        </CardContent>
      </Card>
    );
  }

  const getPodStatusVariant = (status?: PodStatus): "success" | "warning" | "danger" | "info" => {
    switch (status) {
      case "Running":
      case "Succeeded":
        return "success";
      case "Pending":
      case "ContainerCreating":
        return "warning";
      case "CrashLoopBackOff":
      case "Failed":
        return "danger";
      case "ImagePullBackOff":
      case "ErrImagePull":
        return "info";
      default:
        return "warning";
    }
  };

  return (
    <Card variant="bordered" className="h-full">
      <CardHeader>
        <CardTitle>Cluster State</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Tabs */}
        <div className="flex space-x-2 mb-4 border-b border-gray-700">
          <button
            onClick={() => setSelectedTab("pods")}
            className={`px-4 py-2 font-semibold transition-colors ${
              selectedTab === "pods"
                ? "text-k8s-blue border-b-2 border-k8s-blue"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Pods ({clusterState.pods.length})
          </button>
          <button
            onClick={() => setSelectedTab("services")}
            className={`px-4 py-2 font-semibold transition-colors ${
              selectedTab === "services"
                ? "text-k8s-blue border-b-2 border-k8s-blue"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Services ({clusterState.services.length})
          </button>
          <button
            onClick={() => setSelectedTab("deployments")}
            className={`px-4 py-2 font-semibold transition-colors ${
              selectedTab === "deployments"
                ? "text-k8s-blue border-b-2 border-k8s-blue"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Deployments ({clusterState.deployments.length})
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2 max-h-96 overflow-y-auto terminal-scrollbar">
          {selectedTab === "pods" && (
            <>
              {clusterState.pods.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pods found</p>
              ) : (
                clusterState.pods.map((pod) => (
                  <PodRow
                    key={`${pod.metadata.namespace}-${pod.metadata.name}`}
                    pod={pod}
                    onClick={() =>
                      onResourceClick?.(
                        "pod",
                        pod.metadata.name,
                        pod.metadata.namespace
                      )
                    }
                  />
                ))
              )}
            </>
          )}

          {selectedTab === "services" && (
            <>
              {clusterState.services.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No services found</p>
              ) : (
                clusterState.services.map((service) => (
                  <ServiceRow
                    key={`${service.metadata.namespace}-${service.metadata.name}`}
                    service={service}
                    onClick={() =>
                      onResourceClick?.(
                        "service",
                        service.metadata.name,
                        service.metadata.namespace
                      )
                    }
                  />
                ))
              )}
            </>
          )}

          {selectedTab === "deployments" && (
            <>
              {clusterState.deployments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No deployments found</p>
              ) : (
                clusterState.deployments.map((deployment) => (
                  <div
                    key={`${deployment.metadata.namespace}-${deployment.metadata.name}`}
                    className="bg-gray-700/50 rounded p-3 hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() =>
                      onResourceClick?.(
                        "deployment",
                        deployment.metadata.name,
                        deployment.metadata.namespace
                      )
                    }
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-mono font-semibold text-gray-100">
                          {deployment.metadata.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          Namespace: {deployment.metadata.namespace}
                        </div>
                      </div>
                      <Badge variant="info">
                        {deployment.status?.readyReplicas || 0}/{deployment.spec.replicas}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PodRow({ pod, onClick }: { pod: Pod; onClick: () => void }) {
  const status = pod.status?.phase || "Pending";
  const variant = getPodStatusVariant(pod.status?.phase);

  return (
    <div
      className="bg-gray-700/50 rounded p-3 hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-mono font-semibold text-gray-100">{pod.metadata.name}</div>
          <div className="text-sm text-gray-400 mt-1">
            Namespace: {pod.metadata.namespace}
          </div>
          {pod.status?.message && (
            <div className="text-xs text-gray-500 mt-1 italic">{pod.status.message}</div>
          )}
        </div>
        <Badge variant={variant}>{status}</Badge>
      </div>
    </div>
  );
}

function ServiceRow({ service, onClick }: { service: Service; onClick: () => void }) {
  return (
    <div
      className="bg-gray-700/50 rounded p-3 hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-mono font-semibold text-gray-100">{service.metadata.name}</div>
          <div className="text-sm text-gray-400 mt-1">
            Namespace: {service.metadata.namespace}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Type: {service.spec.type} | Ports:{" "}
            {service.spec.ports.map((p) => p.port).join(", ")}
          </div>
        </div>
        <Badge variant="info">{service.spec.type}</Badge>
      </div>
    </div>
  );
}

function getPodStatusVariant(status?: PodStatus): "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "Running":
    case "Succeeded":
      return "success";
    case "Pending":
    case "ContainerCreating":
      return "warning";
    case "CrashLoopBackOff":
    case "Failed":
      return "danger";
    case "ImagePullBackOff":
    case "ErrImagePull":
      return "info";
    default:
      return "warning";
  }
}
