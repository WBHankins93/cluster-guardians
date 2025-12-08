"use client";

import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Dialog } from "@/components/dialog";
import { ClusterStateViewer, QuestTracker } from "@/components/game";
import { NPCCard } from "@/components/npc";
import { TerminalRift } from "@/components/terminal";
import { DialogNode, NPC, Quest, TerminalRift as TerminalRiftType } from "@/shared/types/game";
import {
  namespaceForestWorld,
  kubeSageDialogTree,
  lostPodDialog,
  treantPodDialog,
  serviceGuardianDialog,
} from "@/shared/data/world1Data";
import { getAvailableRifts } from "@/shared/data/terminalRiftChallenges";

export default function NamespaceForest() {
  const {
    player,
    clusterState,
    setClusterState,
    activeQuest,
    setActiveQuest,
    currentDialog,
    setCurrentDialog,
    gainXP,
    updateQuestObjective,
    completeQuest,
    worlds,
  } = useGameStore();

  const [npcs] = useState(namespaceForestWorld.npcs);
  const [quests] = useState(namespaceForestWorld.quests);
  const [activeNPC, setActiveNPC] = useState<NPC | null>(null);
  const [yamlEditor, setYAMLEditor] = useState("");
  const [showYAMLEditor, setShowYAMLEditor] = useState(false);
  const [commandOutput, setCommandOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableRifts, setAvailableRifts] = useState<TerminalRiftType[]>([]);
  const [activeRift, setActiveRift] = useState<TerminalRiftType | null>(null);

  // Update available rifts when quests complete
  useEffect(() => {
    const rifts = getAvailableRifts(player.completedQuests);
    setAvailableRifts(rifts);
  }, [player.completedQuests]);

  // Load cluster state on mount
  useEffect(() => {
    loadClusterState();
  }, []);

  const loadClusterState = async () => {
    try {
      const state = await api.getClusterState();
      setClusterState(state);
    } catch (error) {
      console.error("Failed to load cluster state:", error);
    }
  };

  const loadScenario = async (scenarioId: string) => {
    try {
      const response = await api.loadScenario(scenarioId);
      setClusterState(response.state);
    } catch (error) {
      console.error("Failed to load scenario:", error);
    }
  };

  // Handle NPC interaction
  const handleNPCClick = (npc: NPC) => {
    setActiveNPC(npc);
    setCurrentDialog(npc.dialogTree);
  };

  // Handle dialog choices
  const handleDialogChoice = useCallback(
    (nextNodeId: string) => {
      if (!activeNPC) return;

      // Get dialog trees based on NPC
      let dialogTree: Record<string, DialogNode> = {};
      switch (activeNPC.id) {
        case "kube-sage":
          dialogTree = kubeSageDialogTree;
          break;
        case "lost-pod":
          dialogTree = lostPodDialog;
          break;
        case "treant-pod":
          dialogTree = treantPodDialog;
          break;
        case "service-guardian":
          dialogTree = serviceGuardianDialog;
          break;
      }

      const nextDialog = dialogTree[nextNodeId];
      if (nextDialog) {
        // Handle actions
        if (nextDialog.action) {
          handleDialogAction(nextDialog.action);
        }

        setCurrentDialog(nextDialog);
      } else {
        // End of dialog
        setCurrentDialog(undefined);
        setActiveNPC(null);
      }
    },
    [activeNPC]
  );

  const handleDialogAction = (action: any) => {
    switch (action.type) {
      case "start-quest":
        const questId = action.payload.questId;
        const quest = quests.find((q) => q.id === questId);
        if (quest) {
          setActiveQuest({ ...quest, isActive: true });

          // Load appropriate scenario
          if (questId === "quest1") {
            loadScenario("world1-quest1");
          } else if (questId === "quest2") {
            loadScenario("world1-quest2");
          } else if (questId === "quest3") {
            loadScenario("world1-quest3");
          }
        }
        break;
    }
  };

  // Execute kubectl command
  const executeCommand = async (command: string) => {
    setIsLoading(true);
    try {
      const result = await api.executeKubectl(command);
      setCommandOutput(result.output);

      // Check if command advances quest objectives
      if (activeQuest) {
        checkQuestProgress(command, result);
      }

      await loadClusterState();
    } catch (error) {
      setCommandOutput(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply YAML
  const applyYAML = async () => {
    if (!yamlEditor.trim()) {
      setCommandOutput("Error: No YAML provided");
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.applyYAML(yamlEditor);
      setCommandOutput(result.message);
      setShowYAMLEditor(false);
      setYAMLEditor("");

      // Check if this completes any quest objectives
      await loadClusterState();

      if (activeQuest) {
        setTimeout(() => checkQuestCompletion(), 1000);
      }
    } catch (error: any) {
      setCommandOutput(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Check quest progress based on commands
  const checkQuestProgress = (command: string, result: any) => {
    if (!activeQuest) return;

    // Quest 1: Check namespace examination
    if (activeQuest.id === "quest1") {
      if (command.includes("get") && command.includes("pod")) {
        updateQuestObjective("quest1", "obj1-2", true);
      }
    }

    // Quest 2: Check logs examination
    if (activeQuest.id === "quest2") {
      if (command.includes("logs")) {
        updateQuestObjective("quest2", "obj2-2", true);
      }
    }

    // Quest 3: Check describe commands
    if (activeQuest.id === "quest3") {
      if (command.includes("describe service")) {
        updateQuestObjective("quest3", "obj3-2", true);
      }
      if (command.includes("describe pod")) {
        updateQuestObjective("quest3", "obj3-3", true);
      }
    }
  };

  // Check if quest is complete
  const checkQuestCompletion = () => {
    if (!activeQuest || !clusterState) return;

    let isComplete = false;

    // Quest 1: Pod should be in forest namespace and Running
    if (activeQuest.id === "quest1") {
      const pod = clusterState.pods.find((p) => p.metadata.name === "lost-pod");
      if (pod && pod.metadata.namespace === "forest" && pod.status?.phase === "Running") {
        isComplete = true;
        updateQuestObjective("quest1", "obj1-3", true);
        updateQuestObjective("quest1", "obj1-4", true);
      }
    }

    // Quest 2: Treant pod should be Running
    if (activeQuest.id === "quest2") {
      const pod = clusterState.pods.find((p) => p.metadata.name === "treant-pod");
      if (pod && pod.status?.phase === "Running") {
        isComplete = true;
        updateQuestObjective("quest2", "obj2-3", true);
        updateQuestObjective("quest2", "obj2-4", true);
      }
    }

    // Quest 3: Service should have matching labels
    if (activeQuest.id === "quest3") {
      const service = clusterState.services.find((s) => s.metadata.name === "web-service");
      const pod = clusterState.pods.find((p) => p.metadata.name === "web-pod");

      if (service && pod) {
        const podLabels = pod.metadata.labels || {};
        const serviceSelector = service.spec.selector || {};

        // Check if labels match
        const labelsMatch = Object.keys(serviceSelector).every(
          (key) => podLabels[key] === serviceSelector[key]
        );

        if (labelsMatch && pod.status?.phase === "Running") {
          isComplete = true;
          updateQuestObjective("quest3", "obj3-4", true);
        }
      }
    }

    if (isComplete) {
      setTimeout(() => {
        completeQuest(activeQuest.id);
        setCommandOutput(`🎉 Quest Complete! +${activeQuest.rewards.xp} XP`);

        // Show completion dialog
        if (activeQuest.id === "quest1") {
          handleNPCClick(npcs.find((n) => n.id === "kube-sage")!);
          handleDialogChoice("quest1-complete");
        } else if (activeQuest.id === "quest2") {
          handleNPCClick(npcs.find((n) => n.id === "kube-sage")!);
          handleDialogChoice("quest2-complete");
        } else if (activeQuest.id === "quest3") {
          handleNPCClick(npcs.find((n) => n.id === "kube-sage")!);
          handleDialogChoice("quest3-complete");
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-900/20 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-k8s-blue-light">🌲 Namespace Forest</h1>
            <p className="text-gray-400">World 1 - Learn namespaces, pods, and basic YAML</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="info">
              Level {player.level}
            </Badge>
            <div className="text-sm text-gray-400">
              XP: {player.xp}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Column: NPCs and Interactions */}
          <div className="lg:col-span-2 space-y-4">
            {/* NPCs */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Characters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {npcs.map((npc) => (
                    <NPCCard
                      key={npc.id}
                      npc={npc}
                      onInteract={() => handleNPCClick(npc)}
                      hasQuestIndicator={
                        npc.id === "kube-sage" && !activeQuest
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Command Interface */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>kubectl Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => executeCommand("kubectl get pods -n forest")}
                      disabled={isLoading}
                    >
                      Get Pods
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => executeCommand("kubectl get services -n forest")}
                      disabled={isLoading}
                    >
                      Get Services
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowYAMLEditor(!showYAMLEditor)}
                    >
                      Apply YAML
                    </Button>
                  </div>

                  {showYAMLEditor && (
                    <div className="space-y-2">
                      <textarea
                        value={yamlEditor}
                        onChange={(e) => setYAMLEditor(e.target.value)}
                        placeholder="Paste your YAML here..."
                        className="w-full h-48 p-3 bg-gray-800 text-gray-100 font-mono text-sm rounded border border-gray-700 focus:border-k8s-blue focus:outline-none"
                      />
                      <div className="flex space-x-2">
                        <Button onClick={applyYAML} disabled={isLoading}>
                          Apply
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setShowYAMLEditor(false);
                            setYAMLEditor("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {commandOutput && (
                    <div className="bg-gray-800 p-3 rounded font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto terminal-scrollbar">
                      {commandOutput}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cluster State Viewer */}
            <ClusterStateViewer
              clusterState={clusterState}
              onResourceClick={(type, name, namespace) => {
                executeCommand(`kubectl describe ${type} ${name} -n ${namespace}`);
              }}
            />
          </div>

          {/* Right Column: Quest Tracker */}
          <div className="space-y-4">
            <QuestTracker quest={activeQuest} />

            {/* Terminal Rifts */}
            {availableRifts.some((r) => r.isUnlocked) && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="text-lg">⚡ Terminal Rifts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availableRifts.map((rift) => (
                      <button
                        key={rift.id}
                        onClick={() => rift.isUnlocked && setActiveRift(rift)}
                        disabled={!rift.isUnlocked}
                        className={`w-full text-left p-3 rounded border transition-all ${
                          rift.isUnlocked
                            ? "border-k8s-blue hover:bg-k8s-blue/10 cursor-pointer"
                            : "border-gray-700 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-gray-100">
                              {rift.name}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {rift.description}
                            </div>
                          </div>
                          {rift.isCompleted && (
                            <Badge variant="success" size="sm">
                              ✓
                            </Badge>
                          )}
                          {!rift.isUnlocked && (
                            <Badge variant="warning" size="sm">
                              🔒
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dialog Overlay */}
        {currentDialog && (
          <Dialog
            dialog={currentDialog}
            onChoice={handleDialogChoice}
            onClose={() => {
              setCurrentDialog(undefined);
              setActiveNPC(null);
            }}
            npcName={activeNPC?.name}
          />
        )}

        {/* Terminal Rift Overlay */}
        {activeRift && (
          <TerminalRift
            challenge={activeRift.challenge}
            onComplete={(score, timeElapsed) => {
              gainXP(score);
              setAvailableRifts(
                availableRifts.map((r) =>
                  r.id === activeRift.id ? { ...r, isCompleted: true } : r
                )
              );
              setActiveRift(null);
            }}
            onExit={() => setActiveRift(null)}
          />
        )}
      </div>
    </div>
  );
}
