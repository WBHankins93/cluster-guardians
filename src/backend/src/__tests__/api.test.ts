import request from "supertest";
import express from "express";
import cors from "cors";
import { ClusterSimulator } from "../simulator/clusterSimulator";
import { KubectlParser } from "../simulator/kubectlParser";

// Create test app (similar to app.ts but without starting the server)
function createTestApp() {
  const app = express();
  const clusterSimulator = new ClusterSimulator();
  const kubectlParser = new KubectlParser(clusterSimulator);

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/cluster/state", (req, res) => {
    res.json(clusterSimulator.getState());
  });

  app.post("/api/cluster/reset", (req, res) => {
    clusterSimulator.reset();
    res.json({
      message: "Cluster reset to initial state",
      state: clusterSimulator.getState(),
    });
  });

  app.post("/api/kubectl", (req, res) => {
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

  app.post("/api/kubectl/apply", (req, res) => {
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

  app.post("/api/scenario/load", (req, res) => {
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

  return app;
}

describe("API Endpoints", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
  });

  describe("GET /api/health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
      expect(response.body.version).toBe("0.1.0");
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe("GET /api/cluster/state", () => {
    it("should return initial cluster state", async () => {
      const response = await request(app).get("/api/cluster/state");

      expect(response.status).toBe(200);
      expect(response.body.namespaces).toHaveLength(2);
      expect(response.body.pods).toHaveLength(0);
      expect(response.body.services).toHaveLength(0);
      expect(response.body.deployments).toHaveLength(0);
    });
  });

  describe("POST /api/cluster/reset", () => {
    it("should reset cluster state", async () => {
      // First, apply some changes
      await request(app)
        .post("/api/kubectl/apply")
        .send({
          yaml: `
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:latest
`,
        });

      // Verify pod was created
      let state = await request(app).get("/api/cluster/state");
      expect(state.body.pods).toHaveLength(1);

      // Reset
      const response = await request(app).post("/api/cluster/reset");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Cluster reset to initial state");
      expect(response.body.state.pods).toHaveLength(0);
    });
  });

  describe("POST /api/kubectl", () => {
    it("should execute get namespaces command", async () => {
      const response = await request(app)
        .post("/api/kubectl")
        .send({ command: "kubectl get namespaces" });

      expect(response.status).toBe(200);
      expect(response.body.exitCode).toBe(0);
      expect(response.body.output).toContain("default");
      expect(response.body.output).toContain("forest");
    });

    it("should return error for missing command", async () => {
      const response = await request(app).post("/api/kubectl").send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Command is required");
    });

    it("should return error for invalid command", async () => {
      const response = await request(app)
        .post("/api/kubectl")
        .send({ command: "invalid-command" });

      expect(response.status).toBe(200);
      expect(response.body.exitCode).toBe(1);
    });
  });

  describe("POST /api/kubectl/apply", () => {
    it("should apply valid pod YAML", async () => {
      const response = await request(app)
        .post("/api/kubectl/apply")
        .send({
          yaml: `
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:latest
`,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("pod/test-pod created");
      expect(response.body.resource.status.phase).toBe("Running");
    });

    it("should return error for missing YAML", async () => {
      const response = await request(app).post("/api/kubectl/apply").send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("YAML content is required");
    });

    it("should return error for invalid YAML", async () => {
      const response = await request(app)
        .post("/api/kubectl/apply")
        .send({ yaml: "not: valid: yaml:" });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Failed to parse YAML");
    });
  });

  describe("POST /api/scenario/load", () => {
    it("should load world1-quest1 scenario", async () => {
      const response = await request(app)
        .post("/api/scenario/load")
        .send({ scenarioId: "world1-quest1" });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("world1-quest1");
      expect(response.body.state.pods).toHaveLength(1);
      expect(response.body.state.pods[0].metadata.name).toBe("lost-pod");
    });

    it("should load world1-quest2 scenario", async () => {
      const response = await request(app)
        .post("/api/scenario/load")
        .send({ scenarioId: "world1-quest2" });

      expect(response.status).toBe(200);
      expect(response.body.state.pods[0].status.phase).toBe("CrashLoopBackOff");
    });

    it("should load world1-quest3 scenario", async () => {
      const response = await request(app)
        .post("/api/scenario/load")
        .send({ scenarioId: "world1-quest3" });

      expect(response.status).toBe(200);
      expect(response.body.state.services).toHaveLength(1);
    });

    it("should return error for missing scenario ID", async () => {
      const response = await request(app).post("/api/scenario/load").send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Scenario ID is required");
    });

    it("should return 404 for unknown scenario", async () => {
      const response = await request(app)
        .post("/api/scenario/load")
        .send({ scenarioId: "unknown-scenario" });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain("not found");
    });
  });

  describe("Integration Flow", () => {
    it("should complete quest 1 workflow", async () => {
      // Load quest 1 scenario
      await request(app)
        .post("/api/scenario/load")
        .send({ scenarioId: "world1-quest1" });

      // Check pod status
      let pods = await request(app)
        .post("/api/kubectl")
        .send({ command: "kubectl get pods -n wrong-namespace" });

      // Pod should not be in forest yet
      let forestPods = await request(app)
        .post("/api/kubectl")
        .send({ command: "kubectl get pods -n forest" });
      expect(forestPods.body.output).toBe("No resources found");

      // Fix: Create pod in correct namespace
      await request(app)
        .post("/api/kubectl/apply")
        .send({
          yaml: `
apiVersion: v1
kind: Pod
metadata:
  name: lost-pod
  namespace: forest
  labels:
    app: web
spec:
  containers:
    - name: nginx
      image: nginx:latest
`,
        });

      // Verify pod is now running in forest
      forestPods = await request(app)
        .post("/api/kubectl")
        .send({ command: "kubectl get pods -n forest" });
      expect(forestPods.body.exitCode).toBe(0);
      expect(forestPods.body.output).toContain("lost-pod");
      expect(forestPods.body.output).toContain("Running");
    });

    it("should complete quest 2 workflow", async () => {
      // Load quest 2 scenario
      await request(app)
        .post("/api/scenario/load")
        .send({ scenarioId: "world1-quest2" });

      // Check pod is crashing
      let logs = await request(app)
        .post("/api/kubectl")
        .send({ command: "kubectl logs treant-pod -n forest" });
      expect(logs.body.output).toContain("Error");

      // Fix: Create pod with valid command
      await request(app)
        .post("/api/kubectl/apply")
        .send({
          yaml: `
apiVersion: v1
kind: Pod
metadata:
  name: treant-pod
  namespace: forest
  labels:
    app: treant
spec:
  containers:
    - name: app
      image: busybox:latest
      command: ["sleep", "3600"]
`,
        });

      // Verify pod is now running
      let pods = await request(app)
        .post("/api/kubectl")
        .send({ command: "kubectl get pods -n forest" });
      expect(pods.body.output).toContain("Running");
    });
  });
});
