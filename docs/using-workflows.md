---
sidebar_position: 5
---

# Using the workflow

Everything runs through one playbook: **`WORKFLOW.md`** — parallel,
self-converging builders gated by a deterministic pixel diff, with exactly two
user sittings per issue.

## Entry point

- **Run `/aqua-cli-issue <N>`** — the installed slash command fetches issue `<N>`
  (body + comments), parses the intake fields, and runs `WORKFLOW.md`.
- Issue routing is by the fields in the issue body:

| Fields | Scope |
|---|---|
| `COMPONENT_NAME：…` / `COMPONENT_CATEGORY：…` | one component triple (`.tsx` / `.scss` / `.stories.tsx`) — the degenerate case: one builder, no page assembly |
| `PAGE_PATH：…` / `PAGE_TITLE：…`, or the `page` label | a full URL under `src/pages/` (page shell + N sections) |

New issues are authored with `/aqua-cli-create-issue`.

## The four phases

1. **Intake** (serial, one user gate) — shallow Figma recon, section
   inventory, reuse decisions against the component catalog, per-unit
   reference PNG export (`figma-refs/<N>/<unit>/figma-{pc,sp}.png`).
2. **Build** (parallel) — one `section-builder` agent per unit. Each builder
   carries only the ≤3KB `development-docs/build-card.md` (never `RULES.md`
   or the workflow doc) and self-converges: build → render in Storybook →
   `scripts/converge.mjs` (SSIM diff vs the Figma reference) → fix flagged
   regions → repeat, hard-capped at 3 iterations. Shared-component edits
   serialize on the orchestrator.
3. **Assemble** (serial) — compose the page, wire link URLs from the
   project's link-URL source of truth, one `scripts/page-parity.mjs` pass,
   a `rules-checker` agent fixes mechanical convention violations, then
   `scripts/evidence-pack.mjs` builds `figma-refs/<N>/evidence.html`.
4. **Review** (one user sitting) — the evidence pack shows Figma vs render
   side by side per section with diff scores; findings dispatch fix agents;
   then commit, PR, and the hand-off report.

## Key mechanics

- **No `spec.html`, no per-unit approval.** The Figma MCP design context plus
  the reference PNG *is* the spec; convergence is gated by
  `scripts/visual-diff.py` (windowed SSIM + per-band localization), not by a
  human sitting.
- **Unconverged ≠ blocked.** A section that doesn't reach the threshold after
  3 iterations is surfaced in the evidence pack with its heatmap — a review
  item, never an automatic blocker.
- **Threshold calibration.** `verification.convergeThreshold` in
  `cpdk.config.json` (default 0.90). Calibrate against 2–3 known-good units
  before trusting the loop; re-calibrate when fonts or the rendering pipeline
  change.
- **The build card.** `/aqua-cli-init` distills `RULES.md` into
  `development-docs/build-card.md` (≤3KB): tokens, the blessed SCSS pattern,
  file layout, and the handful of rules whose violation forces a rewrite.
  Re-run `/aqua-cli-init` after editing `RULES.md`.
- **Figma is a moving source of truth** — reference PNGs are exported at
  intake; if the design changes mid-issue, re-export and re-converge.

## Pace targets

A 4–6-section page targets **≤30 min agent wall-clock** and exactly
**2 user sittings**. Targets are signals, not gates — never thin a check to
make a budget.
