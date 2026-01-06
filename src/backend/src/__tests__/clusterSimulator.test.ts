import { ClusterSimulator } from "../simulator/clusterSimulator";

describe("ClusterSimulator", () => {
  let simulator: ClusterSimulator;

  beforeEach(() => {
    simulator = new ClusterSimulator();
  });

  describe("Initial State", () => {
    it("should initialize with default and forest namespaces", () => {
      const state = simulator.getState();
      expect(state.namespaces).toHaveLength(2);
      expect(state.namespaces.map((ns) => ns.metadata.name)).toContain("default");
      expect(state.namespaces.map((ns) => ns.metadata.name)).toContain("forest");
    });

    it("should initialize with empty pods, services, and deployments", () => {
      const state = simulator.getState();
      expect(state.pods).toHaveLength(0);
      expect(state.services).toHaveLength(0);
      expect(state.deployments).toHaveLength(0);
    });
  });

  describe("reset()", () => {
    it("should reset cluster to initial state", () => {
      // Apply some changes
      simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:latest
`);

      expect(simulator.getState().pods).toHaveLength(1);

      // Reset
      simulator.reset();

      expect(simulator.getState().pods).toHaveLength(0);
    });
  });

  describe("loadScenario()", () => {
    it("should load world1-quest1 scenario with pending pod", () => {
      simulator.loadScenario("world1-quest1");
      const state = simulator.getState();

      expect(state.pods).toHaveLength(1);
      expect(state.pods[0].metadata.name).toBe("lost-pod");
      expect(state.pods[0].status?.phase).toBe("Pending");
    });

    it("should load world1-quest2 scenario with crashing pod", () => {
      simulator.loadScenario("world1-quest2");
      const state = simulator.getState();

      expect(state.pods).toHaveLength(1);
      expect(state.pods[0].metadata.name).toBe("treant-pod");
      expect(state.pods[0].status?.phase).toBe("CrashLoopBackOff");
    });

    it("should load world1-quest3 scenario with service mismatch", () => {
      simulator.loadScenario("world1-quest3");
      const state = simulator.getState();

      expect(state.pods).toHaveLength(1);
      expect(state.services).toHaveLength(1);
      expect(state.pods[0].metadata.labels?.app).toBe("webapp");
      expect(state.services[0].spec.selector?.app).toBe("web");
    });

    it("should throw error for unknown scenario", () => {
      expect(() => simulator.loadScenario("unknown-scenario")).toThrow(
        'Scenario "unknown-scenario" not found'
      );
    });
  });

  describe("applyYAML()", () => {
    it("should create a pod in existing namespace", () => {
      const result = simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:latest
`);

      expect(result.message).toBe("pod/nginx-pod created");
      expect(result.resource.status?.phase).toBe("Running");
    });

    it("should set pod to Pending when namespace does not exist", () => {
      const result = simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: lost-pod
  namespace: nonexistent
spec:
  containers:
    - name: nginx
      image: nginx:latest
`);

      expect(result.resource.status?.phase).toBe("Pending");
      expect(result.resource.status?.reason).toBe("NamespaceNotFound");
    });

    it("should detect CrashLoopBackOff for invalid commands", () => {
      const result = simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: crash-pod
  namespace: default
spec:
  containers:
    - name: app
      image: busybox
      command: ["invalid-command"]
`);

      expect(result.resource.status?.phase).toBe("CrashLoopBackOff");
    });

    it("should detect ImagePullBackOff for invalid images", () => {
      const result = simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: bad-image-pod
  namespace: default
spec:
  containers:
    - name: app
      image: invalid-image-notfound
`);

      expect(result.resource.status?.phase).toBe("ImagePullBackOff");
    });

    it("should create a service", () => {
      const result = simulator.applyYAML(`
apiVersion: v1
kind: Service
metadata:
  name: my-service
  namespace: default
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 8080
`);

      expect(result.message).toBe("service/my-service created");
    });

    it("should create a namespace", () => {
      const result = simulator.applyYAML(`
apiVersion: v1
kind: Namespace
metadata:
  name: production
`);

      expect(result.message).toBe("namespace/production created");
      expect(result.resource.status?.phase).toBe("Active");
    });

    it("should update existing pod", () => {
      // Create pod first
      simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: update-pod
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.19
`);

      // Update pod
      const result = simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: update-pod
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.20
`);

      expect(result.message).toBe("pod/update-pod configured");
      expect(simulator.getState().pods).toHaveLength(1);
    });

    it("should throw error for invalid YAML", () => {
      expect(() => simulator.applyYAML("not: valid: yaml:")).toThrow();
    });

    it("should throw error for unsupported resource kind", () => {
      expect(() =>
        simulator.applyYAML(`
apiVersion: v1
kind: UnsupportedKind
metadata:
  name: test
`)
      ).toThrow("Unsupported resource kind: UnsupportedKind");
    });
  });

  describe("getResource()", () => {
    beforeEach(() => {
      simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:latest
`);
    });

    it("should get pod by name", () => {
      const pod = simulator.getResource("pod", "test-pod", "default");
      expect(pod).not.toBeNull();
      expect(pod?.metadata.name).toBe("test-pod");
    });

    it("should return null for non-existent pod", () => {
      const pod = simulator.getResource("pod", "nonexistent", "default");
      expect(pod).toBeNull();
    });

    it("should get namespace without namespace parameter", () => {
      const ns = simulator.getResource("namespace", "default");
      expect(ns).not.toBeNull();
      expect(ns?.metadata.name).toBe("default");
    });

    it("should support short resource names (po, svc, ns)", () => {
      const pod = simulator.getResource("po", "test-pod", "default");
      expect(pod).not.toBeNull();

      const ns = simulator.getResource("ns", "default");
      expect(ns).not.toBeNull();
    });
  });

  describe("deleteResource()", () => {
    beforeEach(() => {
      simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: delete-me
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:latest
`);
    });

    it("should delete existing pod", () => {
      const result = simulator.deleteResource("pod", "delete-me", "default");
      expect(result).toBe(true);
      expect(simulator.getResource("pod", "delete-me", "default")).toBeNull();
    });

    it("should return false for non-existent pod", () => {
      const result = simulator.deleteResource("pod", "nonexistent", "default");
      expect(result).toBe(false);
    });
  });
});
