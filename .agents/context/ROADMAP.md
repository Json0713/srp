# Project Parasite — Development Roadmap

## Roadmap Principles
- Build a playable foundation before adding large gameplay systems.
- Complete and verify one milestone at a time.
- Treat future milestones as plans, not current implementation instructions.
- Reassess priorities when testing reveals architectural or gameplay problems.
- Do not mark a milestone complete without evidence.
- Every milestone must have explicit acceptance criteria, including automated tests and browser verification steps.

## Phase 1 — Project Foundation & Engine Integration (Completed)
- Angular 22 and Phaser 4 integration.
- Game screen rendering and resizing.
- Basic player movement and world boundaries.
- Simple procedural test environment.
- Single-interaction resource gathering.

## Phase 2 — Core Engine Foundations
**Goal:** Establish cross-platform controls, camera, world streaming, and asset pipelines before layering heavy combat logic.

### Milestone 2A — Home Screen & Filename Convention
**Status:** Awaiting final manual verification.
**Objective:** Migrate to concise filenames and implement the out-of-game Home screen UI.
**Scope:** `Home` UI, Angular routing, placeholder displays. Excludes gameplay or persistence.
**Tests:** Unit tests for navigation and UI state.
**Verification:** Manual check of route transitions and missing duplicate instances on re-entry.

### Milestone 2B — PC & Mobile Input Architecture
**Objective:** Design a unified input adapter for both keyboard and touch controls.
**Scope:** Implement a small custom virtual joystick for mobile and an interaction button. Support a toggle between PC and Mobile modes. Excludes third-party plugins.
**Dependencies:** None.
**Files affected:** `interaction.system.ts`, `movement.system.ts`, `main.scene.ts`, settings UI.
**Verification:** Keyboard works on desktop. Touch works on mobile viewport simulation. Toggle switches modes cleanly.

### Milestone 2C — Camera-Follow & Chunked World Generation
**Objective:** Allow infinite or large-scale exploration without losing performance.
**Scope:** Implement `camera.startFollow(player)`. Generate terrain in deterministic chunks based on world coordinates. Clean up distant chunks. Excludes full biomes.
**Dependencies:** Milestone 2B.
**Verification:** Player remains centered. Terrain loads seamlessly and unloads when far away to preserve memory. 

### Milestone 2D — Sprite & Animation Pipeline
**Objective:** Replace placeholder rectangles with an extensible sprite sheet architecture.
**Scope:** Load a basic sprite sheet, implement directional idle/run animations for the player. Excludes advanced combat animations.
**Dependencies:** Milestone 2C.
**Verification:** Player sprite changes facing direction and animates while moving.

## Phase 3 — Survival Roguelite Gameplay
**Goal:** Introduce the Magic Survival-inspired combat and meta-progression loops.

### Milestone 3A — Basic Combat & Enemy Behavior
**Objective:** Spawn pursuing parasites and implement health/damage.
**Scope:** Enemy spawning, pathing to player, collision damage, basic projectile auto-attack. Introduces object pooling for enemies/projectiles.
**Dependencies:** Milestone 2D.
**Verification:** Enemies spawn over time, follow the player, damage the player on touch, and die when hit by projectiles.

### Milestone 3B — XP, Orbs, and Level-Up Skills
**Objective:** Add the core roguelite progression loop.
**Scope:** Enemies drop XP orbs. Collecting orbs fills an XP bar. Leveling up pauses the game and presents 3 randomized (deterministic) skill choices.
**Dependencies:** Milestone 3A.
**Verification:** XP scales properly. Level up modal halts the game loop and selecting a skill resumes it.

### Milestone 3C — Currency Drops, Loot Chests, and Bosses
**Objective:** Introduce elite encounters and meta-currency.
**Scope:** Configurable SRP Coin drops. Boss enemies dropping loot chests with rarity tiers.
**Dependencies:** Milestone 3B.
**Verification:** Chests grant session buffs or coins based on verified probability tables.

## Phase 4 — Persistence & Meta-Progression

### Milestone 4A — Persistent Currency and Character Unlocking
**Objective:** Save SRP Coins and allow unlocking characters in the Home screen.
**Scope:** Use `localStorage` or IndexedDB wrapper to persist coins. Wire Home screen UI to unlock "Ranger" class.
**Dependencies:** Milestone 3C.
**Verification:** Coins persist across browser reloads. Unlocked characters remain playable.

### Milestone 4B — Shop and Settings Persistence
**Objective:** Complete out-of-game progression and configuration.
**Scope:** Persist PC/Mobile mode settings and basic shop upgrades.
**Dependencies:** Milestone 4A.

### Milestone 4C — Content Expansion & Polish
**Objective:** Balance the game and add final visual/audio assets.
**Scope:** Sound effects, music, balancing spawn rates, accessibility checks, and profiling.
