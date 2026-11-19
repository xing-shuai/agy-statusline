# agy-statusline

Custom single-line Antigravity CLI (`agy`) statusline with monochrome Unicode icons, Gemini / Argon / Claude (`3p`) quota monitoring, and actual context usage (`used/total`).

## Layout & Icon Legend

```text
✦ Gemini 4 Hydrogen (High) │ ◉ busy │ ❖ Default │ ◷ 61% │ ▦ 88% │ ✧ 100% │ ◇ 100% │ ◈ 100% │ ▤ 131.1k/1.0M
```

| Icon | Metric ID | Meaning |
|---|---|---|
| `✦` | `model-name` | Active AI model name |
| `◉` | `agent-state` | Agent state (`idle` / `busy` / `working`) |
| `❖` | `mode` | Running mode (`Default` / `Plan` / etc.) |
| `◷` | `quota` | Active model 5-hour remaining quota |
| `▦` | `quota-weekly` | Active model 7-day remaining quota |
| `✧` | `quota-argon` | Gemini 4 Argon remaining quota |
| `◇` | `quota-claude` | Claude (`3p`) 5-hour remaining quota |
| `◈` | `quota-claude-weekly` | Claude (`3p`) 7-day remaining quota |
| `▤` | `context-used` | Actual context used / total context window |

## Install / Migrate to a New Machine

Requires Node.js (`>= 18`):

```bash
git clone <your-repo-url>
cd agy-statusline
node install.mjs
```

`install.mjs` automatically:
1. Copies `statusline-quota.mjs` and `fetch-local-quota.mjs` to `~/.gemini/antigravity-cli/hooks/`.
2. Dynamically resolves the local `node` executable and hook paths for macOS / Linux / Windows.
3. Updates `~/.gemini/settings.json` and `~/.gemini/antigravity-cli/settings.json` while preserving all existing settings.
