# Project Parasite — Game Phase & Development Roadmap

## 1. Official Game Phase Registry (Seasons & Outbreak Chapters)

Project Parasite organizes both player-facing seasons and development milestones around three canonical **Outbreak Phases**, inspired by *Scape and Run: Parasites* evolution tiers and *Magic Survival* progression:

| Phase | Code | Official Title | Subtitle | Status | Core Gameplay & Content |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | `PHS-01` | **Phase 1: The Fallout** | *Initial Containment Collapse & Biomass Extraction* | **ACTIVE** | Sector 7 perimeter deployment, Biomass Spire extraction (`Raw Biomass Spore`), Tactical Command Deck, Field Codex (`/codex`), Research Lab preview (`/research`), cross-device PC/Mobile 360° controls, camera-follow chunk streaming, and operator sprite pipeline. |
| **Phase 2** | `PHS-02` | **Phase 2: The Assimilation** | *Parasite Swarm Escalation & Survival Powers* | **UPCOMING** | Active parasite wave spawning (`Rupter`, `Assimilated Human`, `Volatile Spore Carrier`, `Adapted Longarms` boss), auto-targeting weapons, XP orb collection, randomized level-up survival skills, and `Bio-Containment Cache` drops. |
| **Phase 3** | `PHS-03` | **Phase 3: The Synthesis** | *Research Lab Evolution & The Hive Core* | **UPCOMING** | Persistent `SRP Bio-Credits`, live Research Lab synthesis (`Bio-Research` meta-upgrades & `Rig Cosmetics`), `Operator: Ranger` requisition, and deep-core deployment into **The Hive**. |

---

## 2. Roadmap Principles

- Build a playable foundation before adding large gameplay systems.
- Complete and verify one milestone at a time.
- Treat future milestones as plans, not current implementation instructions.
- Reassess priorities when testing reveals architectural or gameplay problems.
- Do not mark a milestone complete without evidence.
- Every milestone must have explicit acceptance criteria, including focused ephemeral tests (`npm test -- --watch=false`, deleted immediately after passing) and browser verification steps.

---

## 3. Phase 1: The Fallout *(Active Season)*

**Goal:** Establish the playable Sector 7 fallout perimeter, tactical biopunk UI shell, Field Codex, Research Lab blueprint terminal, cross-device controls, camera streaming, and sprite pipeline.

### Milestone 1A — Command Deck, Field Codex & Research Lab (Completed)
- **Objective:** Establish the out-of-game Tactical Command Deck (`Home`, `Operators`, `Zones`, `Codex`, `Research`, `Settings`) and Angular 22 + Phaser 4 integration.
- **Scope:** Responsive Portrait & Landscape layouts, `CodexService` encyclopedia, and `Research` (`Bio-Research` & `Rig Cosmetics` tracks).

### Milestone 1B — Cross-Device PC & Mobile Input Architecture & Biomass Extraction (Completed)
- **Objective:** Unified input adapter for keyboard (`WASD`/Arrows + `E`) and mobile touch (360° analog virtual joystick + multi-touch Harvest button) inside the 2.5D Sector 7 arena.
- **Scope:** `InputSystem`, `MovementSystem`, `InteractionSystem`, `MainScene`, live Biomass Spire harvesting, and automatic `raw-biomass` Field Codex grant.

### Milestone 1C — Camera-Follow & Chunked World Generation (Completed)
- **Objective:** Allow infinite or large-scale Sector 7 exploration without losing performance.
- **Scope:** Implemented `camera.startFollow(player)` with smooth damping, per-run true-RNG seed generation (`generateRunSeed`), 512px chunk streaming (`ChunkManager`), Minecraft-style chunk state preservation in memory, randomized Biomass Spire placement, and a directional Spore Compass indicator.

### Milestone 1D — Sprite & Animation Pipeline (Next Target)
- **Objective:** Replace procedural operator/node graphics with an extensible sprite sheet architecture.
- **Scope:** Load a basic sprite sheet and implement directional idle/run animations for the operator.
- **Dependencies:** Milestone 1C.
- **Verification:** Player sprite changes facing direction and animates while moving.

---

## 4. Phase 2: The Assimilation *(Upcoming Season)*

**Goal:** Introduce the *Scape and Run: Parasites* wave escalation and *Magic Survival*-inspired combat and skill-evolution loops.

### Milestone 2A — Basic Combat & Parasite Behavior
- **Objective:** Spawn pursuing parasites (`Rupter`, `Assimilated Human`) and implement health, contact damage, and `Pulse Carbine Overclock` auto-attack.
- **Scope:** Enemy spawning, pathing to player, collision damage, basic projectile auto-attack, `Hardened Chitin Shard` drops, and object pooling for enemies/projectiles.
- **Dependencies:** Milestone 1D.
- **Verification:** Enemies spawn over time, follow the player, damage the player on touch, and die when hit by projectiles.

### Milestone 2B — XP Orbs, Wave Escalation & Level-Up Survival Powers
- **Objective:** Add the core roguelite skill-evolution loop and Tier II hazards (`Volatile Spore Carrier`).
- **Scope:** Enemies drop XP orbs. Collecting orbs fills an XP bar. Leveling up pauses the game and presents 3 deterministic skill choices (`Bio-Repulsor Field`, `Sentinel Micro-Drones`, `Thermal Incineration Wave`).
- **Dependencies:** Milestone 2A.
- **Verification:** XP scales properly. Level-up modal halts the game loop and selecting a skill resumes it.

### Milestone 2C — Currency Drops, Loot Chests & Apex Bosses
- **Objective:** Introduce apex encounters (`Adapted Longarms`) and meta-currency (`SRP Bio-Credit`).
- **Scope:** Configurable SRP Coin drops and boss enemies dropping `Bio-Containment Caches` with rarity tiers.
- **Dependencies:** Milestone 2B.
- **Verification:** Chests grant session buffs or coins based on verified probability tables.

---

## 5. Phase 3: The Synthesis *(Upcoming Season)*

**Goal:** Activate persistent meta-progression, Research Lab synthesis, Operator unlocks, and **The Hive** sector expansion.

### Milestone 3A — Persistent Currency & Operator Requisition
- **Objective:** Persist `SRP Bio-Credits` and allow unlocking `Operator: Ranger`.
- **Scope:** Local storage persistence for coins and operator unlock state.
- **Dependencies:** Milestone 2C.
- **Verification:** Coins persist across browser reloads. Unlocked operators remain playable.

### Milestone 3B — Bio-Research Synthesis & Settings Persistence
- **Objective:** Activate purchasing/ranking up the 4 `Bio-Research` nodes (`Chitin Exo-Plating`, `Magnetic Spore Extractor`, `Adrenaline Stims Mk.II`, `Neural Targeting Link`) in `/research`.
- **Dependencies:** Milestone 3A.

### Milestone 3C — Rig Cosmetics, The Hive Sector & Polish
- **Objective:** Activate `Rig Cosmetics` (`Aegis Hazmat Mk.IV`, `Assimilated Carapace Rig`, `Bioluminescent Spore Wake`), unlock **The Hive** (`ZN-09`), and add audio/visual polish.
- **Dependencies:** Milestone 3B.
