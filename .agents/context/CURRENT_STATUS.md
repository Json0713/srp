# Project Parasite — Current Development Status

## Project Setup

- Project directory: `C:\Lenovo-LOQ\System\Projects\gamedev\SRP`
- Angular project identifier: `srp`
- Root project instructions: `AGENTS.md`
- Project-specific instructions and knowledge: `.agents/`

## Environment Verified

- Node.js: `v24.19.0`
- npm: `11.17.0`
- Angular CLI / Angular: `22.2.2`
- TypeScript: `6.0.3`
- Phaser: `4.2.1`
- Vitest: `4.1.11`

## Completed & Refactored Foundations (Phase 1 – Phase 2B)

### 1. Clean Domain-Driven Project Structure
- Reorganized `src/app/` into explicit domain boundaries:
  - `src/app/core/` (`models/game-data.model.ts`, `services/menu-state.service.ts`, `services/settings.service.ts`)
  - `src/app/shared/ui/` (`button.ts`, `page-header.ts`, `selection-card.ts`)
  - `src/app/screens/` (`home/`, `operators/`, `zones/`, `shop/`, `settings/`)
  - `src/app/game/` (`game.ts`, `game.html`, `game.css`, `scenes/main.scene.ts`, `systems/`)
- Removed temporary report clutter from `.agents/reports/` and unified project naming (`Project Parasite`) across all `.agents/` rules and skills.

### 2. Modern Angular 22 & Strict TypeScript Compliance
- Removed redundant `standalone: true` decorators across all components.
- Migrated all UI component inputs/outputs (`Button`, `PageHeader`, `SelectionCard`) from legacy `@Input()` / `@Output()` decorators to modern `input()`, `input.required()`, and `output()` signals.
- Migrated derived state in `MenuStateService` and screen components to `computed()` signals.
- Eliminated all `any` usages in `game.ts` and `main.scene.ts` with strict Phaser 4 types and explicit listener cleanup (`shutdown`/`destroy`).
- Isolated Phaser instantiation inside `NgZone.runOutsideAngular()` and restricted HUD synchronization to event-driven snapshots (`hud-update`) when resources are collected or proximity state changes.

### 3. Tactical Biopunk UI/UX & Cross-Device Landscape/Portrait Responsiveness
- Replaced generic web colors with the **Project Parasite — Outbreak Protocol** dark-biopunk theme (`src/styles.css`).
- Engineered responsive layouts across **Desktop Landscape**, **Mobile Landscape** (`@media (max-height: 540px) and (orientation: landscape)`), and **Mobile Portrait** using dynamic viewport units (`100dvh`/`100dvw`) and safe-area insets.
- Upgraded `MainScene` with 2.5D drop shadows, dark containment terrain, biomass spire nodes, proximity harvest indicators, and smooth 360° analog virtual joystick movement alongside 8-way normalized keyboard controls.

## Next Target
- **Manual Browser Verification** of the revamped UI/UX across desktop and mobile portrait/landscape viewports.
- **Phase 2C — Camera-Follow & Chunked World Generation**, enabling large-scale exploration with deterministic chunk streaming.

## Update Policy
When updating this document:
- Record only implementation that exists.
- Distinguish code written from behavior verified.
- Record the actual tests and builds that were run.
- Include known issues and blocked work.
- Keep the next task small and actionable.
- Do not mark milestones complete based only on intention or generated code.
