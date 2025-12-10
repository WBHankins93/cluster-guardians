"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { YAMLTemplate, getTemplatesForQuest } from "@/shared/data/yamlTemplates";

interface YAMLEditorProps {
  questId?: string;
  initialYaml?: string;
  onApply: (yaml: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function YAMLEditor({
  questId,
  initialYaml,
  onApply,
  onCancel,
  isLoading = false,
}: YAMLEditorProps) {
  const [yaml, setYaml] = useState(initialYaml || "");
  const [selectedTemplate, setSelectedTemplate] = useState<YAMLTemplate | null>(null);
  const [templates, setTemplates] = useState<YAMLTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (questId) {
      const questTemplates = getTemplatesForQuest(questId);
      setTemplates(questTemplates);
      if (questTemplates.length > 0 && !initialYaml) {
        setSelectedTemplate(questTemplates[0]);
        setYaml(questTemplates[0].yaml);
      }
    }
    if (initialYaml) {
      setYaml(initialYaml);
    }
  }, [questId, initialYaml]);

  const handleLoadTemplate = (template: YAMLTemplate) => {
    setSelectedTemplate(template);
    setYaml(template.yaml);
    setShowTemplates(false);
  };

  const handleApply = () => {
    if (yaml.trim()) {
      onApply(yaml);
    }
  };

  return (
    <Card variant="bordered" className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>YAML Editor</CardTitle>
          <div className="flex space-x-2">
            {templates.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                📋 Load Template
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Template selector */}
          {showTemplates && templates.length > 0 && (
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-sm font-semibold text-gray-300 mb-2">
                Available Templates:
              </div>
              <div className="space-y-2">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleLoadTemplate(template)}
                    className={`w-full text-left p-3 rounded border transition-all ${
                      selectedTemplate?.name === template.name
                        ? "border-k8s-blue bg-k8s-blue/10"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-200">
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Help text */}
          {selectedTemplate && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
              <div className="text-sm text-blue-200">
                💡 <strong>Tip:</strong> {selectedTemplate.description}
                {selectedTemplate.editableFields && (
                  <span className="block mt-1 text-xs">
                    Look for the highlighted fields that need to be changed.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* YAML Editor */}
          <div className="relative">
            <textarea
              value={yaml}
              onChange={(e) => setYaml(e.target.value)}
              placeholder="Paste or edit your YAML here..."
              className="w-full h-64 p-3 bg-gray-900 text-gray-100 font-mono text-sm rounded border border-gray-700 focus:border-k8s-blue focus:outline-none resize-y"
              spellCheck={false}
            />
            <div className="absolute top-2 right-2 text-xs text-gray-500">
              {yaml.split("\n").length} lines
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-400">
              {yaml.trim() ? (
                <span>Ready to apply</span>
              ) : (
                <span>Enter YAML or load a template</span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={!yaml.trim() || isLoading}>
                {isLoading ? "Applying..." : "Apply YAML"}
              </Button>
            </div>
          </div>

          {/* Quick reference */}
          <div className="bg-gray-800 p-3 rounded border border-gray-700">
            <div className="text-xs text-gray-400">
              <strong>Quick Reference:</strong> Make sure your YAML has:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Correct indentation (use spaces, not tabs)</li>
                <li>Valid namespace (use &apos;forest&apos; or &apos;default&apos;)</li>
                <li>Valid image names (e.g., &apos;nginx:latest&apos;, &apos;busybox:latest&apos;)</li>
                <li>Matching labels between pods and services</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

