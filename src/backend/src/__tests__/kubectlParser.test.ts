import { ClusterSimulator } from "../simulator/clusterSimulator";
import { KubectlParser } from "../simulator/kubectlParser";

describe("KubectlParser", () => {
  let simulator: ClusterSimulator;
  let parser: KubectlParser;

  beforeEach(() => {
    simulator = new ClusterSimulator();
    parser = new KubectlParser(simulator);
  });

  describe("Command Parsing", () => {
    it("should handle kubectl prefix", () => {
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

      const result1 = parser.execute("kubectl get pods -n default");
      const result2 = parser.execute("get pods -n default");

      expect(result1.output).toBe(result2.output);
    });

    it("should return error for unknown command", () => {
      const result = parser.execute("kubectl unknown-action");
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('unknown command "unknown-action"');
    });
  });

  describe("get command", () => {
    beforeEach(() => {
      simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  namespace: forest
  labels:
    app: web
spec:
  containers:
    - name: nginx
      image: nginx:latest
`);

      simulator.applyYAML(`
apiVersion: v1
kind: Service
metadata:
  name: nginx-svc
  namespace: forest
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
`);
    });

    it("should list pods in namespace", () => {
      const result = parser.execute("kubectl get pods -n forest");
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("nginx-pod");
      expect(result.output).toContain("Running");
    });

    it("should list services in namespace", () => {
      const result = parser.execute("kubectl get services -n forest");
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("nginx-svc");
      expect(result.output).toContain("ClusterIP");
    });

    it("should list namespaces", () => {
      const result = parser.execute("kubectl get namespaces");
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("default");
      expect(result.output).toContain("forest");
    });

    it("should get specific pod", () => {
      const result = parser.execute("kubectl get pod nginx-pod -n forest");
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("nginx-pod");
    });

    it("should return error for non-existent resource", () => {
      const result = parser.execute("kubectl get pod nonexistent -n forest");
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("not found");
    });

    it("should return 'No resources found' for empty namespace", () => {
      const result = parser.execute("kubectl get pods -n default");
      expect(result.exitCode).toBe(0);
      expect(result.output).toBe("No resources found");
    });

    it("should return error for unsupported resource type", () => {
      const result = parser.execute("kubectl get unsupportedtype");
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("doesn't have a resource type");
    });

    it("should support short resource names", () => {
      const podResult = parser.execute("kubectl get po -n forest");
      expect(podResult.exitCode).toBe(0);
      expect(podResult.output).toContain("nginx-pod");

      const svcResult = parser.execute("kubectl get svc -n forest");
      expect(svcResult.exitCode).toBe(0);
      expect(svcResult.output).toContain("nginx-svc");

      const nsResult = parser.execute("kubectl get ns");
      expect(nsResult.exitCode).toBe(0);
      expect(nsResult.output).toContain("forest");
    });
  });

  describe("describe command", () => {
    beforeEach(() => {
      simulator.loadScenario("world1-quest2");
    });

    it("should describe pod with details", () => {
      const result = parser.execute("kubectl describe pod treant-pod -n forest");
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Name:");
      expect(result.output).toContain("treant-pod");
      expect(result.output).toContain("Status:");
      expect(result.output).toContain("CrashLoopBackOff");
      expect(result.output).toContain("Containers:");
    });

    it("should return error for missing resource name", () => {
      const result = parser.execute("kubectl describe pod");
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("resource type and name required");
    });

    it("should return error for non-existent resource", () => {
      const result = parser.execute("kubectl describe pod nonexistent -n forest");
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("not found");
    });
  });

  describe("logs command", () => {
    it("should return logs for running pod", () => {
      simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: running-pod
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:latest
`);

      const result = parser.execute("kubectl logs running-pod -n default");
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Application started");
    });

    it("should return error logs for crashing pod", () => {
      simulator.loadScenario("world1-quest2");

      const result = parser.execute("kubectl logs treant-pod -n forest");
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Error");
    });

    it("should return error for missing pod name", () => {
      const result = parser.execute("kubectl logs");
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("pod name required");
    });

    it("should return error for non-existent pod", () => {
      const result = parser.execute("kubectl logs nonexistent -n default");
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("not found");
    });
  });

  describe("delete command", () => {
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
      const result = parser.execute("kubectl delete pod delete-me -n default");
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("deleted");

      // Verify deletion
      const getResult = parser.execute("kubectl get pod delete-me -n default");
      expect(getResult.exitCode).toBe(1);
    });

    it("should return error for non-existent pod", () => {
      const result = parser.execute("kubectl delete pod nonexistent -n default");
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("not found");
    });

    it("should return error for missing resource info", () => {
      const result = parser.execute("kubectl delete pod");
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("resource type and name required");
    });
  });

  describe("Namespace flag handling", () => {
    it("should use -n flag for namespace", () => {
      simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  namespace: forest
spec:
  containers:
    - name: nginx
      image: nginx:latest
`);

      const result = parser.execute("kubectl get pods -n forest");
      expect(result.output).toContain("test-pod");
    });

    it("should use --namespace flag for namespace", () => {
      simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  namespace: forest
spec:
  containers:
    - name: nginx
      image: nginx:latest
`);

      const result = parser.execute("kubectl get pods --namespace forest");
      expect(result.output).toContain("test-pod");
    });

    it("should default to 'default' namespace when not specified", () => {
      simulator.applyYAML(`
apiVersion: v1
kind: Pod
metadata:
  name: default-pod
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:latest
`);

      const result = parser.execute("kubectl get pods");
      expect(result.output).toContain("default-pod");
    });
  });
});
