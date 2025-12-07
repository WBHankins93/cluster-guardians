import express, { Express, Request, Response } from "express";
import cors from "cors";
import { ClusterSimulator } from "./simulator/clusterSimulator";
import { KubectlParser } from "./simulator/kubectlParser";

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize cluster simulator
const clusterSimulator = new ClusterSimulator();
const kubectlParser = new KubectlParser(clusterSimulator);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

// Get cluster state
app.get("/api/cluster/state", (req: Request, res: Response) => {
  const state = clusterSimulator.getState();
  res.json(state);
});

// Reset cluster to initial state (for testing)
app.post("/api/cluster/reset", (req: Request, res: Response) => {
  clusterSimulator.reset();
  res.json({
    message: "Cluster reset to initial state",
    state: clusterSimulator.getState(),
  });
});

// Execute kubectl command
app.post("/api/kubectl", (req: Request, res: Response) => {
  const { command } = req.body;

  if (!command || typeof command !== "string") {
    return res.status(400).json({
      error: "Command is required and must be a string",
    });
  }

  try {
    const result = kubectlParser.execute(command);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      exitCode: 1,
    });
  }
});

// Apply YAML configuration
app.post("/api/kubectl/apply", (req: Request, res: Response) => {
  const { yaml } = req.body;

  if (!yaml || typeof yaml !== "string") {
    return res.status(400).json({
      error: "YAML content is required",
    });
  }

  try {
    const result = clusterSimulator.applyYAML(yaml);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to apply YAML",
      exitCode: 1,
    });
  }
});

// Load scenario (for quest initialization)
app.post("/api/scenario/load", (req: Request, res: Response) => {
  const { scenarioId } = req.body;

  if (!scenarioId) {
    return res.status(400).json({
      error: "Scenario ID is required",
    });
  }

  try {
    clusterSimulator.loadScenario(scenarioId);
    res.json({
      message: `Scenario "${scenarioId}" loaded successfully`,
      state: clusterSimulator.getState(),
    });
  } catch (error) {
    res.status(404).json({
      error: error instanceof Error ? error.message : "Scenario not found",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🎮 Cluster Guardians Backend running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/cluster/state`);
  console.log(`   - POST /api/cluster/reset`);
  console.log(`   - POST /api/kubectl`);
  console.log(`   - POST /api/kubectl/apply`);
  console.log(`   - POST /api/scenario/load`);
});

export default app;
