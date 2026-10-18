
# Project Parasite — Game Design

## 1. Identity

- Official display title: Project Parasite
- Full title: Project Parasite
- Project identifier: `srp`
- Genre: Survival roguelite (Magic Survival inspired) with exploration and horror elements
- Perspective: Top-down 2.5D
- Art direction: Pixel art
- Initial platform: Web browser
- Initial game mode: Offline single-player

The display title may contain punctuation such as a colon. Use `SRP` or `srp` for filesystem directories, package identifiers, and other contexts where punctuation would be unsuitable.

## 2. High-Level Vision

Create a maintainable, immersive survival game in which players explore an environment, collect resources, craft useful items, manage survival needs, and face parasitic threats.

The game should gradually evolve from a small, playable prototype into a coherent survival experience. Gameplay must be implemented and verified in manageable increments.

The intended atmosphere uses layered pixel-art scenery, environmental depth, lighting, shadows, and other effects that reinforce exploration and danger.

## 3. Core Gameplay Pillars

### Exploration

Players navigate a game world, discover useful locations, and interact with environmental objects.

### Resource Gathering

Players collect resources such as wood, stone, and berries when the relevant mechanics are implemented.

### Experience and Meta-Progression

Players manage collected items and use valid recipes to create useful objects.

### Survival

Players maintain survival statistics such as health and hunger. Additional statistics, their effects, and their balance remain subject to design decisions.

### Parasite Threats

Parasitic creatures or hazards provide danger and shape the survival experience. Their exact types, behaviors, progression, and balance are not yet finalized.

## 4. Visual Direction

Use a top-down world with a 2.5D presentation.

Potential visual techniques include:

- Pixel-art terrain and environmental objects.
- Layered scenery and foreground occlusion.
- Shadows and atmospheric lighting.
- Depth-aware sprite ordering.
- Environmental effects that reinforce atmosphere.

These techniques should support gameplay readability and performance. Do not add expensive effects or complicated rendering systems before the basic world and movement work.

## 5. Initial Prototype

The initial playable prototype should establish:

1. A game screen integrated with Angular.
2. A Phaser-rendered world.
3. A controllable player.
4. Basic movement and world boundaries.
5. A simple test environment.
6. A foundation for later interactions and survival systems.

A temporary player graphic and placeholder terrain are acceptable for the prototype. They must not be presented as final art assets.

## 6. Planned Features

Features planned for later milestones include:

- Resource objects and gathering.
- Inventory management.
- Crafting recipes.
- Health, hunger, and other survival systems.
- Parasitic enemies and hazards.
- Save/load functionality.
- Improved world design, audio, effects, and user experience.

A feature listed here is planned, not necessarily approved for the current task. Implement it only when its milestone is reached or the user explicitly approves an earlier change.

## 7. Design Decisions Still Open

Do not invent finalized decisions about:

- Story, characters, lore, and narrative progression.
- Parasite species, enemy AI, combat, and infection mechanics.
- World-generation algorithms and world size.
- Resource scarcity, item balance, and crafting recipes.
- Hunger rates, health values, stamina, and difficulty.
- Death, respawning, and game-over behavior.
- Biomes, weather, day/night cycles, and environmental hazards.
- Final sprite dimensions, animation specifications, and asset sources.

When one of these decisions blocks implementation, propose a small set of options and explain the implications before asking for a decision.

## 8. Design Priorities

Prioritize the following:

1. A reliable playable foundation.
2. Clear and satisfying gameplay feedback.
3. Consistent, testable gameplay rules.
4. A cohesive pixel-art presentation.
5. Good performance in the browser.
6. Maintainable architecture that supports future expansion.

Avoid adding mechanics merely because they are common in other survival games. Every system should serve the intended experience.
