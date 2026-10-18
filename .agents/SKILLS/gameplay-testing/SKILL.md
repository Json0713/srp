
---
name: gameplay-testing
description: Verifies Project Parasite gameplay, Phaser rendering, keyboard and touch controls, Angular integration, browser behavior, and regression risks. Use when testing a prototype, reviewing gameplay changes, or validating a milestone.
---

# Gameplay Testing

## Objective

Establish whether the implemented game behaves as intended through appropriate automated and browser-based checks.

## 1. Identify the Test Scope

Determine:

- Which feature or milestone changed.
- Its acceptance criteria.
- Relevant unit and integration tests.
- Required browser interactions.
- Related behavior that could regress.

Do not test unrelated systems exhaustively when a focused test is sufficient.

## 2. Automated Checks

Inspect the project's actual scripts and test configuration.

Run relevant unit tests for deterministic gameplay rules.

Run integration tests for important boundaries, including Angular–Phaser communication and state synchronization.

Run the production build when the change can affect compilation or runtime integration.

Report failures accurately and distinguish existing failures from regressions introduced by the change.

## 3. Browser Initialization

When validating the game screen:

- Confirm the application loads without fatal errors.
- Confirm the Phaser canvas initializes and renders.
- Check for duplicate game instances.
- Check relevant browser console errors.
- Verify resizing and lifecycle behavior when applicable.

## 4. Keyboard and Movement

When movement is implemented:

- Test WASD and arrow keys if both are required.
- Verify that movement direction and speed are consistent.
- Check diagonal movement behavior.
- Verify world boundaries and collision handling.
- Check whether input remains stuck after focus changes, pause, or scene transitions.
- Confirm that keyboard input does not unintentionally trigger browser actions while gameplay is active.
- Verify that event handlers are not registered repeatedly.

Only apply checks relevant to the implemented controls and approved behavior.

## 5. Interaction and Gameplay State

When applicable, verify:

- Valid and invalid interactions.
- Resource collection and resource limits.
- Inventory capacity and item quantities.
- Crafting requirements and resource consumption.
- Health, hunger, and other survival updates.
- Feedback for failed actions.
- Consistency between authoritative game state and Angular presentation.

Test edge cases, not only the successful path.

## 6. Persistence

When save/load is implemented:

- Save a known game state.
- Reload or restart using the supported workflow.
- Verify the restored state.
- Test missing, corrupted, or incompatible save data as appropriate.
- Check failure handling when browser storage is unavailable.
- Confirm that a failed load does not silently corrupt or discard recoverable data.

## 7. Accessibility and Presentation

For relevant UI changes:

- Check keyboard operation and visible focus.
- Verify accessible names and semantic controls.
- Check text contrast and interface feedback.
- Confirm that dialogs and overlays handle focus correctly.
- Consider zoom, viewport resizing, and canvas interaction limitations.

Automated accessibility checks are useful but do not replace manual review.

## 8. Regression Review

Recheck nearby functionality that shares state, input, lifecycle, or rendering behavior with the changed feature.

Pay special attention to:

- Duplicate event listeners.
- Stale UI state.
- Incorrect cleanup.
- Canvas resizing.
- Input conflicts.
- Invalid state transitions.
- Save/load regressions.

## 9. Final Test Report

Record:

- The feature tested.
- Automated checks executed and their results.
- Browser and gameplay checks performed.
- Known failures and blockers.
- Unverified behavior.
- Whether the acceptance criteria were satisfied.

Never invent test results or imply that manual browser testing occurred when it did not.
