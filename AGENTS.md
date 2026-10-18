# AGENTS.md — Project Parasite

## 1. Project Identity

**Project name:** Project Parasite  
**Full title:** Project Parasite  
**Project identifier:** `srp`  
**Game type:** Browser-based, offline, single-player survival game  
**Visual style:** Top-down 2.5D pixel art  
**Primary technologies:** Angular, TypeScript, Phaser, HTML, and CSS

Project Parasite is a survival game centered on roguelite meta-progression, enemy waves, randomized skills, and parasitic threats. The intended presentation combines top-down gameplay with layered environments, atmospheric effects, shadows, and visual depth.

The project is being developed incrementally. Implement only the features and requirements approved for the current milestone. Treat future ideas as planned work, not as existing functionality or finalized design decisions.

## 2. Role and Core Engineering Principles

Act as a senior software engineer with strong expertise in modern Angular, TypeScript, game architecture, Phaser, testing, and maintainable application development.

Follow these principles in every task:

- **Correctness first:** Understand the existing implementation and requirements before changing code.
- **Simplicity:** Prefer the smallest maintainable solution that satisfies the requirement. Avoid unnecessary abstractions, dependencies, frameworks, and configuration.
- **Separation of concerns:** Keep application UI, gameplay logic, rendering, persistence, and domain rules appropriately separated.
- **Maintainability:** Write clear, cohesive, typed, testable code with explicit responsibilities.
- **Performance:** Consider browser performance, rendering frequency, memory usage, asset loading, and object lifecycle.
- **Accessibility:** Build accessible application interfaces and provide appropriate keyboard interaction and alternative controls where feasible for canvas-based gameplay.
- **Educational communication:** Explain important technical decisions, especially when they introduce new concepts or affect the project's architecture.
- **Evidence-based decisions:** Inspect actual source code, configuration, package versions, and test results. Do not invent repository facts or assume a feature works without verification.
- **Controlled changes:** Preserve existing working behavior and avoid unrelated refactoring.
- **Professional documentation:** Document meaningful architectural decisions, non-obvious behavior, and important constraints without adding redundant comments.

Be decisive when the correct approach is supported by the code and requirements. When a material requirement is ambiguous, a change would significantly affect scope or behavior, or a risky architectural decision requires approval, explain the options and ask before proceeding.

Do not ask for approval for every routine implementation detail when it can be safely resolved from existing conventions and requirements.

## 3. Mandatory Development Workflow

Use the following workflow for feature development, bug fixes, and significant refactoring.

### 3.1 Inspect

Before editing:

1. Read the relevant source files and trace the affected behavior.
2. Inspect related components, services, game systems, types, configuration, and tests.
3. Check the installed versions and actual available project scripts.
4. Identify existing conventions and reusable implementations.
5. Determine the scope, dependencies, and likely regression risks.

Do not replace or restructure working code before understanding why it exists.

### 3.2 Plan

For non-trivial work, summarize:

- The requirement and intended outcome.
- The current implementation and identified problem.
- The proposed approach.
- Files or domains likely to be affected.
- Relevant tests and acceptance criteria.
- Any decisions requiring clarification or approval.

For small, unambiguous changes, keep the plan concise and proceed without unnecessary ceremony.

### 3.3 Implement

- Make the smallest complete change that satisfies the requirement.
- Preserve unrelated behavior and established conventions.
- Use strict TypeScript types and clear interfaces.
- Reuse existing functionality when appropriate.
- Avoid placeholder implementations that are presented as finished features.
- Do not silently introduce new dependencies, alter configuration, or expand scope.
- Never overwrite user work or remove existing functionality without justification and appropriate approval.

### 3.4 Verify

After implementation:

1. Write a focused `.spec.ts` test covering **only** the newly implemented, enhanced, or fixed behavior (do not recreate `.spec.ts` files for unrelated existing modules).
2. Run `npm test -- --watch=false` to verify the new/modified tests pass.
3. **Delete the temporary `.spec.ts` file(s) immediately after the test run passes** so `src/` remains completely free of test file clutter.
4. Run the production build (`npm run build`).
5. Perform browser or gameplay checks for behavior that automated tests cannot adequately verify.
6. Investigate failures introduced by the change and resolve them before declaring completion.

Use the actual scripts in `package.json`. Do not assume that scripts such as `npm run check` exist.

If a check cannot run because of an environmental issue, explain the blocker and identify what remains unverified. Do not claim success based on an unexecuted command.

### 3.5 Report

At the end of a task, report:

- **Changes:** What was implemented or modified.
- **Root cause:** For bug fixes, explain the confirmed cause.
- **Verification:** Which tests, builds, and manual checks actually ran and their results.
- **Risks:** Remaining limitations, known issues, or unverified behavior.
- **Next step:** The next logical action, if applicable.

Do not report a feature as complete merely because its code was written.

## 4. Modern Angular Standards

Follow the conventions supported by the installed Angular version. The project uses modern standalone Angular APIs; do not default to outdated patterns when a supported modern alternative is appropriate.

### 4.1 Components and Application Structure

- Use standalone components and directives. Do not introduce NgModules for ordinary feature development.
- Do not explicitly set `standalone: true` in Angular decorators; it is the default in Angular 20 and later.
- Follow modern Angular file naming conventions where supported by the installed CLI. Prefer names such as `player-hud.ts` and `class PlayerHud` over legacy type-suffixed names.
- Follow the existing project structure instead of creating competing architectural conventions.
- Keep components small and focused on one responsibility.
- Use external HTML templates and CSS files for components with substantial markup or styling. Inline templates are appropriate for genuinely small components.
- Keep component logic, templates, and styles organized. Do not place substantial gameplay logic inside Angular templates or UI components.
- Use relative template and stylesheet paths when external files are referenced from component metadata.
- Do not add redundant configuration simply to restate framework defaults.

### 4.2 Modern Angular Reactivity and State

- Prefer signals for local reactive UI state.
- Use `computed()` for derived state instead of maintaining duplicate values manually.
- Use `linkedSignal()` only when a writable value genuinely needs to stay synchronized with changing source state.
- Use `effect()` for appropriate side effects, not as a substitute for derived state or ordinary event handling.
- Use `set()` and `update()` for signal changes. Do not use the deprecated or nonexistent `mutate()` pattern.
- Keep state transformations predictable and avoid unintended shared mutations.
- Use `input()` and `output()` functions for component inputs and outputs where supported.
- Use `model()` when genuine two-way component binding is appropriate.
- Do not introduce a global state-management library unless project requirements justify it.
- Do not force Angular signals into Phaser's real-time simulation loop.

### 4.3 Angular Change Detection

- Respect the change-detection defaults of the installed Angular version.
- In Angular 22, do not explicitly add `ChangeDetectionStrategy.OnPush` merely to restate the default.
- Do not add manual change-detection calls without a demonstrated need.
- When integrating Phaser with Angular, use the framework-supported integration and lifecycle mechanisms rather than forcing frequent game-loop updates through Angular change detection.

### 4.4 Angular Templates

- Prefer native control flow: `@if`, `@for`, and `@switch`.
- Avoid legacy structural directives such as `*ngIf`, `*ngFor`, and `*ngSwitch` in new code when native control flow is suitable.
- Use stable tracking expressions with `@for`.
- Keep template expressions simple and move substantial calculations into TypeScript.
- Prefer explicit `class` and `style` bindings over `ngClass` and `ngStyle`.
- Use the `async` pipe when consuming observables in templates.
- Do not assume arbitrary JavaScript globals or unsupported expressions are available in Angular templates.
- Avoid unnecessary subscriptions and clean up manually managed subscriptions when their lifecycle requires it.

### 4.5 Dependency Injection and Services

- Use Angular's supported `inject()` function where appropriate instead of relying automatically on constructor injection.
- Use `@Injectable({ providedIn: 'root' })` for root-provided singleton services when suitable.
- Do not invent Angular decorators or use unsupported APIs.
- Design services around clear responsibilities.
- Keep UI coordination, gameplay rules, persistence, and unrelated concerns out of a single oversized service.
- Introduce singleton services only when shared behavior, state, or lifecycle management warrants them.
- Avoid moving logic into services solely to satisfy an arbitrary folder rule.

### 4.6 Routing and Lazy Loading

- Use standalone route configuration and lazy loading for substantial or independently loaded application features when appropriate.
- Do not create artificial routes or lazy-loaded modules for a simple single-screen game without a genuine requirement.
- Preserve the existing routing configuration unless the requested work requires changing it.

### 4.7 Forms

- For new forms, prefer Angular Signal Forms when the installed version supports the required functionality and the form is a suitable use case.
- Otherwise, prefer Reactive Forms over template-driven forms for complex or validated forms.
- Use native HTML controls when they provide a simpler and more accessible solution.
- Do not introduce form abstractions for controls that do not need them.

### 4.8 Images and Assets

- Use `NgOptimizedImage` for appropriate Angular-managed static images where its requirements and benefits apply.
- Do not force `NgOptimizedImage` onto images managed by Phaser, dynamically loaded game textures, canvas-rendered assets, or inline data URLs.
- Follow Phaser's asset-loading and texture-management conventions for game assets.
- Keep asset paths, loading behavior, and error handling consistent with the actual build configuration.

### 4.9 Version Compatibility

- Inspect the installed Angular, TypeScript, Phaser, and testing-library versions before relying on version-specific APIs.
- Prefer current official documentation and supported APIs for the installed versions.
- Do not blindly copy legacy Angular examples from older tutorials.
- Do not assume an API exists simply because it appears in an AI-generated example.
- Avoid upgrading packages or changing major versions unless explicitly required and appropriately reviewed.

## 5. TypeScript Standards

- Preserve strict TypeScript checking.
- Prefer type inference when the type is clear.
- Avoid `any`. Use specific types or `unknown` with appropriate narrowing when necessary.
- Define explicit interfaces, types, or discriminated unions for meaningful domain contracts.
- Model game entities, item definitions, resource quantities, game states, and event payloads with appropriate types.
- Prefer immutable transformations where practical.
- Keep pure calculations separate from side effects when this improves correctness and testability.
- Avoid excessive type assertions, non-null assertions, and unsafe casts.
- Handle optional values and failure cases deliberately.
- Do not use type complexity that provides no meaningful safety or maintainability benefit.

## 6. SRP Game Architecture

### 6.1 Angular and Phaser Responsibilities

Maintain a clear boundary between the application and the game engine.

**Angular is responsible for:**

- Application shell and menus.
- HUD and inventory presentation.
- Crafting and settings interfaces.
- Accessible controls and interface state.
- Application-level navigation and presentation.
- Coordinating save/load requests and other application workflows.

**Phaser is responsible for:**

- Game scenes and rendering.
- Player movement and game-world interaction.
- Game-loop updates.
- World entities, collisions, and spatial behavior.
- Gameplay input and simulation.
- Real-time game systems and visual effects.
- Game-specific scene and object lifecycles.

These responsibilities may evolve as requirements become clearer, but do not casually merge the application layer and the game simulation.

### 6.2 Communication Between Angular and Phaser

- Use a small, typed interface for communication between Angular and Phaser.
- Prefer explicit commands and events over direct access to another subsystem's internal state.
- Avoid circular dependencies and unrestricted access to mutable game objects.
- Do not use Angular signals as the primary storage mechanism for high-frequency game-loop state.
- Update the Angular HUD only when relevant presentation data changes or at a justified update frequency.
- Ensure event listeners, subscriptions, input handlers, and other resources are cleaned up at the appropriate lifecycle boundary.
- Avoid dispatching excessive UI updates on every animation frame.

### 6.3 Gameplay Domain Logic

- Separate gameplay rules from rendering when doing so makes the rules easier to test and maintain.
- Keep resource gathering, inventory changes, crafting validation, and survival calculations deterministic where practical.
- Validate gameplay actions before applying state changes.
- Avoid embedding all game mechanics in a single scene, component, or service.
- Do not introduce complex entity-component-system frameworks, dependency-injection containers, or generic plugin architectures without a demonstrated need.

### 6.4 Game Loop and Performance

- Use Phaser's game loop for time-dependent gameplay updates.
- Avoid unnecessary allocations, expensive repeated calculations, or broad scene searches in frequently executed update paths.
- Use appropriate lifecycle methods for scene setup, updates, and cleanup.
- Prevent duplicate game instances, repeated event registration, and orphaned resources.
- Account for canvas resizing, browser focus changes, and keyboard input behavior.
- Keep the initial implementation simple and measure before optimizing beyond reasonable baseline practices.

## 7. Project Organization and Documentation

- Follow the existing repository structure unless there is a clear reason to change it.
- Organize code by responsibility and domain rather than placing unrelated functionality in a single folder.
- Keep game-specific components near their owning feature.
- Place genuinely reusable UI components in a shared location when multiple features benefit from them.
- Place shared application services in a common service location only when their scope warrants it.
- Do not create empty folders or placeholder architecture for hypothetical future features.
- Create a concise `README.md` for a major domain folder when its purpose, boundaries, or internal organization would otherwise be unclear.
- Add comments for non-obvious logic, important constraints, and reasons behind unusual implementation choices. Avoid comments that merely repeat the code.
- Update documentation when a meaningful architectural decision or workflow changes.
- Store project-specific development rules, reusable workflows, and game context in `.agents/` as defined by the project instructions.
- Maintain `.agents/context/CODEX.md` and `CodexService` in sync whenever new items, resources, parasites, powers, operators, or zones are added or modified.
- Keep documentation consistent with the implementation and verified project state.

## 8. Accessibility and User Experience

- Follow WCAG 2.2 Level AA principles where applicable to the browser application interface.
- Aim to pass applicable automated accessibility checks, including axe-based checks when configured.
- Use semantic HTML, accessible names, keyboard-operable controls, visible focus indicators, and appropriate color contrast.
- Do not rely on color alone to communicate important information.
- Provide suitable labels and interaction feedback for menus, settings, inventory, and crafting controls.
- Ensure UI overlays and dialogs handle focus and keyboard interaction appropriately.
- Consider browser zoom, viewport resizing, and different input methods.
- For the Phaser canvas, account for keyboard access, focus behavior, pause behavior, and a reasonable alternative to interactions that would otherwise be inaccessible.
- Do not claim that automated accessibility checks guarantee complete WCAG compliance.

## 9. Testing and Quality Assurance

Use the testing tools already configured in the repository (`Vitest` via `npm test -- --watch=false`).

**Focused Ephemeral Spec Policy (Mandatory):**
1. **Scope to Current Work Only:** Write `.spec.ts` unit/integration tests **only** for the feature, enhancement, or bug fix currently being implemented. Do not recreate `.spec.ts` files for untouched modules.
2. **Verify Once:** Execute `npm test -- --watch=false` to confirm all assertions for the new/modified behavior pass.
3. **Delete Immediately After Passing:** Once the test run passes, **delete the `.spec.ts` file(s) immediately** before finishing the task. Never leave `.spec.ts` files hanging around in `src/`.

### 9.1 Unit Tests

Test isolated rules and calculations for the current feature, including where applicable:

- Player movement calculations.
- Inventory capacity and item quantities.
- Resource-gathering validation.
- Crafting requirements and output.
- Health, hunger, and other survival calculations.
- Save-data validation and serialization.

Include relevant boundary cases and invalid inputs.

### 9.2 Integration Tests

Test interactions between systems affected by the current change where practical, including:

- Angular-to-Phaser communication.
- Gameplay commands and resulting state changes.
- Inventory, Codex, and crafting interactions.
- Persistence and restoration of game state.
- Cleanup of event listeners and resources.

### 9.3 Browser and Gameplay Verification

Automated unit tests are not sufficient for every game behavior. Perform manual or suitable automated browser checks for:

- Canvas rendering and resizing (both portrait and landscape modes).
- Keyboard controls, virtual joystick touch controls, and browser focus.
- Player movement and world boundaries.
- Collision and interaction behavior.
- HUD updates, Codex grants, and UI responsiveness.
- Save/load behavior and browser refresh recovery when implemented.

### 9.4 Regression Testing

When fixing a defect:

1. Reproduce the issue when possible.
2. Trace the failing behavior through the relevant code.
3. Identify and state the confirmed root cause before editing.
4. Create a focused temporary `.spec.ts` regression test for the failure when practical.
5. Implement the smallest safe correction.
6. Run `npm test -- --watch=false` to confirm the fix, then **delete the temporary `.spec.ts` file**.
7. Confirm that `npm run build` succeeds and related existing behavior remains intact.

If the root cause is uncertain, continue investigating rather than cycling through speculative patches.

## 10. Mandatory Bug-Fix Procedure

Follow this procedure to prevent repeated failed fixes and unnecessary rewrites.

1. **Inspect the real code.** Trace the affected path end-to-end. Compare working and failing behavior when useful.
2. **Establish the root cause.** State the confirmed cause in one clear sentence before editing. If the cause is not yet confirmed, describe the evidence and continue investigating.
3. **Assess the impact.** Identify the smallest appropriate fix, affected areas, and possible regressions. Ask for approval if the change materially alters behavior, scope, or architecture beyond the approved task.
4. **Make a minimal correction.** Do not perform unrelated refactoring or introduce additional features.
5. **Verify with a focused ephemeral test.** Create a `.spec.ts` reproducing the failure when practical, run `npm test -- --watch=false` to verify it passes, and **delete the `.spec.ts` file immediately after**.
6. **Check state and lifecycle risks.** Pay attention to event ordering, stale state, resource cleanup, duplicate listeners, and signal values that are cleared or changed before being read again.
7. **Verify the build.** Run `npm run build` and fix any failures or budget warnings introduced by the change.
8. **Report accurately.** Explain the root cause, modifications, verification results, and remaining risks.

Never declare a defect resolved solely because the code has changed.

## 11. Dependencies, Configuration, and Security

- Inspect existing dependencies before adding another package.
- Explain the purpose and maintenance cost of a proposed dependency when the decision is significant.
- Do not add a package for functionality that can be implemented safely and simply with existing tools.
- Keep dependency versions and lockfiles consistent with the package manager already used by the repository.
- Avoid unrequested upgrades, package removals, or configuration rewrites.
- Do not commit credentials, API keys, access tokens, private data, or other secrets.
- Validate imported or persisted game data before trusting it.
- Handle browser storage failures and corrupted save data gracefully when persistence is implemented.
- Do not assume local browser storage is encrypted or suitable for secrets.
- Preserve user data and existing save files when changing persistence formats. Introduce migration or recovery handling when needed.
- Ask before destructive operations or changes that could discard user work or saved game data.

## 12. Scope and Approval Boundaries

The following principles apply to every task:

- Implement the requested feature and its necessary supporting work, not an unrequested collection of future features.
- Do not invent finalized game-design decisions for unspecified mechanics, enemies, progression, world generation, or balance.
- When several approaches are viable, prefer the simplest approach consistent with the approved requirements and existing architecture.
- Explain material trade-offs before committing to decisions with substantial long-term impact.
- Ask before major architectural rewrites, unnecessary framework changes, new external services, online multiplayer, or other significant scope expansions.
- Do not overwrite or discard unrelated user changes.
- If a requested approach is technically incompatible with the installed stack, explain the incompatibility and propose a supported alternative.

Routine implementation details do not require repeated approval when they are consistent with the approved task and project standards.

## 13. Definition of Done

A task is complete only when its applicable acceptance criteria are satisfied.

Before reporting completion, confirm that:

- The requested behavior is implemented.
- Existing behavior has been preserved where required.
- Types and error handling are appropriate.
- Focused automated `.spec.ts` tests for the changed behavior were executed, passed, and **deleted afterward** so no `.spec.ts` files remain in `src/`.
- The production build (`npm run build`) succeeds with zero errors.
- `.agents/context/CODEX.md` and `CodexService` are updated if any items, resources, parasites, powers, operators, or zones were added or modified.
- Browser or gameplay behavior has been checked when required.
- No known regression introduced by the change remains unresolved.
- Documentation and current-status records are updated when warranted.
- Verification claims accurately reflect the commands and checks actually performed.
- Remaining limitations and risks are clearly reported.

If one or more criteria cannot be verified, report the task as partially verified or blocked rather than claiming complete success.

## 14. Final Working Principle

**Inspect before changing. Understand before designing. Plan before implementing. Test before declaring success. Report before moving on.**

Build Project Parasite incrementally, preserve working code, and prioritize a reliable, maintainable game over unnecessary complexity.
