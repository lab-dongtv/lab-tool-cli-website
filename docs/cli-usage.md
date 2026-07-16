---
sidebar_position: 3
---

# CLI Usage

## `aqua-cli init [--force]`

Installs the workflow kit into the current directory: copies `.claude/`,
`scripts/`, `development-docs/`, `PROMPT.md`, and the `WORKFLOW-*.md` files; appends a
marked block to `CLAUDE.md`; merges the Playwright and Figma (desktop MCP)
servers into `.mcp.json`; ensures `FIGMA_MCP_URL` exists in `.env.local`;
ensures `.env.local` is ignored in `.gitignore`; and writes the `.aqua-cli.json`
manifest. `--force` overwrites and skips the re-init prompt.

## `aqua-cli update`

Refreshes copied files and re-applies the merges to the bundled version.
Idempotent — the `CLAUDE.md` block is replaced in place, not duplicated.

## `aqua-cli uninstall [--force]`

Removes exactly what aqua-cli installed, using the manifest: copied paths, the
`CLAUDE.md` block, aqua-cli-added `.mcp.json` servers, the default
`FIGMA_MCP_URL` line, and the `.env.local` entry aqua-cli added to `.gitignore`.
A customized (edited) endpoint value is preserved.

## `aqua-cli completion [shell]`

Prints a shell completion script for `bash` or `zsh` (the shell is
auto-detected from `$SHELL` when omitted). Enable it by evaluating the output
from your shell rc file:

```bash
# bash
echo 'eval "$(aqua-cli completion bash)"' >> ~/.bashrc && source ~/.bashrc

# zsh
echo 'eval "$(aqua-cli completion zsh)"' >> ~/.zshrc && source ~/.zshrc
```

Completes the subcommands (`init`, `update`, `uninstall`, `completion`) and
the `--force` flag on `init` / `uninstall`.

