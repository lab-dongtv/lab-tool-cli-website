---
sidebar_position: 5
---

# Commands

Two layers: the **`aqua-cli` CLI** (installs and updates the kit itself) and
the **`/aqua-cli-*` slash commands** inside Claude Code (run the workflow).

## CLI

| Command | When | What it does |
|---|---|---|
| `aqua-cli init` | once per project | copies the kit, merges `.mcp.json` / `.env.local` / `.gitignore` / `CLAUDE.md`, writes the `.aqua-cli.json` manifest |
| `aqua-cli update` | after a kit release | refreshes kit files to the bundled version (never touches project-owned `RULES.md` / `cpdk.config.json`); warns when your global install is older than the registry |
| `aqua-cli uninstall` | leaving the workflow | removes exactly what the manifest recorded |
| `aqua-cli completion` | optional | shell tab-completion |

Details: [CLI Usage](./cli-usage.md).

## Slash commands (Claude Code)

### `/aqua-cli-init` — onboard or refresh the project

- **When:** once after `aqua-cli init`, and again after every `RULES.md` edit.
- **How it works:** clones the source if the folder is an empty wrapper →
  explores the codebase → interviews you for the gaps → writes
  `cpdk.config.json`, `RULES.md`, and the build card → verifies the wiring
  (paths, commands, Figma token) with a pass/fail checklist.
- **Value:** every later command trusts these three files — good onboarding
  is what makes the parallel builders follow *your* conventions.

### `/aqua-cli-create-issue` — author a work item

- **When:** you have a Figma design that needs building and no GitHub issue yet.
- **How it works:** asks for each intake field (component name/category, or
  page path/title + Figma URLs), previews the issue, creates it on GitHub.
- **Value:** issues in the exact shape `/aqua-cli-issue` parses — no
  back-and-forth about missing fields at build time.

### `/aqua-cli-issue <number-or-URL>` — build it

- **When:** the main command — any component or page issue.
- **How it works:** four phases. **Intake** (one sitting: section inventory +
  reuse decisions confirmed, Figma reference PNGs exported); **Build**
  (parallel builder agents, each self-correcting against a deterministic
  pixel diff, max 3 rounds); **Assemble** (page composition, link wiring,
  automated convention check); **Review** (one sitting: the
  `evidence.html` pack — Figma vs render per section with scores — then
  commit, PR, hand-off report).
- **Value:** ~30 minutes of agent time for a typical page with exactly two
  human sittings, and machine evidence — not eyeballing — behind every
  section.

### `/aqua-cli-pr <number-or-URL>` — apply review feedback

- **When:** a reviewer left comments on the PR.
- **How it works:** fetches the review (including inline file/line comments),
  classifies each item — convention fix (just fixes it), structural change
  (fixes + notes it in the PR), or **doctrine conflict** (the reviewer
  contradicts RULES.md → stops, asks you, updates RULES.md first) —
  re-converges the touched sections, lands ONE new commit on top, and
  replies to the reviewer point by point.
- **Value:** review rounds stop being manual copy-paste sessions, and
  reviewer knowledge compounds into the rulebook.

### `/aqua-cli-verify <finding in your own words>` — triage one finding

- **When:** something looks off to you ("the gap under the hero is too
  tall") and you want measurement, not opinion.
- **How it works:** measures the exact Figma node value vs the live element,
  then issues one verdict: **real bug** (fixes it with the Figma-derived
  value and re-converges), **tooling false positive** (wrong overlay
  scale/viewport — explained with numbers), or **design-source false
  positive** (code matches spec; matching the mock's pixels would break a
  named rule — a claim it must prove two ways).
- **Value:** no finding gets dismissed by eye, and no correct code gets
  "fixed" into breaking a design rule.

## Typical lifecycle

```
aqua-cli init  →  /aqua-cli-init  →  /aqua-cli-create-issue
   →  /aqua-cli-issue N  →  (review comments?)  /aqua-cli-pr N
   →  (disputed finding?)  /aqua-cli-verify "..."
```
