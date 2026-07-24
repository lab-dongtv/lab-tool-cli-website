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
| **A Figma personal access token** | the workflow reads designs via the Figma REST API | Figma → Settings → Personal access tokens |

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

## Step 2 — Create a Figma personal access token

The workflow's fetch scripts read designs through the **Figma REST API**.

1. In Figma: *Settings → Security → Personal access tokens → Generate new token*.
2. Scopes (read-only): **File content** (required), **Current user**
   (recommended — the SessionStart hook probes `/v1/me`), **Variables**
   (recommended — some design systems use Figma Variables).
3. Keep the token handy for Step 4 — it goes in `.env.local`, never in git.

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
  adds the Playwright server to `.mcp.json`, adds
  `FIGMA_API_TOKEN` to `.env.local`, and ensures `.env.local` is listed in
  `.gitignore` (creating the file if needed).
- **Writes** a `.aqua-cli.json` manifest recording exactly what it added.

Existing files are left untouched unless you pass `--force`. See
[CLI Usage](./cli-usage.md) for `--force`, `update`, and `uninstall`.

## Step 4 — Put your token in `.env.local`

`init` created (or appended to) **`.env.local`** with a placeholder:

```
FIGMA_API_TOKEN=figd_replace_me
```

- Replace the placeholder with the token from Step 2.
- The Figma scripts read from **`.env.local`** specifically — not `.env` —
  (a `FIGMA_API_TOKEN` environment variable also works and takes precedence).
- `.env.local` stays in `.gitignore` (added by `init`). Confirm with
  `git check-ignore .env.local` (it should echo the path).

## Step 5 — Open in Claude Code and confirm the wiring

1. Open the project in **Claude Code**. It picks up the merged `.mcp.json`, which
   registers the **Playwright MCP** server used for live measurement during
   verification (installed on demand via `npx` — no separate install step).
2. Sanity-check the install:

   ```bash
   cat .aqua-cli.json          # manifest of what aqua-cli added
   ls .claude scripts development-docs
   ```

3. Confirm the token works. A SessionStart hook probes `/v1/me` automatically;
   if a fetch reports a 401/403, re-check Steps 2 and 4 (token valid, scopes,
   design file open).

You're ready — paste a component or page issue and Claude will route to the
matching workflow. See [Using the workflows](./using-workflows.md).

## Step 6 — Run `/aqua-cli-init`

In the Claude Code session, run `/aqua-cli-init`. It explores the project,
derives `cpdk.config.json`, interviews you for what it can't infer, fills
`RULES.md` from the shipped template, and verifies the wiring. Until it
runs, the path-aware gates warn instead of enforcing.

## Step 7 (optional) — Shell completion

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
| `Figma API 401/403` during a fetch | `FIGMA_API_TOKEN` missing, expired, or lacking the File-content scope (Steps 2/4). |
| Figma fetch says no document for node | Wrong `fileKey`, node deleted, or the node-id used dash form — use the colon form (`123:456`). |
| Re-running `init` warns about existing files | Expected — `init` won't overwrite without `--force`. Use [`update`](./cli-usage.md) to refresh instead. |
