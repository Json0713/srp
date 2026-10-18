
---
name: systematic-debugging
description: Investigates bugs, regressions, build failures, and unexpected Angular or Phaser behavior by reproducing the issue, tracing the root cause, applying a minimal fix, and verifying the result. Use when diagnosing or fixing defects.
---

# Systematic Debugging

## Objective

Find and correct the actual cause of a defect without entering a cycle of speculative patches.

## Workflow

### 1. Understand the Failure

- Read the reported symptoms and expected behavior.
- Inspect the relevant source files, configuration, logs, and tests.
- Reproduce the failure when possible.
- Record the exact conditions under which it occurs.
- Distinguish confirmed facts from hypotheses.

Do not modify code merely because a suspected cause seems plausible.

### 2. Trace the Execution Path

Follow the behavior from its entry point to the observed failure.

For Angular, inspect relevant component state, inputs, outputs, services, lifecycle hooks, and template bindings.

For Phaser, inspect the scene lifecycle, input registration, update logic, collisions, entity state, and event handling as applicable.

For Angular–Phaser integration, inspect both sides of the interface and verify where state is owned, changed, and presented.

Compare working behavior with failing behavior when useful.

### 3. Establish the Root Cause

State the cause in one clear sentence when evidence supports it.

If the cause remains uncertain, identify the leading hypotheses and the next diagnostic step.

Do not present an unverified hypothesis as a confirmed root cause.

### 4. Choose the Smallest Safe Fix

- Change only the code required to correct the defect.
- Preserve unrelated behavior.
- Avoid drive-by refactoring and unrequested features.
- Check whether the proposed fix changes user-visible behavior or architecture.
- Ask for approval if the fix materially expands scope or introduces a risky change.

### 5. Add Regression Coverage

Where practical:

- Add a test that reproduces the original failure.
- Cover relevant boundary conditions and invalid inputs.
- Prefer testing deterministic rules independently from rendering.
- Add integration coverage when the failure involves communication between systems.

Do not extract code into a utility solely to satisfy an arbitrary testing rule.

### 6. Verify

Run the relevant tests and configured checks.

For Angular or Phaser integration defects, run a production build when applicable.

For visual or interactive failures, perform the required browser or gameplay check when possible.

Check for related regressions, including stale state, duplicate listeners, incorrect cleanup, and lifecycle ordering.

### 7. Report

Provide:

- Reproduction conditions.
- Confirmed root cause or remaining uncertainty.
- Files and behavior changed.
- Regression tests added.
- Commands and checks actually run.
- Results and remaining risks.

## Stop Conditions

Stop and ask for clarification when:

- The intended behavior is materially ambiguous.
- The likely fix could destroy user data or existing work.
- The correction requires a major redesign outside the approved scope.
- The available evidence cannot distinguish between materially different fixes.

Do not continue cycling through speculative changes after repeated failures. Reassess the diagnosis.
