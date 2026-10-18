
---
trigger: model_decision
description: Apply when adding or modifying behavior, writing tests, fixing defects, changing persistence, investigating regressions, or preparing a completion report.
---

# Project Parasite — Testing Rules

## Inspect the Available Tooling

- Inspect `package.json` and the existing test configuration before running or adding checks.
- Use the project's configured test runner (Vitest).
- Do not assume scripts such as `check`, `lint`, or `e2e` exist.
- Do not install a testing framework when the existing tools can satisfy the requirement.
- **Clean Spec Lifecycle:** Create `.spec.ts` files to run and verify unit/integration tests via `npm test -- --watch=false`. Once all tests pass, delete the `.spec.ts` files so the repository stays clean and uncluttered.

## Unit Testing

Prefer isolated tests for deterministic gameplay rules and calculations, including when implemented:

- Movement and boundary calculations.
- Resource quantities and gathering validation.
- Inventory capacity and item operations.
- Crafting requirements and outputs.
- Health, hunger, stamina, and other survival calculations.
- Save-data validation and serialization.

Cover relevant normal cases, invalid inputs, and edge cases.

## Integration Testing

Add integration coverage when behavior crosses important boundaries, including:

- Angular-to-Phaser communication.
- Gameplay commands and resulting state.
- Inventory and crafting interactions.
- Save/load restoration.
- Lifecycle cleanup and event registration.

Use the smallest test scope that reliably proves the behavior.

## Browser and Gameplay Verification

Unit tests do not prove that the game works correctly in a browser.

For relevant changes, verify as appropriate:

- Phaser initializes and renders.
- The canvas resizes correctly.
- Keyboard input works and respects focus and pause state.
- Player movement and collisions behave as intended.
- UI updates reflect gameplay state.
- Interactions and crafting provide appropriate feedback.
- Saving and loading preserve the expected state.

Use existing browser-testing tools if available. Otherwise, report the manual checks that remain necessary.

## Bug Fixes and Regression Tests

1. Reproduce the defect when possible.
2. Trace the affected code path.
3. Establish the root cause using evidence.
4. Add a regression test where practical.
5. Apply the smallest safe correction.
6. Run the relevant tests and checks.
7. Verify related behavior that could regress.

Do not repeatedly change code based on guesses. If the cause is uncertain, investigate further.

## Build and Quality Gates

- Run relevant unit and integration tests.
- Run the production build after changes that can affect compilation or runtime integration.
- Run configured linting and type checks when available and relevant.
- Review failures rather than suppressing or bypassing them without justification.
- Do not change unrelated files merely to silence existing failures.
- Distinguish pre-existing failures from failures introduced by the current change.

## Verification Reports

For each task, report the exact checks that ran and their observed results.

If a test, build, browser check, or external dependency could not be verified, state that limitation explicitly.

Never fabricate test output or describe unexecuted checks as successful.
