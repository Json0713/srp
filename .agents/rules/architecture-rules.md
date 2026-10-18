
---
trigger: model_decision
description: Apply when designing or changing Angular and Phaser integration, gameplay systems, application state, services, event communication, persistence, or project structure.
---

# Project Parasite — Architecture Rules

## Primary Boundary

Angular owns the application interface. Phaser owns the real-time game simulation and rendering.

### Angular Responsibilities

- Application shell, menus, settings, HUD, inventory, and crafting interfaces.
- Accessible interface controls and presentation state.
- Application-level coordination and user-facing error feedback.
- Initiating save/load operations through defined interfaces.

### Phaser Responsibilities

- Game scenes, rendering, and the game loop.
- Player movement, world interaction, and collision behavior.
- Gameplay entities and real-time systems.
- Gameplay input, scene lifecycle, and visual effects.

Do not move real-time simulation into Angular components or use Angular change detection as the game loop.

## Communication Between Systems

- Define explicit, typed boundaries between Angular and Phaser.
- Use commands, events, or narrow interfaces when communication is required.
- Do not expose unrestricted mutable game objects to the Angular UI.
- Avoid circular dependencies and duplicated sources of truth.
- Do not push every animation-frame update into Angular state.
- Update presentation state only when needed or at a justified frequency.
- Clean up event handlers, subscriptions, input registrations, and other resources at their owning lifecycle boundary.

## Gameplay Design

- Separate gameplay rules from rendering when this improves testability or clarity.
- Keep inventory, crafting, resource gathering, and survival calculations deterministic where practical.
- Validate actions before committing state changes.
- Give each system a clear responsibility.
- Avoid giant scenes, God-services, excessive prop-drilling, and unrelated logic grouped in a single module.
- Do not introduce an ECS framework, global state library, event bus, or elaborate dependency-injection system without a demonstrated requirement.

## State Ownership

- Keep UI presentation state in Angular.
- Keep active simulation state in Phaser or in an explicitly designed gameplay domain layer.
- Avoid maintaining the same authoritative value independently in both systems.
- Define which layer owns a value before implementing synchronization.
- Use immutable data transfer objects or other suitable boundaries when passing snapshots between systems.

## Persistence

- Keep save/load operations separate from rendering and UI presentation.
- Validate saved data before restoring game state.
- Handle unavailable storage, invalid data, and failed saves gracefully.
- Preserve existing saves when changing the persistence format.
- Introduce migrations or recovery behavior when the save format evolves.
- Do not introduce a server or database unless an approved requirement calls for one.

## Project Structure

- Follow existing conventions and the actual Angular CLI structure.
- Group code by meaningful responsibility.
- Keep feature-specific UI close to its owning feature.
- Put shared services in a common location only when their responsibilities and scope justify it.
- Document major domain boundaries when they are not obvious from the code.
- Create files and abstractions when needed by actual requirements, not merely because they appear in a proposed architecture.

## Performance and Lifecycle

- Avoid unnecessary allocations, broad scene searches, and expensive work in frequently executed update paths.
- Prevent duplicate game instances and repeated event registration.
- Handle canvas resizing, browser focus, input state, scene transitions, and object cleanup deliberately.
- Measure or reproduce performance issues before making speculative optimizations.

## Architecture Changes

Before a substantial architectural change, explain the current design, the problem, the proposed alternative, the affected boundaries, and the migration or regression risks.

Prefer incremental evolution over replacing working architecture without evidence.
