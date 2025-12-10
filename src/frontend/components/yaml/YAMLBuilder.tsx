"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";

interface YAMLBuilderProps {
  onGenerate: (yaml: string) => void;
  onCancel: () => void;
  initialValues?: {
    kind?: string;
    name?: string;
    namespace?: string;
    image?: string;
    command?: string;
  };
}

export function YAMLBuilder({ onGenerate, onCancel, initialValues }: YAMLBuilderProps) {
  const [kind, setKind] = useState(initialValues?.kind || "Pod");
  const [name, setName] = useState(initialValues?.name || "");
  const [namespace, setNamespace] = useState(initialValues?.namespace || "forest");
  const [image, setImage] = useState(initialValues?.image || "nginx:latest");
  const [command, setCommand] = useState(initialValues?.command || "");
  const [labels, setLabels] = useState<Array<{ key: string; value: string }>>([
    { key: "app", value: "" },
  ]);

  const generateYAML = () => {
    let yaml = `apiVersion: v1\nkind: ${kind}\nmetadata:\n  name: ${name}\n  namespace: ${namespace}\n`;

    // Add labels
    const validLabels = labels.filter((l) => l.key && l.value);
    if (validLabels.length > 0) {
      yaml += "  labels:\n";
      validLabels.forEach((label) => {
        yaml += `    ${label.key}: ${label.value}\n`;
      });
    }

    if (kind === "Pod") {
      yaml += "spec:\n  containers:\n    - name: app\n";
      yaml += `      image: ${image}\n`;
      if (command) {
        yaml += `      command: [${command.split(" ").map((c) => `"${c}"`).join(", ")}]\n`;
      }
      yaml += "      ports:\n        - containerPort: 80\n";
    } else if (kind === "Service") {
      yaml += "spec:\n  type: ClusterIP\n";
      if (validLabels.length > 0) {
        yaml += "  selector:\n";
        validLabels.forEach((label) => {
          yaml += `    ${label.key}: ${label.value}\n`;
        });
      }
      yaml += "  ports:\n    - port: 80\n      targetPort: 80\n";
    }

    onGenerate(yaml);
  };

  const addLabel = () => {
    setLabels([...labels, { key: "", value: "" }]);
  };

  const updateLabel = (index: number, field: "key" | "value", value: string) => {
    const newLabels = [...labels];
    newLabels[index][field] = value;
    setLabels(newLabels);
  };

  const removeLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index));
  };

  return (
    <Card variant="bordered" className="w-full">
      <CardHeader>
        <CardTitle>YAML Builder (Visual Editor)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Resource Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Resource Type
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded border border-gray-700 focus:border-k8s-blue focus:outline-none"
            >
              <option value="Pod">Pod</option>
              <option value="Service">Service</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-pod"
              className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded border border-gray-700 focus:border-k8s-blue focus:outline-none"
            />
          </div>

          {/* Namespace */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Namespace
            </label>
            <select
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded border border-gray-700 focus:border-k8s-blue focus:outline-none"
            >
              <option value="forest">forest</option>
              <option value="default">default</option>
            </select>
          </div>

          {/* Container Image (for Pods) */}
          {kind === "Pod" && (
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                Container Image
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="nginx:latest"
                className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded border border-gray-700 focus:border-k8s-blue focus:outline-none"
              />
            </div>
          )}

          {/* Command (for Pods) */}
          {kind === "Pod" && (
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                Command (optional, space-separated)
              </label>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="sh -c sleep 3600"
                className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded border border-gray-700 focus:border-k8s-blue focus:outline-none"
              />
            </div>
          )}

          {/* Labels */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-300">
                Labels
              </label>
              <Button variant="secondary" size="sm" onClick={addLabel}>
                + Add Label
              </Button>
            </div>
            <div className="space-y-2">
              {labels.map((label, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={label.key}
                    onChange={(e) => updateLabel(index, "key", e.target.value)}
                    placeholder="key"
                    className="flex-1 px-3 py-2 bg-gray-800 text-gray-100 rounded border border-gray-700 focus:border-k8s-blue focus:outline-none"
                  />
                  <input
                    type="text"
                    value={label.value}
                    onChange={(e) => updateLabel(index, "value", e.target.value)}
                    placeholder="value"
                    className="flex-1 px-3 py-2 bg-gray-800 text-gray-100 rounded border border-gray-700 focus:border-k8s-blue focus:outline-none"
                  />
                  {labels.length > 1 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => removeLabel(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4 border-t border-gray-700">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={generateYAML}
              disabled={!name.trim()}
              className="flex-1"
            >
              Generate YAML
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

