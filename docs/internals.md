---
sidebar_position: 6
---

# Internals

## Payload manifest

`src/payload.ts` declares every installed entry and its mode
(`copy` / `merge-claudemd` / `merge-mcp` / `merge-env`). One list drives
install, update, and uninstall.

## Merge engines (idempotent + reversible)

- **CLAUDE.md** — content wrapped in `<!-- aqua-cli:start -->` … `<!-- aqua-cli:end -->`.
  Re-apply replaces the block; uninstall strips only that block.
- **.mcp.json** — deep-merge of `mcpServers`; the manifest records which server
  keys aqua-cli added so uninstall removes only those.
- **.env.local** — appends `FIGMA_MCP_URL` only if absent; uninstall removes the
  line only when it still holds the default `http://127.0.0.1:3845/mcp` value.
- **.gitignore** — ensures `.env.local` is ignored (creates the file if absent);
  the manifest records whether aqua-cli added the line and whether it created the
  file, so uninstall removes only its own line and deletes the file only if it
  created it and nothing else remains.

## Manifest — `.aqua-cli.json`

Records `cliVersion`, `installedAt`, the `copied` paths, and each merge's
tracking data. `update` and `uninstall` read it so they act precisely, never
by guesswork.
