---
sidebar_position: 4
---

# What gets installed

| Target | Mode | Purpose |
|---|---|---|
| `.claude/` | copy | Slash commands (`/issue`, `/pr`, …), agents, settings, guard hooks |
| `scripts/` | copy | Figma fetch, visual/geometry diff, manifest updater, hooks |
| `development-docs/` | copy | PR-body templates, manifest schema, WCAG skill |
| `PROMPT.md`, `WORKFLOW-*.md` | copy | The component/page/core workflow playbooks |
| `CLAUDE.md` | merge | Project rules appended in an `aqua-cli` marker block |
| `.mcp.json` | merge | Playwright + Figma (desktop) MCP servers |
| `.env.local` | merge | `FIGMA_MCP_URL` |
| `.gitignore` | merge | ensures `.env.local` is ignored |

The workflow itself — issue intake, Figma fetch, section decomposition,
per-unit build/verify at PC + SP breakpoints — is documented inside the
installed `WORKFLOW-COMPONENT.md`, `WORKFLOW-PAGE.md`, and `WORKFLOW-CORE.md`.
