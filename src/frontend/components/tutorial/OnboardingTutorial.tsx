"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@/components/ui";
import { Dialog } from "@/components/dialog";

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  highlight?: string; // CSS selector or element ID to highlight
  action?: {
    type: "click" | "command" | "yaml";
    target: string;
    example?: string;
  };
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Cluster Guardians! 🎮",
    content:
      "You're about to learn Kubernetes through an interactive adventure. In this tutorial, we'll cover the basics you need to get started.",
  },
  {
    id: "kubectl-basics",
    title: "Understanding kubectl Commands",
    content:
      "kubectl is the command-line tool for Kubernetes. You'll use it to interact with your cluster.\n\n" +
      "Common commands:\n" +
      "• `kubectl get pods` - List all pods\n" +
      "• `kubectl describe pod <name>` - Get detailed info about a pod\n" +
      "• `kubectl logs <pod-name>` - View pod logs\n" +
      "• `kubectl apply -f <file>` - Apply YAML configuration",
  },
  {
    id: "yaml-basics",
    title: "YAML Configuration Files",
    content:
      "YAML files define Kubernetes resources. Every resource needs:\n\n" +
      "• `apiVersion` - The API version\n" +
      "• `kind` - Type of resource (Pod, Service, etc.)\n" +
      "• `metadata` - Name, namespace, labels\n" +
      "• `spec` - The desired state\n\n" +
      "Don't worry - we'll provide templates for you to edit!",
  },
  {
    id: "npcs",
    title: "Talking to NPCs",
    content:
      "NPCs (Non-Player Characters) will give you quests and hints. Click on them to start conversations. They'll guide you through each challenge.",
  },
  {
    id: "quests",
    title: "Completing Quests",
    content:
      "Quests have multiple objectives. Complete them step-by-step:\n\n" +
      "1. Talk to NPCs to learn about problems\n" +
      "2. Use kubectl commands to investigate\n" +
      "3. Fix YAML configurations\n" +
      "4. Apply your fixes\n\n" +
      "The quest tracker shows your progress!",
  },
  {
    id: "hints",
    title: "Getting Help",
    content:
      "Stuck? Look for:\n\n" +
      "• 💡 Hint buttons in quests\n" +
      "• 📖 Help panel (accessible anytime)\n" +
      "• Example commands in the interface\n" +
      "• YAML templates for each quest\n\n" +
      "There's no shame in using hints - learning is the goal!",
  },
  {
    id: "ready",
    title: "You're Ready! 🚀",
    content:
      "That's the basics! Remember:\n\n" +
      "• Take your time - there's no rush\n" +
      "• Use hints when needed\n" +
      "• Experiment with commands\n" +
      "• Learn from mistakes\n\n" +
      "Click 'Start Playing' to begin your adventure in the Namespace Forest!",
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const step = tutorialSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setShowTutorial(false);
    // Save tutorial completion to localStorage
    localStorage.setItem("cluster-guardians-tutorial-completed", "true");
    onComplete();
  };

  const handleSkip = () => {
    setShowTutorial(false);
    onSkip();
  };

  if (!showTutorial) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card variant="bordered" className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-k8s-blue-light">
                {step.title}
              </CardTitle>
              <div className="text-sm text-gray-400 mt-1">
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleSkip}>
              Skip Tutorial
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-gray-300 font-sans text-sm leading-relaxed">
                {step.content}
              </pre>
            </div>

            {/* Progress bar */}
            <div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-k8s-blue h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="secondary"
                onClick={handlePrevious}
                disabled={isFirst}
              >
                Previous
              </Button>

              <div className="flex space-x-2">
                {step.action && (
                  <Badge variant="info" className="px-3 py-1">
                    💡 Tip: {step.action.type}
                  </Badge>
                )}
              </div>

              <Button onClick={handleNext} variant="primary">
                {isLast ? "Start Playing" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

