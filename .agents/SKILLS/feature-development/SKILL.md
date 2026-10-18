
---
name: feature-development
description: Implements Project Parasite features incrementally using modern Angular, TypeScript, and Phaser practices. Use when adding gameplay mechanics, UI, interactions, inventory, crafting, survival systems, or new architectural functionality.
---

# Feature Development

## Objective

Deliver one complete, testable feature that fits the approved requirements and existing architecture.

## Workflow

### 1. Confirm Scope

- Identify the requested feature and expected behavior.
- Consult the relevant game design, technical design, and roadmap documents.
- Determine whether the feature is planned, approved, and appropriate for the current milestone.
- Identify unresolved design decisions that could change the implementation.

Do not implement unrelated roadmap items.

### 2. Inspect Existing Code

- Read the relevant components, scenes, services, domain types, and tests.
- Inspect existing patterns before creating new abstractions.
- Check the installed Angular and Phaser versions.
- Inspect the relevant configuration and package scripts.
- Identify integration points and lifecycle responsibilities.

### 3. Define Acceptance Criteria

Write concise, observable criteria that describe when the feature works.

Include relevant normal behavior, failure cases, and edge conditions.

For a non-trivial feature, identify:

- State ownership.
- Inputs and outputs.
- Expected UI feedback.
- Validation rules.
- Cleanup and lifecycle behavior.
- Tests and manual checks required.

### 4. Design the Smallest Appropriate Solution

Choose the simplest maintainable design consistent with the existing project.

For Angular:

- Keep UI components focused.
- Prefer signals and current Angular APIs where appropriate.
- Keep templates readable and accessible.
- Avoid putting gameplay simulation in components.

For Phaser:

- Use the installed version's supported APIs.
- Keep scene and entity lifecycles explicit.
- Avoid unnecessary work in the game loop.
- Separate deterministic gameplay rules from rendering when useful.

For integration:

- Use narrow, typed interfaces.
- Keep authoritative state under one clear owner.
- Avoid excessive Angular updates during gameplay.

### 5. Implement Incrementally

- Make small, coherent changes.
- Keep types explicit where they improve safety.
- Validate actions before changing gameplay state.
- Handle failure cases deliberately.
- Clean up resources at the correct lifecycle boundary.
- Avoid adding dependencies unless the requirement justifies them.

Do not build abstractions for hypothetical future requirements.

### 6. Test the Feature (Focused Ephemeral Spec Policy)

1. Write a focused `.spec.ts` test **only** for the newly implemented or modified feature (deterministic rules, service logic, or component behavior). Do not recreate `.spec.ts` files for unrelated existing modules.
2. Run `npm test -- --watch=false` once to verify the feature's tests pass.
3. **Immediately delete the `.spec.ts` file(s) once the test run passes** so `src/` stays clean and free of leftover test files.
4. Run `npm run build` to verify compilation and CSS/bundle budgets.
5. Verify the actual user-visible behavior in the browser when required.
6. Fix any failures introduced by the feature. Do not hide unrelated failures or claim unexecuted checks passed.

### 7. Review the Change

Inspect the resulting changes for:

- Leftover `.spec.ts` files (must all be deleted after passing).
- Unnecessary files or dependencies.
- Duplicated state.
- Unhandled edge cases.
- Incorrect lifecycle cleanup.
- Accessibility and portrait/landscape responsiveness regressions.
- Unrelated modifications.
- `.agents/context/CODEX.md` and `CodexService` synchronization whenever new items, resources, parasites, powers, operators, or zones are added or updated.
- Documentation that no longer matches implementation.

### 8. Report Completion

Summarize the implemented behavior, key design decisions, focused ephemeral tests executed (and deleted after passing), production build results, and outstanding limitations.

Update `CURRENT_STATUS.md` when the verified project state or next milestone changes.

## Feature Completion Rule

A feature is not complete merely because its main code path exists. Its acceptance criteria, focused ephemeral test verification (followed by `.spec.ts` deletion), Codex synchronization, and production build requirements must be satisfied.
