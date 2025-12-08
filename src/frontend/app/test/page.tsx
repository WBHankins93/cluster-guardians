"use client";

import { useState } from "react";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Dialog } from "@/components/dialog";
import { ClusterStateViewer } from "@/components/game";
import { QuestTracker } from "@/components/game";
import { Quest, DialogNode } from "@/shared/types/game";
import { ClusterState } from "@/shared/types/kubernetes";

export default function TestPage() {
  const [showDialog, setShowDialog] = useState(false);

  // Test data
  const testQuest: Quest = {
    id: "test-quest",
    title: "Fix the Lost Pod",
    description: "A pod has wandered into the wrong namespace. Help it find its way home!",
    worldId: "namespace-forest",
    objectives: [
      {
        id: "obj-1",
        description: "Find the lost pod",
        type: "talk-to-npc",
        isCompleted: true,
      },
      {
        id: "obj-2",
        description: "Identify the correct namespace",
        type: "fix-pod",
        target: "lost-pod",
        isCompleted: true,
      },
      {
        id: "obj-3",
        description: "Apply the corrected YAML",
        type: "fix-pod",
        isCompleted: false,
      },
    ],
    rewards: {
      xp: 100,
      title: "Pod Wrangler",
    },
    isCompleted: false,
    isActive: true,
  };

  const testDialog: DialogNode = {
    id: "dialog-1",
    text: "Greetings, Cluster Guardian! I am the Kube Sage, keeper of YAML wisdom. The Namespace Forest is troubled by corrupted pods...",
    speaker: "Kube Sage",
    choices: [
      {
        text: "Tell me more about the corrupted pods",
        nextNodeId: "dialog-2",
      },
      {
        text: "How can I help?",
        nextNodeId: "dialog-3",
      },
    ],
  };

  const testClusterState: ClusterState = {
    namespaces: [
      {
        apiVersion: "v1",
        kind: "Namespace",
        metadata: { name: "default" },
        status: { phase: "Active" },
      },
      {
        apiVersion: "v1",
        kind: "Namespace",
        metadata: { name: "forest" },
        status: { phase: "Active" },
      },
    ],
    pods: [
      {
        apiVersion: "v1",
        kind: "Pod",
        metadata: {
          name: "lost-pod",
          namespace: "wrong-namespace",
          labels: { app: "web" },
        },
        spec: {
          containers: [
            {
              name: "nginx",
              image: "nginx:latest",
            },
          ],
        },
        status: {
          phase: "Pending",
          reason: "NamespaceNotFound",
          message: "Namespace 'wrong-namespace' does not exist",
        },
      },
      {
        apiVersion: "v1",
        kind: "Pod",
        metadata: {
          name: "healthy-pod",
          namespace: "forest",
          labels: { app: "web" },
        },
        spec: {
          containers: [
            {
              name: "nginx",
              image: "nginx:latest",
            },
          ],
        },
        status: {
          phase: "Running",
        },
      },
    ],
    services: [
      {
        apiVersion: "v1",
        kind: "Service",
        metadata: {
          name: "web-service",
          namespace: "forest",
        },
        spec: {
          type: "ClusterIP",
          selector: { app: "web" },
          ports: [{ port: 80, targetPort: 80 }],
        },
      },
    ],
    deployments: [],
    configMaps: [],
    secrets: [],
    pvcs: [],
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-k8s-blue-light">
          Phase 3 Component Test Page
        </h1>

        {/* UI Components */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>UI Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-x-2">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="danger">Danger Button</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>

              <div className="space-x-2">
                <Badge variant="success">Running</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="danger">CrashLoopBackOff</Badge>
                <Badge variant="info">Info</Badge>
              </div>

              <Button onClick={() => setShowDialog(true)}>Show Dialog</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quest Tracker */}
        <QuestTracker quest={testQuest} />

        {/* Cluster State Viewer */}
        <ClusterStateViewer
          clusterState={testClusterState}
          onResourceClick={(type, name, namespace) => {
            console.log(`Clicked: ${type}/${name} in ${namespace}`);
            alert(`Clicked: ${type}/${name} in ${namespace}`);
          }}
        />

        {/* Dialog */}
        {showDialog && (
          <Dialog
            dialog={testDialog}
            onChoice={(nextNodeId) => {
              console.log("Choice selected:", nextNodeId);
              setShowDialog(false);
            }}
            onClose={() => setShowDialog(false)}
            npcName="Kube Sage"
          />
        )}
      </div>
    </div>
  );
}
