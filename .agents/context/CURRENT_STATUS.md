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

## Completed in Phase 1: The Fallout (Milestones 1A & 1B)

### 1. Clean Domain-Driven Project Structure
- Reorganized `src/app/` into explicit domain boundaries:
  - `src/app/core/` (`models/game-data.model.ts`, `services/codex.service.ts`, `services/menu-state.service.ts`, `services/settings.service.ts`)
  - `src/app/shared/ui/` (`button.ts`, `page-header.ts`, `selection-card.ts`)
  - `src/app/screens/` (`home/`, `operators/`, `zones/`, `codex/`, `research/`, `settings/`)
  - `src/app/game/` (`game.ts`, `game.html`, `game.css`, `scenes/main.scene.ts`, `systems/`)
- Enforced the Focused Ephemeral Spec Policy: unit/integration tests are written specifically for newly implemented or modified features, verified via `npm test -- --watch=false`, and deleted immediately afterward so `src/app/` remains free of test file clutter.

### 2. Field Codex / Game Encyclopedia System (`CODEX.md` & `/codex`)
- Created the canonical developer and agent encyclopedia handbook at `.agents/context/CODEX.md`.
- Implemented `CodexService` (`src/app/core/services/codex.service.ts`) and the interactive `/codex` screen (`src/app/screens/codex/codex.ts`) with three visibility states (`discovered`, `undiscovered`, and `development`) and full Outbreak Phase dossiers (`Phase 1: The Fallout`, `Phase 2: The Assimilation`, `Phase 3: The Synthesis`).
- Connected `MainScene` -> `Game` -> `CodexService` so harvesting a Biomass Spire node (`E`) in-game automatically grants and unlocks `raw-biomass` (*Raw Biomass Spore*) in the Codex and displays a live `📘 CODEX GRANTED: Raw Biomass Spore` HUD notification.

### 3. Research Lab (`/research`) & Phase 1: The Fallout Command Deck
- Replaced the legacy "Black Market" placeholder with the **Research Lab** (`src/app/screens/research/research.ts`), featuring two synthesis tracks (**Bio-Research** meta-upgrades and **Rig Cosmetics** suit/trail overrides) and an interactive Blueprint Inspector.
- Aligned the Home Command Deck (`src/app/screens/home/home.html`) and all game services around **Phase 1: The Fallout**.
- Production build (`npm run build`) succeeds with 0 errors and 0 warnings.

## Next Target
- **Milestone 1C (Phase 1: The Fallout) — Camera-Follow & Chunked World Generation**, enabling large-scale Sector 7 exploration with deterministic chunk streaming.

## Update Policy
When updating this document:
- Record only implementation that exists.
- Distinguish code written from behavior verified.
- Record the actual tests and builds that were run.
- Include known issues and blocked work.
- Keep the next task small and actionable.
- Do not mark milestones complete based only on intention or generated code.
