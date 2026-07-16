---
sidebar_position: 5
---

# Using the workflows

aqua-cli installs three workflow files that drive how Claude Code turns a Figma
design into shipped code:

- **`WORKFLOW-COMPONENT.md`** — build one component (14 steps).
- **`WORKFLOW-PAGE.md`** — build an entire page/URL (7 phases).
- **`WORKFLOW-CORE.md`** — the shared per-unit build+verify loop both call.

You never run these files directly. You **paste an issue** into Claude Code;
Claude detects its shape, opens the matching workflow, and follows it
step-by-step. The workflow files are the source of truth — if they ever
disagree with `CLAUDE.md`, the workflow wins.

## Common commands

Four slash commands cover the commands you'll reach for most, each matched to
a different point in an issue's lifecycle:

| Command | When to use it |
|---|---|
| `/issue <N>` | Start a **fresh issue**. Fetches issue `<N>` (and its comment thread), detects whether it's a component or a page, and runs the matching workflow end-to-end. |
| `/pr <N>` | Work an **existing PR**. Most commonly: the PR has review feedback — reads the inline review comments and top-level comments, then fixes the existing branch in place (it can also pick up and continue an AI-authored PR). |
| `/pr-review <N>` | **Cross-review a teammate's PR.** Builds a Figma-vs-live evidence pack (screenshots + pixel diffs) and drafts a first-person review — read-only on the partner's branch; it never edits or auto-posts. |
| `/verify-feedback <finding>` | The final **human-check** step on a built unit. Describe what looks off (e.g. "gap under SectionMv is too tall"); it triages the finding as a real bug or a tooling/design false positive, then fixes only real bugs. Paste a screenshot straight into the CLI with `Ctrl+V` to hand it evidence for the finding. |

## How Claude picks the workflow

Routing is by the fields in the issue you paste (or that `/issue <N>` fetches):

| Issue contains | Workflow | Builds |
|---|---|---|
| `COMPONENT_NAME：…` / `COMPONENT_CATEGORY：…` | `WORKFLOW-COMPONENT.md` | one component triple (`.tsx` / `.scss` / `.stories.tsx`) |
| `PAGE_PATH：…` / `PAGE_TITLE：…`, or the `page` label | `WORKFLOW-PAGE.md` | a full URL under `src/pages/` (HTML + SSR TSX + page CSS + N sections) |

If a required field is missing or a Figma URL is unreachable, Claude stops and
asks — it will not guess the issue number, name, category, or breakpoint.

### Kicking one off

Two equivalent ways to start:

- **Paste the intake block** directly into the chat. Component shape:

  ```
  作成するコンポーネント情報
  ISSUE_NUMBER：251
  FIGMA_URL_PC：<figma url with node-id for PC>
  FIGMA_URL_SP：<figma url with node-id for SP>
  COMPONENT_NAME：HeadingLevel2SizeM
  COMPONENT_CATEGORY：Heading
  ```

  Page shape:

  ```
  作成するページ情報
  PAGE_PATH：/train/station/kana/index.html
  PAGE_TITLE：駅名から探す（あ行）
  PAGE_DESCRIPTION：…
  テンプレート名：サービスサイト汎用テンプレート
  FIGMA_URL_PC：…
  FIGMA_URL_SP：…
  親カテゴリ Issue: #<parent>
  統合ブランチ：copilot/develop-<N>
  ```

- **Run `/issue <N>`** — the installed slash command fetches issue `<N>` and
  injects the intake for you.

Claude's **first action** is always to read the matching workflow file, before
fetching Figma or touching any source.

## `WORKFLOW-COMPONENT.md` — the 14 steps

The end-to-end path for one component. Steps 1–5 are planning/approval gates;
6–10 build; 11–14 verify and hand off.

1. **Intake** — parse the five fields, read the full issue thread (comments can
   revise the spec), create the manifest.
2. **Fetch Figma** — desktop MCP fetch at both breakpoints, build the structured CSS
   table (CORE §2).
3. **Design summary** *(checkpoint)* — post the CSS table + tokens + the
   sub-component names Figma uses, so misreads are caught before code.
4. **Read neighbors** — match sibling conventions; run the redundancy check
   (extend vs. scaffold vs. refactor is the user's call).
5. **Propose props + generator type** *(gate)* — wait for approval.
6. **Worktree + branch** — `scripts/worktree-add.sh <N>` → `lab-develop-#<N>`.
7. **Scaffold** — `pnpm plop`, names passed verbatim.
8. **Implement TSX** (CORE §4) — compose existing primitives by exact Figma name.
9. **Implement SCSS** (CORE §5) — tokens by name, both breakpoints independent.
10. **Storybook story** (CORE §6) — CSF3 on a per-issue port.
11. **Verify** — Claude-side visual/CSS diff (CORE §7–§8), then the
    **user parity gate** at PC *and* SP.
12. **Commit** — one commit, Conventional Commits, ends `#<N>`, gates passed.
13. **Hand-off** — report; open a PR only when asked.
14. **Cleanup** — tear down the worktree after merge.

There's a **fast-path** (skip 3 + 5) for a ≤30-line, single-file, pure
style/token/copy fix, and a **large-component dispatch rule** that decomposes
big components spatially (independent sub-parts) or by state-matrix (panels a
controller toggles — each open state × breakpoint is its own Figma frame).

An alternative entry adapts the 14 steps for **continuing an AI-generated PR**
(verify against Figma fresh, fix drift, hand back) instead of a fresh issue.

## `WORKFLOW-PAGE.md` — the 7 phases

A page is an **orchestrator** running the CORE loop many times over its
sections. Scope is **layout reproduction only** — markup + SCSS + images at
both breakpoints; text and images match Figma exactly, links may be dummy
(`href="#"`), and anything needing JS (tabs, accordion, modal, carousel) is
recorded and reported to the administrator, not built.

0. **Intake** — parse page fields; derive route, dirs, ports, and the
   **layout component** from テンプレート名 (`LayoutNorenGeneral` vs
   `LayoutDefault` — the most consequential decision).
1. **Figma recon (shallow)** — never deep-fetch a page root; enumerate sections
   at `--depth 2`, render full-page reference PNGs.
2. **Section inventory** *(gate)* — write every section to the manifest with its
   reuse decision and gaps (icons/images/primitives); one consolidated approval.
3. **Workspace** — worktree on the designated integration branch
   (`copilot/develop-<N>`).
4. **Page skeleton (first commit)** — `index.html` + `index.tsx` (wrapped in the
   chosen layout) + `Page*.scss` + `PAGE_ID`, so the route renders end-to-end.
5. **Per-section loop (the core)** — run CORE once per section, top-to-bottom;
   deep-fetch → CSS table → build → per-section visual-diff → mark `verified` →
   commit. Independent page-local sections may build in parallel, but
   **verify serially** and **all shared-component edits stay on the orchestrator**.
6. **Page assembly verification** — deterministic geometry diff of section
   positions, a coarse full-page vision pass, page-level a11y (one `<h1>`, no
   skipped headings), the quality gate, and the user parity gate.
7. **Hand-off / PR** — plus the mandatory **Layout-Reproduction-Complete report**
   listing every deferred-JS / spec-unclear point for the administrator.

## `WORKFLOW-CORE.md` — the shared unit loop

Both workflows delegate the actual "build and verify one thing against Figma"
work here, so a component and a page section follow the identical procedure:

- **§2 Fetch + CSS table** — desktop MCP fetch both breakpoints; transcribe sizing,
  padding, gap, auto-layout mode, radius, fills/strokes, typography and color
  **style names**, sub-component instance names, and icons into a table. A
  closing adversarial spec audit runs before any code.
- **§3 Neighbors + redundancy + missing-dependency** — read siblings, decide
  reuse, confirm nothing is missing on `main`.
- **§4 TSX / §5 SCSS** — the coding sections, including how to handle the
  **intermediate width bands** (768 / 1080 / 1440 / 1599) that Figma never
  designs.
- **§6 Story** — Storybook on a per-issue port.
- **§7 Stage-1 verification** — dispatch the `visual-diff` subagent (pixel diff +
  live Playwright measurement) at both breakpoints.
- **§8 Pre-commit gate** — lint / stylelint / build must pass.
- **§9 Common drift / landmines** — the catalogue of recurring failure modes to
  re-read before verifying.

## The guardrails that bind every issue

These hold across both workflows and fail review even when the render looks
right — several are enforced by PreToolUse hooks that **deny** the violating
tool call:

- **Never fabricate missing infrastructure.** If an icon, primitive, mixin,
  alias, or asset isn't on `main`, Claude stops and reports the gap rather than
  inventing it.
- **Figma is the source of truth** — every value maps to a codebase token by
  name; no raw values, no "close enough." Verified at **both PC and SP**.
- **Figma is a *moving* source of truth** — if the node changed since the spec
  was captured, Claude stops and asks rather than silently re-syncing.
- **Composition & spacing rules** — inner width comes from `BlockContentInner`
  (no `_inner` class); a genuinely new design component becomes a **shared**
  component (never fabricated); shared components are fixed additively (new
  optional prop, default unchanged); inter-component spacing comes from each
  component's own margins, never page-level `gap` / `margin-top`.
- **Remote actions require explicit confirmation** — a guard hook prompts before
  any `git commit` / `git push` / `gh` write.

Visual parity in Storybook (component) or the dev SSR server (page) against
Figma at both breakpoints is the success criterion. Lint passing is necessary
but never sufficient.
