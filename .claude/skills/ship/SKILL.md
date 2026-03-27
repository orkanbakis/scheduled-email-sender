---
name: ship
description: Review changes, commit with conventional commits, and open a PR
disable-model-invocation: true
allowed-tools: Bash, Read, Grep, Glob, Agent
argument-hint: [base-branch]
---

Ship the current changes: review first, then commit and open a PR.

Base branch: $ARGUMENTS (default to `master` if not provided).

## Step 1 — Review Changes

1. Run `git status` and `git diff --stat` to understand all changes.
2. Read changed files as needed to understand *what* and *why* things changed.
3. Launch a **review subagent** to audit the changes:

Use the Agent tool with this prompt:

> You are a code reviewer. Review all uncommitted and staged changes in the working tree.
>
> Run: `git diff` and `git diff --cached` to see all changes.
>
> Check for:
> - Bugs, logic errors, or edge cases
> - Security issues (hardcoded secrets, injection, unsafe input handling)
> - Code style or naming inconsistencies
> - Missing tests for new functionality
>
> Return a structured review:
> 1. **Summary** — one-paragraph overview of the changes
> 2. **Issues** — list any problems found (label severity: critical / warning / nit)
> 3. **Verdict** — SHIP IT or NEEDS CHANGES
>
> If verdict is SHIP IT, say so clearly. If NEEDS CHANGES, list exactly what must be fixed.

- If the review says **NEEDS CHANGES**, fix the issues before proceeding.
- If the review says **SHIP IT**, proceed to Step 2.

## Step 2 — Stage & Commit (Conventional Commits)

1. Stage the relevant files (prefer explicit file names over `git add .`).
2. Write a commit message following **Conventional Commits** format:

   ```
   <type>(<scope>): <short summary>

   <body — explain WHY, not what>
   ```

   **Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `ci`, `build`
   **Scope:** lowercase module/area name (e.g., `game`, `ui`, `auth`). Omit if change is cross-cutting.
   **Summary:** imperative mood, lowercase, no period, max 72 chars.
   **Body:** wrap at 72 chars. Explain motivation and contrast with previous behavior.

3. If there are logically distinct groups of changes, create multiple commits — one per logical unit.

## Step 3 — Push & Open PR

1. Create a feature branch if still on the base branch (`git checkout -b <descriptive-branch-name>`).
2. Push with `git push -u origin <branch>`.
3. Open a PR using `gh pr create`:
   - **Title:** Use the conventional commit summary (e.g., `feat(game): add lane-switching mechanic`).
   - **Body:** Include:
     - `## Summary` — bullet points of changes
     - `## Review notes` — anything reviewers should know
     - `## Test plan` — how to verify the changes work

4. Return the PR URL to the user.
