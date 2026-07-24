---
sidebar_position: 4
---

# Project rules

The workflow's quality comes from two project-owned files:

| File | Who reads it | Size |
|---|---|---|
| `RULES.md` | you, the orchestrator, the `rules-checker` review agent | full rulebook |
| `development-docs/build-card.md` | every builder agent (their ONLY doctrine) | ≤3KB |

`RULES.md` is the source of truth: git conventions, the critical
composition/spacing rules, SCSS architecture, naming, icon/image pipelines.
The **build card** is a distillation of it — small enough that a builder holds
all of it in context, which is why conventions survive parallel builds.

## Initializing the rules

`aqua-cli init` creates `RULES.md` from a template full of `FILL` markers.
`/aqua-cli-init` resolves them: it explores the codebase first (stylelint
config, exemplar components, `package.json` scripts) and interviews you only
for what the code can't answer. Anything you can't answer yet stays marked
`FILL(deferred)` — the workflow still runs; those gates just stay soft.

## Using AI to write the rules — a real example

The fastest way to complete the rulebook is pointing the agent at what
already exists. Two prompts that work well:

**From project documentation:**

> Read the docs under `Documents/フロントエンド開発/` and update RULES.md with
> the target environments, responsive rules, performance budgets, and
> accessibility requirements. **Verify every claim against the code** —
> if a doc value and the implementation disagree, tell me instead of
> copying the doc.

That last clause matters. In one real run the spec document said the
tablet/PC breakpoint was 1024px while the SCSS said **1080px** — the agent
that verified caught it, the divergence became an explicit decision
("code is the working standard") recorded in RULES.md, and a question went
back to the document's author.

**From exemplar code:**

> Look at 2–3 of our best existing components and derive the SCSS pattern,
> class-naming convention, and token usage for RULES.md. Quote real
> file/line evidence for each rule.

## Keeping rules alive

- **Review feedback is doctrine.** When a PR reviewer's comment contradicts
  RULES.md, `/aqua-cli-pr` stops and surfaces it — if you confirm the
  reviewer, RULES.md is amended *first*, then the code. Rules grow from real
  reviews instead of drifting from them.
- **Regenerate the card after editing rules.** Builders never read RULES.md,
  so re-run `/aqua-cli-init` after any RULES.md change — it rebuilds the
  build card (and enforces the 3,072-byte cap).
- **Only rewrite-forcing rules belong in the card.** Naming/import-order
  violations are cheap to fix after the fact (the `rules-checker` agent does
  it automatically); rules whose violation forces a rebuild — spacing
  ownership, semantic constraints, breakpoint wrapping — go in the card so
  they're never violated in the first place.
