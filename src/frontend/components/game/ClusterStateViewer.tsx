"use client";

import { ClusterState, Pod, Service, PodStatus } from "@/shared/types/kubernetes";
import { Card, CardHeader, CardTitle, CardContent, Badge, TerminalCard } from "@/components/ui";
import { useState } from "react";

interface ClusterStateViewerProps {
  clusterState: ClusterState | null;
  onResourceClick?: (type: string, name: string, namespace: string) => void;
}

export function ClusterStateViewer({ clusterState, onResourceClick }: ClusterStateViewerProps) {
  const [selectedTab, setSelectedTab] = useState<"pods" | "services" | "deployments">("pods");

  if (!clusterState) {
    return (
      <TerminalCard title="cluster_state.mon">
        <p className="text-terminal-gray text-center py-8 font-mono">
          [OFFLINE] No cluster state available
        </p>
      </TerminalCard>
    );
  }

  return (
    <TerminalCard title="cluster_state.mon">
      <CardTitle className="text-lg mb-4">CLUSTER MONITOR</CardTitle>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4 border-b border-terminal-green/20">
        <button
          onClick={() => setSelectedTab("pods")}
          className={`px-4 py-2 font-mono text-sm transition-all ${
            selectedTab === "pods"
              ? "text-terminal-green border-b-2 border-terminal-green bg-terminal-green/10"
              : "text-terminal-gray hover:text-terminal-white"
          }`}
        >
          PODS ({clusterState.pods.length})
        </button>
        <button
          onClick={() => setSelectedTab("services")}
          className={`px-4 py-2 font-mono text-sm transition-all ${
            selectedTab === "services"
              ? "text-terminal-cyan border-b-2 border-terminal-cyan bg-terminal-cyan/10"
              : "text-terminal-gray hover:text-terminal-white"
          }`}
        >
          SERVICES ({clusterState.services.length})
        </button>
        <button
          onClick={() => setSelectedTab("deployments")}
          className={`px-4 py-2 font-mono text-sm transition-all ${
            selectedTab === "deployments"
              ? "text-terminal-purple border-b-2 border-terminal-purple bg-terminal-purple/10"
              : "text-terminal-gray hover:text-terminal-white"
          }`}
        >
          DEPLOYMENTS ({clusterState.deployments.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2 max-h-96 overflow-y-auto terminal-scrollbar">
        {selectedTab === "pods" && (
          <>
            {clusterState.pods.length === 0 ? (
              <p className="text-terminal-gray text-center py-8 font-mono">[EMPTY] No pods found</p>
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
              <p className="text-terminal-gray text-center py-8 font-mono">[EMPTY] No services found</p>
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
              <p className="text-terminal-gray text-center py-8 font-mono">[EMPTY] No deployments found</p>
            ) : (
              clusterState.deployments.map((deployment) => (
                <div
                  key={`${deployment.metadata.namespace}-${deployment.metadata.name}`}
                  className="bg-terminal-black/50 rounded p-3 border border-terminal-purple/20 hover:border-terminal-purple/50 transition-all cursor-pointer"
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
                      <div className="font-mono font-semibold text-terminal-white">
                        {deployment.metadata.name}
                      </div>
                      <div className="text-sm text-terminal-gray font-mono">
                        ns: {deployment.metadata.namespace}
                      </div>
                    </div>
                    <Badge variant="purple">
                      {deployment.status?.readyReplicas || 0}/{deployment.spec.replicas}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </TerminalCard>
  );
}

function PodRow({ pod, onClick }: { pod: Pod; onClick: () => void }) {
  const status = pod.status?.phase || "Pending";
  const variant = getPodStatusVariant(pod.status?.phase);

  const statusGlow = {
    success: "border-terminal-green/20 hover:border-terminal-green/50",
    warning: "border-terminal-amber/20 hover:border-terminal-amber/50",
    danger: "border-terminal-red/20 hover:border-terminal-red/50",
    info: "border-terminal-purple/20 hover:border-terminal-purple/50",
  };

  return (
    <div
      className={`bg-terminal-black/50 rounded p-3 border ${statusGlow[variant]} transition-all cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-mono font-semibold text-terminal-white">{pod.metadata.name}</div>
          <div className="text-sm text-terminal-gray font-mono mt-1">
            ns: {pod.metadata.namespace}
          </div>
          {pod.status?.message && (
            <div className="text-xs text-terminal-red/70 mt-1 font-mono">{pod.status.message}</div>
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
      className="bg-terminal-black/50 rounded p-3 border border-terminal-cyan/20 hover:border-terminal-cyan/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-mono font-semibold text-terminal-white">{service.metadata.name}</div>
          <div className="text-sm text-terminal-gray font-mono mt-1">
            ns: {service.metadata.namespace}
          </div>
          <div className="text-xs text-terminal-cyan/70 mt-1 font-mono">
            {service.spec.type} | ports: {service.spec.ports.map((p) => p.port).join(", ")}
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
