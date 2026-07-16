# Changelog

All notable changes to `@aquaring/aqua-cli` are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/), and the project
adheres to [Semantic Versioning](https://semver.org/).

## [0.5.1] — 2026-07-16

### Changed

- **Renamed the CLI and package** — command `cpdk` → `aqua-cli`; package
  `@aquaringlab/cpdk` → `@aquaring/aqua-cli`; home repo → `aquaring/aqua-ai-develop-kit`.
  This is a **clean break**: every on-disk artifact was renamed
  (`.cpdk.json` → `.aqua-cli.json`, the `CLAUDE.md` markers `<!-- cpdk:start/end -->`
  → `<!-- aqua-cli:start/end -->`, the `.gitignore` comment, and the shell-completion
  markers/functions). Projects initialized with the old `cpdk` are **not migrated** —
  run the old `cpdk uninstall`, then `aqua-cli init`.
- Setup docs now install the CLI with `npm install -g @aquaring/aqua-cli`
  followed by `aqua-cli init`, instead of `npx @aquaring/aqua-cli init`.

### Fixed

- Generated manifest excludes `.DS_Store`.

## [0.5.0] — 2026-07-16

### Added

- **`cpdk update` staleness warning** — `update` only re-applies the payload
  bundled in the installed CLI, so a stale global install silently kept
  re-applying an old kit. Before the confirm prompt, `update` now queries the
  registry for the latest version (`npm view`, reusing the user's `~/.npmrc`
  auth) and, when newer, prints the `npm install -g @aquaringlab/cpdk@latest`
  upgrade hint. Best-effort: offline / unauthenticated / timeout skip the
  check silently.

### Changed

- Skills restructured from flat files to directory format
  (`.claude/skills/<name>/SKILL.md`) so they can carry supporting files.

## [0.4.0] — 2026-07-16

### Added

- **`/make-release` skill** (`.claude/skills/make-release.md`) — the release
  procedure as an invocable skill: bump inference from Conventional Commits,
  the local gate, version/changelog/tag choreography, and the
  GitHub-Packages-via-tag-push publishing model.
- **`/update-docs` skill** (`.claude/skills/update-docs.md`) — keeps
  `README.md`, the Docusaurus site under `website/`, and `CHANGELOG.md` in
  sync with code changes: a change→docs mapping table, the `sidebars.ts`
  registration rule, and a mandatory site build before reporting done.

## [0.3.0] — 2026-07-15

### Added

- **`.claude/agents/html-spec-builder.md`** — agent-driven spec generation as
  the PRIMARY WORKFLOW-CORE §2 path: one agent per unit authors `spec.html`
  directly from the Figma MCP data tools (`get_design_context` +
  `get_metadata`) under embedded fidelity rules (values only from data,
  load-bearing structure preserved, position from coordinates, exporter-trap
  reversal — e.g. stale `gap` next to `justify-between` deleted). Emits the
  same spec.html contract the transpiler did (dual `[data-breakpoint]`
  subtrees, `data-design-width/height`, `data-node-id`/`data-name`/
  `data-component`, CAVEATS header). Gate fix rounds re-dispatch the builder
  with the gate JSON; trust anchors are unchanged (`spec-gate.mjs` + user
  approval — see `docs/superpowers/specs/2026-07-15-agent-spec-builder-design.md`).
- **`scripts/figma-asset.mjs`** — host-validated single-asset downloader from
  the desktop MCP asset server (the builder's asset path).
- **`scripts/spec-batch.mjs`** — one-command Phase-5 spec batch, now in three
  modes: `--prepare` (reference exports only, before the builder wave),
  `--gate` (spec-gate existing specs vs the prepared refs), `--transpile`
  (the legacy full `figma-html.mjs` sequence, kept as the fallback path).
  Writes a per-unit summary (`figma-refs/<N>/spec-batch.json`). Skips units
  already user-approved / implemented / verified unless `--force`.
- **`scripts/page-parity.mjs`** — one-pass Phase-6 assembly parity: the
  unit-parity check for every section of the assembled page in a single
  browser session, from a units JSON (selector + `.gate` refs per section).
- **`scripts/content-parity.mjs`** — deterministic DOM-content diff of a built
  section vs its approved spec.html per breakpoint: missing/altered text lines
  (line breaks included), dropped repeated items, `<img>` count deltas — the
  #662-rebuild defect classes SSIM localizes but doesn't name. Runs beside
  `unit-parity.mjs` in the CORE §7 default path; `manifest-update.mjs` now
  also requires its verdict (`contentParity`, MISMATCH needs a
  `contentWaiver`) before `set-status implemented`.
- **`scripts/lib/band-elements.mjs`** — flagged diff bands are now mapped to
  the DOM elements occupying them (`flaggedBandElements` in the gate JSON of
  `spec-gate.mjs` / `unit-parity.mjs` / `page-parity.mjs`): per band, the
  `data-node-id`/`data-name`/class elements intersecting its y-range. A
  locator for the correction loop — the corrector gets "band 7 =
  `.eventsList` (node 5029:7231)" instead of a bare band index + heatmap.

### Changed

- **Spec generation trust root revised** (WORKFLOW-CORE §2, WORKFLOW-PAGE
  Phase 5): the `html-spec-builder` agent is the primary generator;
  `figma-html.mjs` + `html-spec-corrector` narrow to the documented fallback
  path (the corrector never touches agent-built specs — their fix rounds
  re-consult Figma data via the builder). `scripts/hooks/gate-html-spec.sh`
  deny message updated; hook logic unchanged. **Breaking:** a bare
  `spec-batch.mjs` invocation (no mode flag) now exits 2 — use `--transpile`
  for the old behavior; `spec-batch.json` rows record `untranspiled` as a
  single number instead of `{pc, sp}`.
- `scripts/manifest-update.mjs` — `set-status <unit> implemented` is now
  evidence-gated like `verified`: it refuses unless the unit's `-verify.json`
  records the CORE §7 machine-parity run (`unitParity`, or a `parityWaiver`
  ≥30 chars for a waived BLANK/STRUCTURAL; legacy tool records and
  `<unitId>-css.md` units pass). Closes the hole the #662 rebuild shipped
  through (8 sections at SSIM 0.20–0.86, zero parity records).
- `scripts/lib/figma-mcp.mjs` — transient MCP failures (network error, 429,
  5xx) now retry with backoff (1 s / 4 s) before the hard exit.
- `scripts/figma-html.mjs` — spec asset downloads run 4-wide instead of serial.
- `WORKFLOW-PAGE.md` — Phase 5 spec batch and Phase 6 machine parity now point
  at the batch scripts; new **Pace budgets** section (≤1 h agent-time target
  per page, per-phase targets, fidelity-outranks-pace rule); **parallel-first
  build default** — once the spec batch is approved, all fan-out-eligible
  (page-local) sections dispatch as one subagent wave; inline is the fallback,
  and the shared-code serialization / serial-verify rules are unchanged.
- `WORKFLOW-CORE.md` — §7: SOFT parity verdicts require per-band attribution
  (unattributed SOFT = STRUCTURAL) and the recorded `global_ssim ≥ 0.95` bar;
  §8: gate output must be verifiably real tool output (`rtk proxy` /direct
  binary re-run on suspicion — the #655 faked-gate incident).

### Fixed

- Payload hygiene: `.claude/settings.local.json` (user-local permissions) and
  `scripts/__pycache__/` (Python bytecode) are now excluded from the copy
  payload / `.cpdk.map.json` (they were gitignored but visible to disk walks).

## [0.2.0] — 2026-07-11

### Added

- **`RULES.md`** — the project rulebook, extracted from `CLAUDE.md`, now
  shipped alongside the `WORKFLOW-*.md` playbooks and injected into every
  session via a new `scripts/hooks/inject-rules.sh` SessionStart hook.
- **`/create-issue` command** — authors component/page issues from the live
  template.
- **`.cpdk.map.json`** — a generated, full listing of every file cpdk ships
  (directories expanded to individual files), for auditing the scaffold
  surface without reading `src/payload.ts`. Regenerate with `npm run map`
  (`scripts/dev/generate-cpdk-map.mjs`, dev-only, excluded from the shipped
  payload).

### Changed

- `CLAUDE.md` trimmed to just the Behavioral Guidelines; project-specific
  doctrine now lives in `RULES.md`.
- Workflow docs: flag PC/SP display divergence as a designer question
  (critical rule 6), Phase 6.5 link-URL assignment from `site-map.json`
  (client §10), one-commit-per-session squash policy + pre-commit image
  cleanup.

## [0.1.0] — 2026-07-10

Initial release. Everything below is the first cut of the tool.

### Added

- **`cpdk init [--force]`** — installs the workflow kit into the current
  project: copies `.claude/`, `scripts/`, `development-docs/`, `PROMPT.md`, and
  the `WORKFLOW-*.md` playbooks, runs the file merges, and writes the
  `.cpdk.json` manifest. `--force` overwrites existing files and skips the
  re-init prompt (without it, existing paths are left untouched).
- **`cpdk update`** — re-copies the payload and re-applies every merge
  idempotently, then bumps `cliVersion` / `installedAt` in the manifest.
- **`cpdk uninstall [--force]`** — reverts exactly what was installed, using the
  manifest: removes copied paths, strips the `CLAUDE.md` block, drops
  cpdk-added `.mcp.json` servers, removes the placeholder `.env.local` key,
  removes the `.gitignore` entry it added, and deletes `.cpdk.json` last.
- **`cpdk completion [shell]`** — outputs a `bash` or `zsh` completion script
  (shell auto-detected from `$SHELL` when omitted); completes the subcommands
  and the `--force` flag. No runtime dependencies.
- **Four reversible, idempotent merge engines:**
  - `CLAUDE.md` — appends the shipped content inside a
    `<!-- cpdk:start -->` … `<!-- cpdk:end -->` marker block; replaces in place
    on update, never double-appends.
  - `.mcp.json` — merges `mcpServers` and tracks the keys it added; uninstall
    removes only those, and a user's same-named server is preserved.
  - `.env.local` — appends `FIGMA_API_TOKEN` only when absent; uninstall removes the
    line **only** if the value is still the `figd_replace_me` placeholder, so a
    real token is never destroyed.
  - `.gitignore` — ensures `.env.local` is ignored (creates the file if absent),
    keeping the Figma token out of git; uninstall removes only the entry it
    added and deletes the file only if it created it and nothing else remains.
- **`.cpdk.json` manifest** — records the installed version, copied paths, and
  the exact merge additions, making `update` and `uninstall` precise.
- **Docusaurus documentation site** (`website/`) — Intro, Setup, CLI Usage,
  What gets installed, Using the workflows, Internals, and this changelog.

### Notes

- Payload documentation ships under `development-docs/` (renamed from `docs/`
  during development to avoid clashing with the dev-only `docs/superpowers/`
  artifacts, which are never published).
- Single-target by design: Claude Code only, installed as one cohesive kit
  (no per-component pick-list).
