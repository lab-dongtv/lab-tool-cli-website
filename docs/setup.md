---
sidebar_position: 2
---

# Setup

This guide takes you from nothing to a project wired for the aqua-cli
Figma→code workflow. Follow the steps in order.

## Prerequisites

| Requirement | Why | Check |
|---|---|---|
| **Node.js ≥ 24** | aqua-cli and its tooling target Node 24 | `node -v` |
| **npm** | runs `npx` and reads your registry auth | `npm -v` |
| **Claude Code** | the workflow runs inside it | `claude --version` |
| **A GitHub account with access to the `@aquaring` packages** | aqua-cli is published privately to GitHub Packages | — |
| **The Figma desktop app** | the workflow reads designs via the Figma desktop MCP server (no API key) | the app opens and you can log in |

## Step 1 — Authenticate to GitHub Packages

aqua-cli is published to **GitHub Packages** (a private, scoped registry), not the
public npm registry. Installing it needs both a registry mapping **and** an auth
token — the registry line alone returns `401`.

1. Create a GitHub **Personal Access Token (classic)** with the
   **`read:packages`** scope: GitHub → *Settings → Developer settings →
   Personal access tokens → Tokens (classic) → Generate new token*.
2. Add both lines to your **user** `~/.npmrc` (keeps the token off the project):

   ```
   @aquaring:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
   ```

3. Verify auth works:

   ```bash
   npm view @aquaring/aqua-cli version
   ```

   A version number means you're authenticated. A `401`/`403` means the token
   is missing, expired, or lacks `read:packages`.

## Step 2 — Enable the Figma desktop MCP server

The workflow's fetch scripts read designs through the **Figma desktop app's
local MCP server** — no API key or personal access token is needed.

1. Install and open the **Figma desktop app** (not the browser) and log in.
2. Enable *Figma → Preferences → "Enable local MCP Server"*. The server
   listens at `http://127.0.0.1:3845/mcp`.
3. Open the design file you'll be building from. The MCP server only sees the
   **currently open file** — keep it open while working.

## Step 3 — Install the kit into your project

Install the CLI globally, then run `init` from the root of the project you
want to set up:

```bash
npm install -g @aquaring/aqua-cli
aqua-cli init
```

`init` copies the workflow kit and merges into your shared files:

- **Copies:** `.claude/`, `scripts/`, `development-docs/`, `PROMPT.md`, and the
  `WORKFLOW-*.md` playbooks.
- **Merges (idempotent, reversible):** appends a marked block to `CLAUDE.md`,
  adds the Playwright and Figma (desktop MCP) servers to `.mcp.json`, adds
  `FIGMA_MCP_URL` to `.env.local`, and ensures `.env.local` is listed in
  `.gitignore` (creating the file if needed).
- **Writes** a `.aqua-cli.json` manifest recording exactly what it added.

Existing files are left untouched unless you pass `--force`. See
[CLI Usage](./cli-usage.md) for `--force`, `update`, and `uninstall`.

## Step 4 — Confirm the MCP endpoint (usually nothing to do)

`init` created (or appended to) **`.env.local`** with the standard desktop MCP
endpoint:

```
FIGMA_MCP_URL=http://127.0.0.1:3845/mcp
```

- The default is correct for a normal Figma desktop install — only change it
  if your desktop app serves MCP elsewhere.
- The Figma scripts read from **`.env.local`** specifically — not `.env` — and
  fall back to the default endpoint when the variable is absent.
- `.env.local` stays in `.gitignore` (added by `init`). Confirm with
  `git check-ignore .env.local` (it should echo the path).

## Step 5 — Open in Claude Code and confirm the wiring

1. Open the project in **Claude Code**. It picks up the merged `.mcp.json`, which
   registers the **Playwright MCP** server used for live measurement during
   verification (installed on demand via `npx` — no separate install step) and
   the **Figma MCP** server (the desktop app's local endpoint).
2. Sanity-check the install:

   ```bash
   cat .aqua-cli.json          # manifest of what aqua-cli added
   ls .claude scripts development-docs
   ```

3. Confirm the Figma desktop MCP server answers. A SessionStart hook probes it
   automatically; if a fetch reports `Cannot reach the Figma desktop MCP
   server`, re-check Step 2 (desktop app running, local MCP server enabled,
   design file open).

You're ready — paste a component or page issue and Claude will route to the
matching workflow. See [Using the workflows](./using-workflows.md).

## Step 6 (optional) — Shell completion

Enable tab-completion for the `aqua-cli` command:

```bash
# zsh
echo 'eval "$(aqua-cli completion zsh)"' >> ~/.zshrc && source ~/.zshrc

# bash
echo 'eval "$(aqua-cli completion bash)"' >> ~/.bashrc && source ~/.bashrc
```

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `npm install -g @aquaring/aqua-cli` → `401`/`403` | GitHub Packages auth — recheck Step 1 (`read:packages` token in `~/.npmrc`). |
| `Cannot reach the Figma desktop MCP server` during a fetch | The desktop app isn't running, or *Enable local MCP Server* is off (Step 2). |
| Figma fetch says `No node could be found` | The design file containing that node isn't the one open in the desktop app — open the right file and retry. |
| Re-running `init` warns about existing files | Expected — `init` won't overwrite without `--force`. Use [`update`](./cli-usage.md) to refresh instead. |
