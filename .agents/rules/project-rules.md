
---
trigger: always_on
description: Core project rules for SRP: RETURNS covering scope control, safe changes, modern Angular standards, and engineering behavior.
---

# Project Parasite — Project Rules

## Project Identity

Project Parasite (`srp`) is a browser-based, offline, single-player, top-down 2.5D pixel-art survival roguelite game inspired by *Scape and Run: Parasites* and *Magic Survival*.

The project uses Angular, TypeScript, and Phaser. See `.agents/context/GAME_DESIGN.md`, `.agents/context/TECHNICAL_DESIGN.md`, `.agents/context/ROADMAP.md`, and `.agents/context/CODEX.md` for project-specific decisions.

## Mandatory Working Principles

- Inspect the actual repository and relevant files before making changes.
- Follow the root `AGENTS.md` and applicable project rules.
- Implement only the requested task and necessary supporting work.
- Keep `.agents/context/CODEX.md` and `CodexService` synchronized whenever items, parasites, powers, operators, or zones are added or updated.
- **Minimal UI Copy & Interactive (`!`) Info Disclosure Policy:** Keep cards, headers, HUD elements, and modals concise and free of noisy text walls. Show only essential titles/metrics by default and place detailed lore, mechanics, or hints inside the reusable `<app-info-popover>` (`!`) button (`src/app/shared/ui/info-popover.ts`).
- **In-Run Extraction, Autosave & Zero-Kick Modal Policy:** Every new deployment starts in-run Biomass and RP Coins at `0`, autosaves the active run continuously (and on tab hide/blur with auto-pause), and only banks collected Biomass & RP Coins into the Command Vault when the player Aborts or Finishes the mission. In-game Pause Menu subviews (`Operator Stats`, `Field Codex`, `Settings`) must remain inside the modal and never kick the player out of the active run.
- **Focused Ephemeral Spec Policy:** Write `.spec.ts` tests **only** for the newly implemented, enhanced, or fixed behavior in the current task, run `npm test -- --watch=false` once to verify it passes, and **delete the `.spec.ts` file(s) immediately afterward** so zero test files remain in `src/`.
- Preserve existing behavior unless a change is explicitly required.
- Do not overwrite user work or perform destructive operations without approval.
- Do not invent requirements or treat planned features as approved implementation scope.
- Do not add dependencies, frameworks, or architectural layers without a justified need.
- Prefer small, maintainable changes over speculative abstractions or broad rewrites.
- Explain material trade-offs and request approval when requirements or scope are genuinely ambiguous.
- Never claim a test, build, or manual verification passed unless it was actually performed.

## Modern Angular Requirements

- Use standalone components and modern Angular APIs supported by the installed version.
- Do not explicitly set `standalone: true` for Angular 20+ components or directives.
- Prefer modern file naming conventions supported by the installed Angular CLI.
- Prefer signals for reactive UI state and `computed()` for derived values.
- Use `input()`, `output()`, and `model()` where appropriate and supported.
- Prefer `@if`, `@for`, and `@switch` over legacy structural directives in new templates.
- Prefer `class` and `style` bindings over `ngClass` and `ngStyle`.
- Use `inject()` where appropriate and supported.
- Do not explicitly set `ChangeDetectionStrategy.OnPush` in Angular 22 merely to restate the default.
- Do not introduce unsupported APIs or assume examples from older Angular versions remain appropriate.
- Inspect installed package versions and actual project configuration before changing framework code.

## TypeScript Requirements

- Preserve strict type checking.
- Avoid `any`; use precise types or `unknown` with appropriate narrowing.
- Model important domain contracts explicitly.
- Avoid unsafe casts and unnecessary non-null assertions.
- Keep pure calculations separate from side effects when useful.
- Handle errors and invalid states deliberately.

## Change Control

Before significant changes, identify the requirement, proposed approach, affected areas, and verification plan.

Ask before major architectural rewrites, unrequested feature expansion, significant dependency changes, data-destructive operations, or changes with unclear behavior implications.

Do not stop for approval on every routine detail when the task is clear and the implementation is safe.

## Completion Reporting

Report:

1. What changed.
2. Why the change was necessary.
3. Which tests and checks actually ran.
4. Their observed results.
5. Known limitations, unresolved failures, and risks.

A task is not complete simply because code was written.
