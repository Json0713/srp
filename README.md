# Project Parasite (`srp`)

**Project Parasite** is a browser-based, offline, single-player, top-down 2.5D survival roguelite game inspired by *Scape and Run: Parasites* and *Magic Survival*.

Built with **Angular 22**, **TypeScript 6**, and **Phaser 4**, the architecture strictly separates the reactive tactical UI shell (Angular) from the real-time game simulation and rendering loop (Phaser).

---

## Outbreak Phase Registry (Game Seasons)

| Phase | Code | Title | Subtitle | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | `PHS-01` | **Phase 1: The Fallout** | *Initial Containment Collapse & Biomass Extraction* | **ACTIVE** |
| **Phase 2** | `PHS-02` | **Phase 2: The Assimilation** | *Parasite Swarm Escalation & Survival Powers* | **UPCOMING** |
| **Phase 3** | `PHS-03` | **Phase 3: The Synthesis** | *Research Lab Evolution & The Hive Core* | **UPCOMING** |

---

## Architecture & Directory Structure

```text
src/
├── index.html                  # Native web-app viewport & dark theme shell
├── styles.css                  # Global dark-biopunk design tokens & responsive layout system
└── app/
    ├── app.ts                  # Root application shell
    ├── app.routes.ts           # Standalone route configuration
    ├── core/                   # Shared domain contracts & singleton state services
    │   ├── models/
    │   │   └── game-data.model.ts
    │   └── services/
    │       ├── codex.service.ts
    │       ├── menu-state.service.ts
    │       └── settings.service.ts
    ├── shared/                 # Reusable tactical UI components (Signal inputs/outputs)
    │   └── ui/
    │       ├── button.ts
    │       ├── page-header.ts
    │       └── selection-card.ts
    ├── screens/                # Out-of-game command deck screens (Portrait & Landscape responsive)
    │   ├── home/               # Outbreak Command Hub (Deploy)
    │   ├── operators/          # Containment Roster & Operator Dossiers
    │   ├── zones/              # Infestation Sector Selection & Drop Manifest
    │   ├── codex/              # Interactive Field Codex & Game Encyclopedia
    │   ├── research/           # Research Lab (Bio-Research Upgrades & Rig Cosmetics)
    │   └── settings/           # Hardware Input & Control Configuration
    └── game/                   # Real-time Phaser 4 simulation & Angular HUD overlay
        ├── game.ts             # Phaser lifecycle host, HUD telemetry, Codex grants & Pause overlay
        ├── scenes/
        │   └── main.scene.ts   # Active 2.5D survival arena & multi-touch virtual joystick
        └── systems/            # Deterministic gameplay rules
            ├── input.system.ts
            ├── interaction.system.ts
            └── movement.system.ts
```

---

## Development Workflow & Scripts

### Start Development Server
```bash
npm start
```
Navigates to `http://localhost:4200/` with live reload enabled.

### Production Build
```bash
npm run build
```
Compiles and optimizes bundles to `dist/SRP`.

---

## Documentation & Governance

- [`AGENTS.md`](./AGENTS.md) — Core engineering principles, Angular 22 / TypeScript / Phaser 4 standards, and mandatory workflows.
- [`.agents/context/CODEX.md`](./.agents/context/CODEX.md) — Canonical Game Encyclopedia & Codex Registry (Items, Parasites, Powers, Operators, Sectors).
- [`.agents/context/GAME_DESIGN.md`](./.agents/context/GAME_DESIGN.md) — Game design pillars, visual direction, and scope boundaries.
- [`.agents/context/TECHNICAL_DESIGN.md`](./.agents/context/TECHNICAL_DESIGN.md) — Technical baseline and subsystem boundaries.
- [`.agents/context/ROADMAP.md`](./.agents/context/ROADMAP.md) — Phased milestone plan.
- [`.agents/context/CURRENT_STATUS.md`](./.agents/context/CURRENT_STATUS.md) — Verified implementation status and next milestone target.
