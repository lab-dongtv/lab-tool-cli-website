---
sidebar_position: 7
---

# What gets installed

| Target | Mode | Purpose |
|---|---|---|
| `.claude/` | copy | Slash commands (`/aqua-cli-issue`, `/aqua-cli-create-issue`, …), agents, settings, guard hooks |
| `scripts/` | copy | Figma fetch, visual/geometry diff, manifest updater, hooks |
| `development-docs/` | copy | PR-body templates, manifest schema, WCAG skill |
| `PROMPT.md`, `WORKFLOW.md` | copy | The auto-convergence workflow playbook |
| `CLAUDE.md` | merge | Project rules appended in a `cpdk` marker block |
| `.mcp.json` | merge | Playwright + Figma (desktop) MCP servers |
| `.env.local` | merge | `FIGMA_API_TOKEN` |
| `.gitignore` | merge | ensures `.env.local` is ignored |

The workflow itself — issue intake, Figma fetch, section decomposition,
parallel per-unit build with automated convergence at PC + SP breakpoints, and
the evidence-pack review — is documented inside the installed `WORKFLOW.md`.
