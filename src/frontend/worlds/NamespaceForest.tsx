"use client";

import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, HelpIcon } from "@/components/ui";
import { Dialog } from "@/components/dialog";
import { ClusterStateViewer, QuestTracker } from "@/components/game";
import { NPCCard } from "@/components/npc";
import { TerminalRift } from "@/components/terminal";
import { OnboardingTutorial } from "@/components/tutorial";
import { HelpPanel } from "@/components/help";
import { YAMLEditor, YAMLBuilder } from "@/components/yaml";
import { QuestHints } from "@/components/quest";
import { CommandInput, CommandHistory } from "@/components/command";
import { SettingsPanel } from "@/components/settings";
import { getSettings } from "@/lib/settings";
import { DialogNode, NPC, Quest, TerminalRift as TerminalRiftType } from "@/shared/types/game";
import {
  namespaceForestWorld,
  kubeSageDialogTree,
  lostPodDialog,
  treantPodDialog,
  serviceGuardianDialog,
} from "@/shared/data/world1Data";
import { getAvailableRifts } from "@/shared/data/terminalRiftChallenges";
import { formatError } from "@/lib/errorTranslator";

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
  const [showYAMLEditor, setShowYAMLEditor] = useState(false);
  const [showYAMLBuilder, setShowYAMLBuilder] = useState(false);
  const [commandOutput, setCommandOutput] = useState("");
  const [errorDetails, setErrorDetails] = useState<ReturnType<typeof formatError> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableRifts, setAvailableRifts] = useState<TerminalRiftType[]>([]);
  const [activeRift, setActiveRift] = useState<TerminalRiftType | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [easyMode, setEasyMode] = useState(false);

  // Update available rifts when quests complete
  useEffect(() => {
    const rifts = getAvailableRifts(player.completedQuests);
    setAvailableRifts(rifts);
  }, [player.completedQuests]);

  // Check if tutorial should be shown and load settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const settings = getSettings();
    setEasyMode(settings.easyMode);
    
    const tutorialCompleted = localStorage.getItem("cluster-guardians-tutorial-completed");
    if (!tutorialCompleted && settings.showTutorials) {
      setShowTutorial(true);
    }
  }, [showSettings]);

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
    // Add to history
    setCommandHistory((prev) => {
      const newHistory = [...prev, command];
      // Keep only last 50 commands
      return newHistory.slice(-50);
    });

    setIsLoading(true);
    setErrorDetails(null);
    try {
      const result = await api.executeKubectl(command);
      
      if (result.exitCode !== 0) {
        // Translate error to friendly message
        const formatted = formatError(result.output);
        setErrorDetails(formatted);
        setCommandOutput(result.output);
      } else {
        setCommandOutput(result.output);
        setErrorDetails(null);
      }

      // Check if command advances quest objectives
      if (activeQuest) {
        checkQuestProgress(command, result);
      }

      await loadClusterState();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const formatted = formatError(errorMessage);
      setErrorDetails(formatted);
      setCommandOutput(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply YAML
  const applyYAML = async (yaml: string) => {
    if (!yaml.trim()) {
      setCommandOutput("Error: No YAML provided");
      return;
    }

    setIsLoading(true);
    setErrorDetails(null);
    try {
      const result = await api.applyYAML(yaml);
      setCommandOutput(result.message);
      setShowYAMLEditor(false);
      setErrorDetails(null);

      // Check if this completes any quest objectives
      await loadClusterState();

      if (activeQuest) {
        setTimeout(() => checkQuestCompletion(), 1000);
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      const formatted = formatError(errorMessage);
      setErrorDetails(formatted);
      setCommandOutput(`Error: ${errorMessage}`);
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
    <div className="min-h-screen bg-gradient-to-b from-fantasy-stone-dark via-purple-900/30 to-fantasy-stone-dark p-4 relative">
      {/* Medieval background pattern overlay */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-4xl font-bold text-fantasy-gold font-fantasy drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(212,175,55,0.5)' }}>
              🌲 Namespace Forest
            </h1>
            <p className="text-fantasy-parchment mt-2 text-lg">World 1 - Master the ancient arts of namespaces, pods, and YAML runes</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowHelp(true)}
              title="Open Help Panel"
            >
              📖 Help
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(true)}
              title="Open Settings"
            >
              ⚙️ Settings
            </Button>
            {easyMode && (
              <Badge variant="success" size="sm">
                Easy Mode
              </Badge>
            )}
            <Badge variant="info">
              Level {player.level}
            </Badge>
            <div className="text-sm text-fantasy-parchment">
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
                <div className="flex items-center space-x-2">
                  <CardTitle>Characters</CardTitle>
                  <HelpIcon content="Click on NPCs to talk to them. They'll give you quests and helpful information about problems in the cluster." />
                </div>
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
                <div className="flex items-center space-x-2">
                  <CardTitle>kubectl Interface</CardTitle>
                  <HelpIcon content="Use kubectl commands to interact with your cluster. Click buttons for quick commands or type custom commands with autocomplete." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => executeCommand("kubectl get pods -n forest")}
                      disabled={isLoading}
                      title="Runs: kubectl get pods -n forest"
                    >
                      Get Pods
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => executeCommand("kubectl get services -n forest")}
                      disabled={isLoading}
                      title="Runs: kubectl get services -n forest"
                    >
                      Get Services
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => executeCommand("kubectl get namespaces")}
                      disabled={isLoading}
                      title="Runs: kubectl get namespaces"
                    >
                      Get Namespaces
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowYAMLEditor(!showYAMLEditor)}
                    >
                      {showYAMLEditor ? "Hide Editor" : "Edit YAML"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowYAMLBuilder(!showYAMLBuilder)}
                      title="Visual YAML builder - no coding required!"
                    >
                      {showYAMLBuilder ? "Hide Builder" : "Build YAML"}
                    </Button>
                  </div>
                  
                  {/* Enhanced Command Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        Type a kubectl command (with autocomplete):
                      </div>
                      <CommandHistory
                        history={commandHistory}
                        onSelectCommand={executeCommand}
                      />
                    </div>
                    <CommandInput
                      onExecute={executeCommand}
                      isLoading={isLoading}
                      placeholder="kubectl get pods -n forest"
                    />
                  </div>

                  {showYAMLBuilder && (
                    <YAMLBuilder
                      onGenerate={(yaml) => {
                        // Switch to editor with generated YAML
                        setShowYAMLBuilder(false);
                        setShowYAMLEditor(true);
                        // The YAMLEditor will load templates, so we'll pass it via a different method
                        // For now, just show a message
                        setCommandOutput(`YAML generated! Switch to "Edit YAML" to review and apply it.\n\n${yaml}`);
                      }}
                      onCancel={() => setShowYAMLBuilder(false)}
                    />
                  )}

                  {showYAMLEditor && (
                    <YAMLEditor
                      questId={activeQuest?.id}
                      onApply={applyYAML}
                      onCancel={() => setShowYAMLEditor(false)}
                      isLoading={isLoading}
                    />
                  )}

                  {commandOutput && (
                    <div className="space-y-2">
                      <div className="bg-gray-800 p-3 rounded font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto terminal-scrollbar">
                        {commandOutput}
                      </div>
                      
                      {/* Friendly error display */}
                      {errorDetails?.friendly && (
                        <Card variant="bordered" className="bg-red-500/10 border-red-500/30">
                          <CardHeader>
                            <CardTitle className="text-lg text-red-300">
                              ⚠️ {errorDetails.friendly.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <p className="text-sm text-gray-200">
                                {errorDetails.friendly.message}
                              </p>
                              
                              {errorDetails.friendly.suggestions.length > 0 && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-400 mb-2">
                                    Suggestions:
                                  </div>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                                    {errorDetails.friendly.suggestions.map((suggestion, index) => (
                                      <li key={index}>{suggestion}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {errorDetails.friendly.exampleCommand && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-400 mb-1">
                                    Example Command:
                                  </div>
                                  <div className="bg-gray-900 p-2 rounded font-mono text-xs text-k8s-blue-light border border-gray-700">
                                    {errorDetails.friendly.exampleCommand}
                                  </div>
                                </div>
                              )}

                              {errorDetails.friendly.exampleYaml && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-400 mb-1">
                                    Example YAML:
                                  </div>
                                  <pre className="bg-gray-900 p-2 rounded font-mono text-xs text-gray-300 border border-gray-700 overflow-x-auto">
                                    {errorDetails.friendly.exampleYaml}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cluster State Viewer */}
            <div>
              <div className="mb-2 flex items-center space-x-2">
                <HelpIcon content="Click on any resource (pod, service, etc.) to automatically run 'kubectl describe' on it." />
              </div>
              <ClusterStateViewer
                clusterState={clusterState}
                onResourceClick={(type, name, namespace) => {
                  executeCommand(`kubectl describe ${type} ${name} -n ${namespace}`);
                }}
              />
            </div>
          </div>

          {/* Right Column: Quest Tracker */}
          <div className="space-y-4">
            <QuestTracker quest={activeQuest} />
            
            {/* Quest Hints */}
            {activeQuest && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Quest Hints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeQuest.objectives.map((objective) => (
                      <div key={objective.id}>
                        <div className="text-sm font-semibold text-gray-300 mb-1">
                          {objective.isCompleted ? (
                            <span className="line-through text-gray-500">
                              {objective.description}
                            </span>
                          ) : (
                            objective.description
                          )}
                        </div>
                        {!objective.isCompleted && (
                          <QuestHints
                            objective={objective}
                            onShowHint={() => {}}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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

        {/* Onboarding Tutorial */}
        {showTutorial && (
          <OnboardingTutorial
            onComplete={() => setShowTutorial(false)}
            onSkip={() => setShowTutorial(false)}
          />
        )}

        {/* Help Panel */}
        <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => {
            setShowSettings(false);
            // Refresh easy mode state
            setEasyMode(getSettings().easyMode);
          }}
        />
      </div>
    </div>
  );
}
