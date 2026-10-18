# Project Parasite — Current Development Status

## Project Setup

- Project directory: `C:\Lenovo-LOQ\System\Projects\gamedev\SRP`
- Angular project identifier: `srp`
- Active Game Phase / Season: **Phase 1: The Fallout** (`PHASE 1 // THE FALLOUT`)
- Root project instructions: `AGENTS.md`
- Project-specific instructions and knowledge: `.agents/`
- Game Encyclopedia & Codex Registry: `.agents/context/CODEX.md`

## Environment Verified

- Node.js: `v24.19.0`
- npm: `11.17.0`
- Angular CLI / Angular: `22.2.2`
- TypeScript: `6.0.3`
- Phaser: `4.2.1`
- Vitest: `4.1.11`

## Official Game Phase Registry

1. **Phase 1: The Fallout (`PHS-01` — Active Now):** Initial containment collapse at Sector 7, frontline Biomass Spire extraction, Tactical Command Deck, Field Codex (`/codex`), Research Lab preview (`/research`), cross-device PC/Mobile 360° controls, camera chunk streaming, and operator sprite pipeline.
2. **Phase 2: The Assimilation (`PHS-02` — Upcoming):** Parasitic swarm escalation (`Rupter`, `Assimilated Human`, `Volatile Spore Carrier`, `Adapted Longarms` boss), auto-targeting combat, XP orbs, and *Magic Survival*-style level-up skills.
3. **Phase 3: The Synthesis (`PHS-03` — Upcoming):** Persistent `SRP Bio-Credits`, live Research Lab synthesis (`Bio-Research` meta-upgrades & `Rig Cosmetics`), `Operator: Ranger` unlock, and **The Hive** sector expansion.

## Completed in Phase 1: The Fallout (Milestones 1A, 1B & 1C)

### 1. Clean Domain-Driven Project Structure
- Reorganized `src/app/` into explicit domain boundaries:
  - `src/app/core/` (`models/game-data.model.ts`, `services/codex.service.ts`, `services/menu-state.service.ts`, `services/settings.service.ts`)
  - `src/app/shared/ui/` (`button.ts`, `page-header.ts`, `selection-card.ts`)
  - `src/app/screens/` (`home/`, `operators/`, `zones/`, `codex/`, `research/`, `settings/`)
  - `src/app/game/` (`game.ts`, `game.html`, `game.css`, `scenes/main.scene.ts`, `systems/chunk.system.ts`, `systems/input.system.ts`, `systems/interaction.system.ts`, `systems/movement.system.ts`)
- Enforced the Focused Ephemeral Spec Policy: unit/integration tests are written specifically for newly implemented or modified features, verified via `npm test -- --watch=false`, and deleted immediately afterward so `src/app/` remains free of test file clutter.

### 2. Field Codex / Game Encyclopedia System (`CODEX.md` & `/codex`)
- Created the canonical developer and agent encyclopedia handbook at `.agents/context/CODEX.md`.
- Implemented `CodexService` (`src/app/core/services/codex.service.ts`) and the interactive `/codex` screen (`src/app/screens/codex/codex.ts`) with three visibility states (`discovered`, `undiscovered`, and `development`) and full Outbreak Phase dossiers (`Phase 1: The Fallout`, `Phase 2: The Assimilation`, `Phase 3: The Synthesis`).
- Connected `MainScene` -> `Game` -> `CodexService` so harvesting a Biomass Spire node (`E`) in-game automatically grants and unlocks `raw-biomass` (*Raw Biomass Spore*) in the Codex and displays a live `📘 CODEX GRANTED: Raw Biomass Spore` HUD notification.

### 3. Research Lab (`/research`) & Phase 1: The Fallout Command Deck
- Replaced the legacy "Black Market" placeholder with the **Research Lab** (`src/app/screens/research/research.ts`), featuring two synthesis tracks (**Bio-Research** meta-upgrades and **Rig Cosmetics** suit/trail overrides) and an interactive Blueprint Inspector.
- Aligned the Home Command Deck (`src/app/screens/home/home.html`) and all game services around **Phase 1: The Fallout**.

### 4. Smooth Camera-Follow & True-RNG Chunked World Generation (`Milestone 1C`)
- Implemented `ChunkManager` (`src/app/game/systems/chunk.system.ts`) and upgraded `MainScene` (`src/app/game/scenes/main.scene.ts`):
  - **Centered Smooth Camera (`cameras.main.startFollow`):** The operator remains centered while the camera smoothly tracks movement (`lerp = 0.14`) across unbounded world coordinates.
  - **True-RNG Per-Run Seed + Minecraft-Style Chunk State Preservation:** Every deployment generates a fresh 32-bit cryptographic seed (`generateRunSeed()`) so terrain and Biomass Spire positions are genuinely random every run. Chunks outside the active render window are unloaded from rendering, while their generated layout and harvested/unharvested Spire states remain preserved in memory (`discoveredChunks`) when the player returns.
  - **Spore Compass & Sector Telemetry:** Added a directional bio-radar indicator around the operator pointing toward the nearest uncollected Biomass Spire, and live sector chunk coordinates (`SEC +0:+0`) in a minimal see-through bottom-left watermark.

### 5. Unlimited Rare Biomass, EXP Orbs, RP Coins, Level-Up Skill Modal & IndexedDB `v1` Persistence (`Milestone 1D`)
- **Rare Biomass Spires & Triple Yield:** Removed the `0/176` denominator cap so Biomass is unlimited and rare (`18%` chunk spawn probability; `1` guaranteed in the origin chunk). Harvesting a Spire (`E`) grants **3 attributes**: `+1 Biomass`, `+100+ EXP` (scaled with player level and survival time), and `+10–25 RP Coins` (*Research Parasitic Coins*).
- **Research Lab & Command Deck Vaults:** Added live `🧪 Biomass` and `🪙 RP Coins` badges to the header-right of `/research` and the `/` Command Deck.
- **In-Game EXP Curve, 70/30 EXP Orbs & 80% RP Coins (`progression.system.ts`):**
  - EXP requirement starts at `100 EXP` for Level 1 → 2 and ramps smoothly (`100 + (level - 1) * 25 + (level - 1)^2 * 5`).
  - Chunks spawn **Common Blue EXP Orbs (`70%`)** granting `1–15` base EXP (`+2/lvl`) and **Rare Orange EXP Orbs (`30%`)** granting `15–25` base EXP (`+4/lvl`), plus **RP Coins** across `80%` of chunks.
  - **Automatic Proximity Magnet Pickup:** EXP Orbs and RP Coins automatically magnetize and accelerate toward the operator within close proximity (`78 px` base radius) and collect on contact without pressing `E`.
  - **Top EXP Progress Bar & 3-Skill Level-Up Modal:** Added a top-of-screen EXP progress bar (`LVL X`, fill bar, `currentExp / expToNextLevel`) and a Level-Up modal that pauses the simulation to present **3 randomly rolled survival skills** (pick 1 of 3).
- **Hardware Input Auto-Detection & Instant Dynamic Switching:** `SettingsService.detectHardwareInputMode()` automatically detects mobile/touch hardware vs. desktop keyboard on first boot, and `MainScene` listens to `input-mode-changed` + scene `resume` events so switching between Keyboard and Joystick takes effect immediately even while paused.
- **Versioned IndexedDB (`v1`) Storage Engine (`PersistenceService`):** Implemented `srp_project_parasite_db` (`version: 1`) with 4 object stores (`meta_profile`, `codex_records`, `user_settings`, `active_session`) and synchronous `localStorage` fallback so Biomass, RP Coins, Codex unlocks, settings, and active run checkpoints survive browser refreshes.

### 6. In-Run Extraction Economy, Active Run Autosave/Continue, Real-Time Tab Auto-Pause, Landscape Two-Section Pause Modal & `<app-info-popover>` (`!`) System
- **0-Start In-Run Loot & Abort/Finish Extraction Banking:** Fresh deployments always reset in-run `runBiomass` and `runRpCoins` to `0`. Collected Biomass and RP Coins are banked into the persistent Command Vault (`MenuStateService.completeOrAbortRun()`) only when the player clicks **Abort Mission** (or completes/dies in a run), displaying an extraction summary banner on the Home Command Deck.
- **Continuous Run Autosave & Continue Last Run:** Active runs automatically save seed, operator position, elapsed time, level/EXP, unbanked loot, chosen skills, and collected Spire/Orb/Coin IDs to IndexedDB (`active_session`). Players can resume via **Continue Run** on the Home screen or start fresh via **New Run**.
- **Real-Time Tab Switch & Blur Auto-Pause:** Switching browser tabs (`document:visibilitychange`) or minimizing/blurring the window (`window:blur`) automatically pauses `MainScene` and autosaves the active run.
- **Landscape-First Two-Section Pause Modal & In-Modal Subviews (`Operator Stats`, `Field Codex`, `Controls`):** Rebuilt the Pause Modal into a landscape two-section layout (`01 // Mission Control` + `02 // In-Game Systems Grid` with real-time `Operator Stats`, `Field Codex`, `Controls`, and Phase 2/3 preview tiles) that opens Codex and Settings directly inside the modal without kicking the player out of the active run.
- **Minimal UI Copy & Reusable `<app-info-popover>` (`!`):** Created `src/app/shared/ui/info-popover.ts` and streamlined text across Home, Operators, Zones, Codex, Research Lab, Settings, and Game modals so cards show concise metrics by default and disclose extended details when clicking `!`.

## Next Target
- **Milestone 1F (Phase 1: The Fallout) — Sprite & Animation Pipeline**, replacing procedural operator/node shapes with directional sprite animations.

## Update Policy
When updating this document:
- Record only implementation that exists.
- Distinguish code written from behavior verified.
- Record the actual tests and builds that were run.
- Include known issues and blocked work.
- Keep the next task small and actionable.
- Do not mark milestones complete based only on intention or generated code.
