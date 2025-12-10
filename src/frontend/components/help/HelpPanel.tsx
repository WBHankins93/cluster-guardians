"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@/components/ui";

interface HelpSection {
  id: string;
  title: string;
  content: string;
  examples?: string[];
}

const helpSections: HelpSection[] = [
  {
    id: "kubectl-basics",
    title: "kubectl Command Basics",
    content:
      "kubectl is the command-line interface for Kubernetes. Here are the most common commands you'll use:",
    examples: [
      "kubectl get pods -n forest",
      "kubectl describe pod lost-pod -n forest",
      "kubectl logs treant-pod -n forest",
      "kubectl get services -n forest",
    ],
  },
  {
    id: "yaml-structure",
    title: "YAML File Structure",
    content:
      "Every Kubernetes resource in YAML has this basic structure:\n\n" +
      "apiVersion: v1\n" +
      "kind: Pod\n" +
      "metadata:\n" +
      "  name: my-pod\n" +
      "  namespace: forest\n" +
      "spec:\n" +
      "  containers:\n" +
      "    - name: app\n" +
      "      image: nginx:latest",
  },
  {
    id: "common-errors",
    title: "Common Errors & Solutions",
    content:
      "NamespaceNotFound: The namespace doesn't exist. Make sure you're using 'forest' or 'default'.\n\n" +
      "CrashLoopBackOff: The container is crashing. Check the logs and fix the command or image.\n\n" +
      "ImagePullBackOff: The container image can't be pulled. Use a valid image like 'nginx:latest' or 'busybox:latest'.\n\n" +
      "Selector Mismatch: Service labels don't match pod labels. Make sure they're identical.",
  },
  {
    id: "quest-tips",
    title: "Quest Completion Tips",
    content:
      "1. Always talk to NPCs first - they give important hints\n" +
      "2. Use 'kubectl get' to see current state\n" +
      "3. Use 'kubectl describe' to see detailed information\n" +
      "4. Check logs if a pod is crashing\n" +
      "5. Use the YAML templates provided - don't start from scratch\n" +
      "6. Click resources in the Cluster State viewer for quick commands",
  },
];

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const section = selectedSection
    ? helpSections.find((s) => s.id === selectedSection)
    : null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card variant="bordered" className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-k8s-blue-light">📖 Help & Reference</CardTitle>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Sidebar */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-300 mb-2">Topics</h3>
              {helpSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full text-left p-3 rounded border transition-all ${
                    selectedSection === section.id
                      ? "border-k8s-blue bg-k8s-blue/10"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-200">
                    {section.title}
                  </div>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="space-y-4">
              {section ? (
                <>
                  <div>
                    <h3 className="text-xl font-bold text-gray-100 mb-2">
                      {section.title}
                    </h3>
                    <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                      {section.content}
                    </pre>
                  </div>

                  {section.examples && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-2">Examples:</h4>
                      <div className="space-y-2">
                        {section.examples.map((example, index) => (
                          <div
                            key={index}
                            className="bg-gray-800 p-3 rounded font-mono text-sm text-k8s-blue-light border border-gray-700"
                          >
                            {example}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Select a topic from the left to view help content
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

