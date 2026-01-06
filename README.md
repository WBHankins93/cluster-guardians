# Cluster Guardians

A Kubernetes educational RPG game that combines story-driven adventure with hands-on terminal challenges. Features a sleek terminal/hacker aesthetic with Matrix-inspired visuals.

## Features

- **Story-Driven Learning**: Navigate through cluster sectors, encounter rogue pods, and restore system integrity through narrative missions
- **Terminal Operations**: Execute real kubectl commands in a simulated environment with zero risk
- **Sandbox Environment**: No cloud costs, no cluster required - train anywhere with our lightweight simulation engine
- **Scalable Design**: Easy to add new worlds, expansions, and DLC (Terraform, Helm, GitOps)

## Screenshots

The game features a cyberpunk terminal aesthetic with:
- Matrix-style green-on-black color scheme
- Animated cluster nodes and network visualizations
- Scanline and glitch effects
- Terminal-style UI components with glow effects

## Game Worlds

### MVP (v0.1.0) - Complete
- **Sector 01: Namespace Forest** - Master namespace isolation, pod lifecycle, and service discovery protocols

### Planned Sectors
- **Sector 02: Deployment Hills** - Replicas, labels/selectors, rollout strategies
- **Sector 03: Service Docks** - ClusterIP, NodePort, LoadBalancer
- **Sector 04: Ingress Canyon** - Ingress controllers, routing paths
- **Sector 05: Storage Caverns** - PVCs, PVs, storage classes
- **Sector 06: Secrets Auditorium** - Secrets, ConfigMaps, environment variables
- **Sector 07: RBAC Citadel** - Roles, service accounts, permissions

## Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **React 19** for UI components
- **TailwindCSS** with custom terminal theme
- **xterm.js** for terminal emulation (Matrix green theme)
- **Zustand** for state management

### Backend
- **Node.js** with TypeScript
- **Express** for API routes
- **Jest** for testing (61 tests)
- **Custom Kubernetes Simulator** for cluster state management
- **kubectl Parser** for command execution
- **js-yaml** for YAML processing

## Project Structure

```
cluster-guardians/
├── src/
│   ├── frontend/
│   │   ├── app/                 # Next.js app router
│   │   │   ├── page.tsx        # Landing page (Matrix rain, cluster nodes)
│   │   │   ├── game/           # Game page
│   │   │   └── globals.css     # Terminal theme CSS
│   │   ├── components/
│   │   │   ├── ui/             # Base UI (Button, Card, Badge, TerminalCard)
│   │   │   ├── game/           # ClusterStateViewer, QuestTracker
│   │   │   ├── npc/            # NPCCard, NPCAvatar (cyber icons)
│   │   │   ├── dialog/         # Dialog system with typewriter effect
│   │   │   ├── terminal/       # Terminal, TerminalRift
│   │   │   ├── yaml/           # YAMLEditor, YAMLBuilder
│   │   │   ├── command/        # CommandInput, CommandHistory
│   │   │   ├── quest/          # QuestHints
│   │   │   ├── help/           # HelpPanel
│   │   │   ├── tutorial/       # OnboardingTutorial
│   │   │   └── settings/       # SettingsPanel
│   │   ├── worlds/             # NamespaceForest and future worlds
│   │   ├── lib/                # API client, store, utilities
│   │   └── public/images/      # SVG assets (cluster-node, pod-icon)
│   ├── backend/
│   │   ├── src/
│   │   │   ├── simulator/
│   │   │   │   ├── clusterSimulator.ts  # K8s cluster simulation
│   │   │   │   └── kubectlParser.ts     # kubectl command parser
│   │   │   ├── __tests__/               # Jest test suites
│   │   │   │   ├── clusterSimulator.test.ts
│   │   │   │   ├── kubectlParser.test.ts
│   │   │   │   └── api.test.ts
│   │   │   └── app.ts                   # Express server
│   │   └── jest.config.js               # Jest configuration
│   └── shared/
│       ├── types/              # Kubernetes and game types
│       ├── constants/          # Game constants
│       └── data/               # World data, dialog trees, quest hints
└── package.json                # Workspace configuration
```

## Getting Started

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
   ```

3. **Run the development servers**
   ```bash
   npm run dev
   ```

4. **Open the game**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Testing

The project includes a comprehensive test suite with 61 tests covering the backend simulation and API.

### Run Tests
```bash
# Run all tests
cd src/backend && npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
| Module | Tests | Description |
|--------|-------|-------------|
| ClusterSimulator | 22 | State management, scenarios, YAML parsing |
| KubectlParser | 23 | Command parsing, get/describe/logs/delete |
| API Integration | 16 | All endpoints, quest workflows |

## How to Play

1. **Enter the Cluster** from the landing page
2. **Interact with Cluster Entities** (represented as cyber-themed NPCs) to receive missions
3. **Execute kubectl commands** to investigate and fix cluster issues
4. **Use the YAML Editor** or visual YAML Builder to apply configurations
5. **Complete Terminal Rifts** for timed challenges
6. **Earn XP** as you master Kubernetes concepts

## API Endpoints

### Cluster Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/cluster/state` | GET | Get current cluster state |
| `/api/cluster/reset` | POST | Reset cluster to initial state |

### kubectl Simulation
| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/api/kubectl` | POST | `{ "command": "kubectl get pods -n forest" }` | Execute kubectl command |
| `/api/kubectl/apply` | POST | `{ "yaml": "..." }` | Apply YAML configuration |

### Scenarios
| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/api/scenario/load` | POST | `{ "scenarioId": "world1-quest1" }` | Load quest scenario |

## Available Scenarios

| Scenario ID | Description | Challenge |
|-------------|-------------|-----------|
| `world1-quest1` | Lost Pod | Pod in wrong namespace (Pending) |
| `world1-quest2` | Treant Pod | CrashLoopBackOff due to invalid command |
| `world1-quest3` | Service Mismatch | Service can't find pod (label mismatch) |

## Development

### Building for Production
```bash
# Build frontend
cd src/frontend && npm run build

# Build backend
cd src/backend && npm run build
```

### Running Production Build
```bash
npm run start
```

### Linting
```bash
npm run lint
```

## UI Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Terminal Green | `#00ff41` | Primary text, success states |
| Terminal Cyan | `#00d4ff` | Secondary accent, info |
| Terminal Purple | `#a855f7` | Deployments, special elements |
| Terminal Amber | `#f59e0b` | Warnings, pending states |
| Terminal Red | `#ff3333` | Errors, danger states |
| Background | `#0a0e14` | Main background |
| Panel | `#141b22` | Card/panel backgrounds |

### Fonts
- **JetBrains Mono** - Primary monospace font
- **Orbitron** - Display headings
- **VT323** - Terminal accent text

### Effects
- Scanline overlay (CRT effect)
- Glitch text animations
- Pulse glow on interactive elements
- Matrix rain background
- Circuit/hex grid patterns

## Cluster Entity Types

| Type | Icon | Color | Represents |
|------|------|-------|------------|
| Sage | Diamond | Cyan | System Admin/Guide |
| Pod | Hexagon | Green | Pod containers |
| Deployment | Grid | Purple | Deployments |
| Service | Target | Blue | Service endpoints |
| ConfigMap | Lines | Gray | Configuration |
| Secret | Diamond Filled | Red | Secrets |

## Learning Objectives

By completing the game, players will learn:
- Kubernetes architecture and core concepts
- Pod lifecycle and debugging (CrashLoopBackOff, ImagePullBackOff)
- Namespace isolation
- Service discovery and label selectors
- YAML configuration syntax
- Real kubectl command usage

## Roadmap

### v0.1.0 (Current - MVP) - COMPLETE
- [x] Project foundation with monorepo structure
- [x] Backend K8s simulator with 3 scenarios
- [x] kubectl parser (get, describe, logs, delete, apply)
- [x] Terminal/hacker UI theme
- [x] World 1: Namespace Forest (4 quests)
- [x] Terminal Rift challenges
- [x] Quest system with hints
- [x] Onboarding tutorial
- [x] Settings panel (Easy Mode)
- [x] Comprehensive test suite (61 tests)

### v0.2.0
- [ ] Sector 02: Deployment Hills
- [ ] Deployment scaling challenges
- [ ] Replica management puzzles

### v0.3.0
- [ ] Sector 03: Service Docks
- [ ] Service networking puzzles
- [ ] LoadBalancer simulations

### Future DLC
- **Terraform DLC** - Infrastructure provisioning world
- **Helm DLC** - Chart templating challenges
- **GitOps DLC** - Argo CD integration

## Contributing

This is an educational project designed to help people learn Kubernetes. Contributions are welcome!

## License

MIT

## Educational Use

This game is designed for:
- Kubernetes beginners starting their learning journey
- Developers wanting hands-on practice without cluster costs
- Educators teaching container orchestration
- Anyone wanting to learn through interactive gameplay

---

**Built for the Kubernetes community**
