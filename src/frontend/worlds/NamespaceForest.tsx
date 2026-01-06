"use client";

import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, HelpIcon, TerminalCard } from "@/components/ui";
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
        setCommandOutput(`[SUCCESS] Quest Complete! +${activeQuest.rewards.xp} XP`);

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
    <div className="min-h-screen bg-terminal-bg p-4 relative scanlines">
      {/* Background pattern */}
      <div className="fixed inset-0 circuit-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 hex-bg opacity-10 pointer-events-none" />

      {/* Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto space-y-4 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-terminal-green animate-pulse shadow-glow-green" />
              <h1 className="text-3xl font-bold text-terminal-green font-mono tracking-wide">
                SECTOR_01: NAMESPACE_FOREST
              </h1>
            </div>
            <p className="text-terminal-cyan/70 mt-1 font-mono text-sm ml-6">
              &gt; Master namespace isolation, pod lifecycle, and service discovery protocols
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(true)}
              title="Open Help Panel"
            >
              [?] HELP
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              title="Open Settings"
            >
              [*] CONFIG
            </Button>
            {easyMode && (
              <Badge variant="success" size="sm">
                EASY_MODE
              </Badge>
            )}
            <Badge variant="info">
              LVL_{player.level}
            </Badge>
            <div className="text-sm text-terminal-cyan font-mono">
              XP: {player.xp}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Column: NPCs and Interactions */}
          <div className="lg:col-span-2 space-y-4">
            {/* NPCs */}
            <TerminalCard title="cluster_entities.sh">
              <div className="flex items-center space-x-2 mb-4">
                <CardTitle className="text-lg">CLUSTER ENTITIES</CardTitle>
                <HelpIcon content="Interact with cluster entities to receive missions and gather intel about system anomalies." />
              </div>
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
            </TerminalCard>

            {/* Command Interface */}
            <TerminalCard title="kubectl_interface.sh">
              <div className="flex items-center space-x-2 mb-4">
                <CardTitle className="text-lg">COMMAND INTERFACE</CardTitle>
                <HelpIcon content="Execute kubectl commands to interact with the cluster. Use quick actions or type custom commands." />
              </div>
              <div className="space-y-3">
                {/* Quick action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => executeCommand("kubectl get pods -n forest")}
                    disabled={isLoading}
                    title="kubectl get pods -n forest"
                  >
                    GET_PODS
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => executeCommand("kubectl get services -n forest")}
                    disabled={isLoading}
                    title="kubectl get services -n forest"
                  >
                    GET_SERVICES
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => executeCommand("kubectl get namespaces")}
                    disabled={isLoading}
                    title="kubectl get namespaces"
                  >
                    GET_NAMESPACES
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowYAMLEditor(!showYAMLEditor)}
                  >
                    {showYAMLEditor ? "CLOSE_EDITOR" : "YAML_EDITOR"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowYAMLBuilder(!showYAMLBuilder)}
                    title="Visual YAML builder - no coding required!"
                  >
                    {showYAMLBuilder ? "CLOSE_BUILDER" : "YAML_BUILDER"}
                  </Button>
                </div>

                {/* Enhanced Command Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-terminal-gray font-mono">
                      &gt; Enter kubectl command (autocomplete enabled):
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
                      setShowYAMLBuilder(false);
                      setShowYAMLEditor(true);
                      setCommandOutput(`[INFO] YAML generated. Review and apply in editor.\n\n${yaml}`);
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

                {/* Command Output */}
                {commandOutput && (
                  <div className="space-y-2">
                    <div className="bg-terminal-black p-3 rounded border border-terminal-green/20 font-mono text-sm text-terminal-green/90 whitespace-pre-wrap max-h-48 overflow-y-auto terminal-scrollbar">
                      <span className="text-terminal-gray">&gt; </span>
                      {commandOutput}
                    </div>

                    {/* Friendly error display */}
                    {errorDetails?.friendly && (
                      <Card variant="bordered" className="border-terminal-red/30 bg-terminal-red/5">
                        <CardHeader>
                          <CardTitle className="text-lg text-terminal-red">
                            [ERROR] {errorDetails.friendly.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-terminal-white/80">
                              {errorDetails.friendly.message}
                            </p>

                            {errorDetails.friendly.suggestions.length > 0 && (
                              <div>
                                <div className="text-xs font-semibold text-terminal-amber mb-2 font-mono">
                                  SUGGESTED_ACTIONS:
                                </div>
                                <ul className="list-none space-y-1 text-sm text-terminal-white/70">
                                  {errorDetails.friendly.suggestions.map((suggestion, index) => (
                                    <li key={index} className="font-mono">
                                      <span className="text-terminal-cyan">&gt;</span> {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {errorDetails.friendly.exampleCommand && (
                              <div>
                                <div className="text-xs font-semibold text-terminal-amber mb-1 font-mono">
                                  EXAMPLE_COMMAND:
                                </div>
                                <div className="bg-terminal-black p-2 rounded font-mono text-xs text-terminal-cyan border border-terminal-cyan/30">
                                  {errorDetails.friendly.exampleCommand}
                                </div>
                              </div>
                            )}

                            {errorDetails.friendly.exampleYaml && (
                              <div>
                                <div className="text-xs font-semibold text-terminal-amber mb-1 font-mono">
                                  EXAMPLE_YAML:
                                </div>
                                <pre className="bg-terminal-black p-2 rounded font-mono text-xs text-terminal-white/70 border border-terminal-green/20 overflow-x-auto">
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
            </TerminalCard>

            {/* Cluster State Viewer */}
            <div>
              <div className="mb-2 flex items-center space-x-2">
                <HelpIcon content="Click on any resource to run 'kubectl describe' and view detailed information." />
                <span className="text-xs text-terminal-gray font-mono">Click resources to inspect</span>
              </div>
              <ClusterStateViewer
                clusterState={clusterState}
                onResourceClick={(type, name, namespace) => {
                  executeCommand(`kubectl describe ${type} ${name} -n ${namespace}`);
                }}
              />
            </div>
          </div>

          {/* Right Column: Quest Tracker and Rifts */}
          <div className="space-y-4">
            <QuestTracker quest={activeQuest} />

            {/* Quest Hints */}
            {activeQuest && (
              <TerminalCard title="quest_hints.log">
                <CardTitle className="text-lg mb-3">MISSION INTEL</CardTitle>
                <div className="space-y-3">
                  {activeQuest.objectives.map((objective) => (
                    <div key={objective.id}>
                      <div className="text-sm font-mono text-terminal-white/80 mb-1">
                        {objective.isCompleted ? (
                          <span className="line-through text-terminal-gray">
                            <span className="text-terminal-green">[DONE]</span> {objective.description}
                          </span>
                        ) : (
                          <span>
                            <span className="text-terminal-amber">[PEND]</span> {objective.description}
                          </span>
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
              </TerminalCard>
            )}

            {/* Terminal Rifts */}
            {availableRifts.some((r) => r.isUnlocked) && (
              <TerminalCard title="terminal_rifts.exe">
                <CardTitle className="text-lg mb-3">TERMINAL RIFTS</CardTitle>
                <div className="space-y-2">
                  {availableRifts.map((rift) => (
                    <button
                      key={rift.id}
                      onClick={() => rift.isUnlocked && setActiveRift(rift)}
                      disabled={!rift.isUnlocked}
                      className={`w-full text-left p-3 rounded border transition-all font-mono ${
                        rift.isUnlocked
                          ? "border-terminal-cyan/30 hover:border-terminal-cyan hover:bg-terminal-cyan/10 cursor-pointer"
                          : "border-terminal-border opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-terminal-white">
                            {rift.name}
                          </div>
                          <div className="text-xs text-terminal-gray mt-1">
                            {rift.description}
                          </div>
                        </div>
                        {rift.isCompleted && (
                          <Badge variant="success" size="sm">
                            CLEAR
                          </Badge>
                        )}
                        {!rift.isUnlocked && (
                          <Badge variant="warning" size="sm">
                            LOCKED
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </TerminalCard>
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
