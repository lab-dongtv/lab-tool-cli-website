---
sidebar_position: 3
---

# Your first project

You've finished [First-time setup](./setup.md) (CLI installed, Figma token
ready). This walkthrough takes an empty or existing project to its first
built component.

## 1. Install the kit

```bash
cd /path/to/your-project     # the project repo, or an empty wrapper folder
aqua-cli init
```

This copies the workflow kit (`.claude/` commands + agents, `scripts/`,
`WORKFLOW.md`, `RULES.md` from the template) and wires `.mcp.json`,
`.env.local`, and `.gitignore`. Put your Figma token in `.env.local`:

```
FIGMA_API_TOKEN=figd_...
```

## 2. Onboard the project — `/aqua-cli-init`

Open the folder in **Claude Code** and run `/aqua-cli-init`. It will:

- **Clone the source for you** if you started from an empty wrapper folder —
  it asks for the repository URL and clones it into a subfolder.
- **Explore before asking**: derives the build commands, folder layout, and
  CSS conventions from the code, then interviews you only for what it
  couldn't infer.
- **Write three artifacts**: `cpdk.config.json` (project facts),
  `RULES.md` (the project rulebook — see [Project rules](./project-rules.md)),
  and `development-docs/build-card.md` (the ≤3KB digest builder agents carry).

Commit what it generated. Also run `/hooks` once in this first session and
approve the kit's hooks — they enforce the commit/attribution/asset gates.

One-time extras the verification stack needs at the kit root:

```bash
npm init -y && npm i playwright && npx playwright install chromium
```

## 3. Build your first issue

Create a work item with `/aqua-cli-create-issue` (or use an existing GitHub
issue), then:

```
/aqua-cli-issue <number>
```

You sit down exactly **twice**:

1. **Intake** — confirm the section inventory and component-reuse decisions
   in one sitting. Builders then fan out in parallel, each self-correcting
   against a pixel diff of the Figma reference (up to 3 rounds) — you don't
   watch this part.
2. **Review** — open `figma-refs/<N>/evidence.html`: Figma vs render side by
   side per section with similarity scores. Your feedback dispatches fix
   agents; then the workflow commits, opens the PR, and posts the hand-off
   report.

**Tips for the first run:** pick a small 2–3 section page or a single
component; treat an `UNCONVERGED` badge as "look at the heatmap," not
"failure" — if known-good sections score below the 0.90 threshold, calibrate
`verification.convergeThreshold` instead of chasing the code.

## What's next

- Reviewer left comments on the PR? → `/aqua-cli-pr <number>`
- One finding looks wrong to you? → `/aqua-cli-verify <describe it>`
- Full command list → [Commands](./commands.md)
