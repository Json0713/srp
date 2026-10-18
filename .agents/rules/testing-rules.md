
---
trigger: model_decision
description: Apply when adding or modifying behavior, writing tests, fixing defects, changing persistence, investigating regressions, or preparing a completion report.
---

# Project Parasite — Testing Rules

## Inspect the Available Tooling

- Inspect `package.json` and the existing test configuration before running or adding checks.
- Use the project's configured test runner (`Vitest` via `npm test -- --watch=false`).
- Do not assume scripts such as `check`, `lint`, or `e2e` exist.
- Do not install a testing framework when the existing tools can satisfy the requirement.

## Focused Ephemeral Spec Policy (Mandatory)

To keep the repository clean, fast, and free of test-file clutter:

1. **Test Only Current Work:** Create `.spec.ts` files **only** for the feature, enhancement, or defect fix being implemented in the current task. Do not recreate `.spec.ts` files for untouched existing modules.
2. **Verify Once:** Run `npm test -- --watch=false` to verify the new/modified assertions pass.
3. **Delete Immediately After Passing:** As soon as the test run passes, **delete the `.spec.ts` file(s) immediately**. Never leave `.spec.ts` files in `src/`.

## Unit Testing

Prefer isolated tests for deterministic gameplay rules and calculations introduced or modified in the current task, including:

- Movement and boundary calculations.
- Resource quantities and gathering validation.
- Inventory, Codex discovery, and item operations.
- Crafting requirements and outputs.
- Health, hunger, stamina, and other survival calculations.
- Save-data validation and serialization.

Cover relevant normal cases, invalid inputs, and edge cases.

## Integration Testing

Add focused integration coverage when the current change crosses important boundaries, including:

- Angular-to-Phaser communication.
- Gameplay commands and resulting state.
- Inventory, Codex grant unlocking, and crafting interactions.
- Save/load restoration.
- Lifecycle cleanup and event registration.

Use the smallest test scope that reliably proves the behavior, then delete the `.spec.ts` file once verified.

## Browser and Gameplay Verification

Unit tests do not prove that the game works correctly in a browser.

For relevant changes, verify as appropriate:

- Phaser initializes and renders.
- The canvas resizes correctly in both portrait and landscape orientations.
- Keyboard input and mobile virtual joystick controls work and respect focus and pause state.
- Player movement and collisions behave as intended.
- UI updates and Codex notifications reflect gameplay state.
- Interactions and crafting provide appropriate feedback.
- Saving and loading preserve the expected state.

Use existing browser-testing tools if available. Otherwise, report the manual checks that remain necessary.

## Bug Fixes and Regression Tests

1. Reproduce the defect when possible.
2. Trace the affected code path.
3. Establish the root cause using evidence.
4. Create a focused temporary `.spec.ts` regression test where practical.
5. Apply the smallest safe correction.
6. Run `npm test -- --watch=false` to confirm the fix passes, then **delete the `.spec.ts` file immediately**.
7. Verify `npm run build` and related behavior that could regress.

Do not repeatedly change code based on guesses. If the cause is uncertain, investigate further.

## Build and Quality Gates

- Run focused `.spec.ts` tests for the changed behavior, confirm they pass, and delete the `.spec.ts` files afterward.
- Run the production build (`npm run build`) after changes that can affect compilation, styles, or runtime integration.
- Review failures rather than suppressing or bypassing them without justification.
- Do not change unrelated files merely to silence existing failures.
- Distinguish pre-existing failures from failures introduced by the current change.

## Verification Reports

For each task, report the exact checks that ran (including the focused `.spec.ts` verification run and its cleanup) and their observed results.

If a test, build, browser check, or external dependency could not be verified, state that limitation explicitly.

Never fabricate test output or describe unexecuted checks as successful.
