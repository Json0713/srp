# Project Parasite — Current Development Status

## Project Setup

- Project directory: `C:\Lenovo-LOQ\System\Projects\gamedev\SRP`
- Angular project identifier: `srp`
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

## Completed & Refactored Foundations (Phase 1 – Phase 2B + Field Codex)

### 1. Clean Domain-Driven Project Structure
- Reorganized `src/app/` into explicit domain boundaries:
  - `src/app/core/` (`models/game-data.model.ts`, `services/codex.service.ts`, `services/menu-state.service.ts`, `services/settings.service.ts`)
  - `src/app/shared/ui/` (`button.ts`, `page-header.ts`, `selection-card.ts`)
  - `src/app/screens/` (`home/`, `operators/`, `zones/`, `codex/`, `shop/`, `settings/`)
  - `src/app/game/` (`game.ts`, `game.html`, `game.css`, `scenes/main.scene.ts`, `systems/`)
- Enforced the clean repository `.spec.ts` lifecycle policy: 14 test suites (52 tests) were executed and verified passing via `npm test -- --watch=false`, and the temporary `.spec.ts` files were then removed so `src/app/` remains free of test file clutter.

### 2. Field Codex / Game Encyclopedia System (`CODEX.md` & `/codex`)
- Created the canonical developer and agent encyclopedia handbook at `.agents/context/CODEX.md`.
- Implemented `CodexService` (`src/app/core/services/codex.service.ts`) and the interactive `/codex` screen (`src/app/screens/codex/codex.ts`) with three visibility states:
  - `discovered`: Full lore, classification, and telemetry stats visible once granted in-game (persisted to `localStorage`).
  - `undiscovered`: Redacted record (`Encrypted Field Record`) showing the unlock hint until the player obtains/encounters it in gameplay.
  - `development`: Clearly badged (`DEV PHASE 3A`, `DEV PHASE 3B`, etc.) placeholders for upcoming *Scape and Run* parasites (`Rupter`, `Assimilated Human`, `Volatile Spore Carrier`, `Adapted Longarms`), *Magic Survival* powers (`Pulse Carbine Overclock`, `Bio-Repulsor Field`, `Sentinel Micro-Drones`, `Thermal Incineration Wave`), and meta-items.
- Connected `MainScene` -> `Game` -> `CodexService` so harvesting a Biomass Spire node (`E`) in-game automatically grants and unlocks `raw-biomass` (*Raw Biomass Spore*) in the Codex and displays a live `📘 CODEX GRANTED: Raw Biomass Spore` HUD notification.

### 3. Tactical Biopunk UI/UX & Cross-Device Landscape/Portrait Responsiveness
- Upgraded all screens to the **Project Parasite — Outbreak Protocol** dark-biopunk theme (`src/styles.css`), responsive across **Desktop Landscape**, **Mobile Landscape**, and **Mobile Portrait**.
- Production build (`npm run build`) succeeds with 0 errors and 0 warnings.

## Next Target
- **Phase 2C — Camera-Follow & Chunked World Generation**, enabling large-scale exploration with deterministic chunk streaming.

## Update Policy
When updating this document:
- Record only implementation that exists.
- Distinguish code written from behavior verified.
- Record the actual tests and builds that were run.
- Include known issues and blocked work.
- Keep the next task small and actionable.
- Do not mark milestones complete based only on intention or generated code.
