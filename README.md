# 🎮 Cluster Guardians

A Kubernetes educational RPG game that combines story-driven adventure with hands-on terminal challenges.

## 🌟 Features

- **🎯 Story-Driven Learning**: Explore worlds representing Kubernetes concepts, solve puzzles, and defeat corruption bosses
- **🔧 Hands-On Terminal Challenges**: Practice real kubectl commands against a simulated cluster
- **🧱 Lightweight Simulation**: No cloud costs, no cluster required - learn at your own pace offline
- **🎮 Scalable Design**: Easy to add new worlds, expansions, and DLC (Terraform, Helm, GitOps)

## 🗺️ Game Worlds

### MVP (v0.1.0)
- **World 1: The Namespace Forest** - Learn namespaces, pods, and basic YAML

### Planned Worlds
- **World 2: The Deployment Hills** - Replicas, labels/selectors, rollout strategies
- **World 3: The Service Docks** - ClusterIP, NodePort, LoadBalancer
- **World 4: The Ingress Canyon** - Ingress controllers, routing paths
- **World 5: The Storage Caverns** - PVCs, PVs, storage classes
- **World 6: The Secrets Auditorium** - Secrets, ConfigMaps, environment variables
- **World 7: The RBAC Citadel** - Roles, service accounts, permissions

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **React 19** for UI components
- **TailwindCSS** for styling
- **xterm.js** for terminal challenges
- **Zustand** for state management

### Backend
- **Node.js** with TypeScript
- **Express** for API routes
- **Custom Kubernetes Simulator** for cluster state management
- **kubectl Parser** for command execution
- **js-yaml** for YAML processing

## 📂 Project Structure

```
cluster-guardians/
├── src/
│   ├── frontend/
│   │   ├── app/              # Next.js app router
│   │   ├── components/       # React components
│   │   │   ├── ui/          # Base UI components
│   │   │   ├── game/        # Game-specific components
│   │   │   ├── npc/         # NPC components
│   │   │   └── dialog/      # Dialog system
│   │   ├── worlds/          # World-specific components
│   │   ├── terminal/        # Terminal rift components
│   │   └── lib/             # Utilities and helpers
│   ├── backend/
│   │   └── src/
│   │       ├── simulator/   # K8s cluster simulation
│   │       ├── routes/      # API routes
│   │       └── app.ts       # Express server
│   └── shared/
│       ├── types/           # Shared TypeScript types
│       ├── models/          # Data models
│       └── constants/       # Shared constants
└── public/
    └── assets/              # Game assets (images, sounds)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cluster-guardians
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd src/frontend && npm install
   cd ../backend && npm install
   cd ../..
   ```

   Or use the convenience script:
   ```bash
   npm run install:all
   ```

3. **Run the development servers**

   Run both frontend and backend concurrently:
   ```bash
   npm run dev
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Frontend
   npm run dev:frontend

   # Terminal 2 - Backend
   npm run dev:backend
   ```

4. **Open the game**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🎮 How to Play

1. **Start your journey** in the Namespace Forest
2. **Talk to NPCs** (Pods, Deployments, Services) to learn about cluster issues
3. **Solve puzzles** by fixing YAML configurations and debugging problems
4. **Defeat bosses** representing common Kubernetes failures (CrashLoopBackOff, etc.)
5. **Enter Terminal Rifts** for bonus challenges using real kubectl commands
6. **Earn XP and titles** as you master Kubernetes concepts

## 🔧 API Endpoints

### Cluster Management
- `GET /api/health` - Health check
- `GET /api/cluster/state` - Get current cluster state
- `POST /api/cluster/reset` - Reset cluster to initial state

### kubectl Simulation
- `POST /api/kubectl` - Execute kubectl command
  ```json
  { "command": "kubectl get pods -n forest" }
  ```
- `POST /api/kubectl/apply` - Apply YAML configuration
  ```json
  { "yaml": "apiVersion: v1\nkind: Pod\n..." }
  ```

### Scenarios
- `POST /api/scenario/load` - Load a quest scenario
  ```json
  { "scenarioId": "world1-quest1" }
  ```

## 🧪 Available Scenarios (MVP)

- `world1-quest1` - Pod in wrong namespace (Pending status)
- `world1-quest2` - CrashLoopBackOff due to invalid command
- `world1-quest3` - Service can't find pod (label mismatch)

## 🛠️ Development

### Building for Production

```bash
npm run build
```

### Running Production Build

```bash
npm run start
```

### Linting

```bash
npm run lint
```

## 🎨 Game Design

### Character Types
- **Pod Spirits** - Childlike creatures representing pods
- **Deployment Knights** - Armored beings made of pod spirits
- **Service Conductors** - NPCs that route traffic
- **Config Twins** - ConfigMap and Secret siblings
- **Storage Golems** - Ancient PV beings

### Boss Encounters
- **CrashLoop Treant** - Tree that falls and regrows incorrectly
- **Selector Beast** - Chimera of mismatched labels
- **Endpoint Kraken** - Multi-tentacled service endpoint monster

## 📖 Learning Objectives

By completing the game, players will learn:
- Kubernetes architecture and core concepts
- Pod lifecycle and debugging
- Deployments and scaling
- Service discovery and networking
- Ingress and routing
- Storage management
- Secrets and configuration
- RBAC and security
- Real kubectl command usage

## 🗺️ Roadmap

### v0.1.0 (Current - MVP)
- ✅ Project foundation
- ✅ Backend simulator
- ✅ kubectl parser
- ✅ Frontend scaffolding
- 🚧 World 1: Namespace Forest
- 🚧 Basic quest system
- 🚧 Terminal rift integration

### v0.2.0
- World 2: Deployment Hills
- Deployment scaling challenges
- Enhanced UI/UX

### v0.3.0
- World 3: Service Docks
- Service networking puzzles
- Improved terminal experience

### Future DLC
- **Terraform DLC** - Infrastructure provisioning world
- **Helm DLC** - Chart templating sky temple
- **GitOps DLC** - Argo CD integration

## 🤝 Contributing

This is an educational project designed to help people learn Kubernetes. Contributions are welcome!

## 📄 License

MIT

## 🎓 Educational Use

This game is designed for:
- Kubernetes beginners starting their learning journey
- Developers wanting hands-on practice
- Educators teaching container orchestration
- Anyone wanting to learn through interactive gameplay

---

**Built with ❤️ for the Kubernetes community**
