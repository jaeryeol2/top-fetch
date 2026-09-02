# Claude Code Guidelines - top-fetch

See [@AGENTS.md](file:///C:/vscode/repository/top-fetch/AGENTS.md) for full project domain knowledge, core principles, and architecture rules.

## Quick Commands
- `npm run build` : tsdown bundle build (ESM/CJS/IIFE/DTS)
- `npm test` : Run the Vitest harness (8 target environments + dynamic fuzzing)
- `npm run typecheck` : `tsc --noEmit`
- `npm run lint` : ESLint check (`src`, `tests`)

## Rules
@rules/top-fetch-core.md
@rules/coding-standards.md
@rules/harness-engineering.md

## Skills (`.claude/skills/`)
Auto-discovered native Claude Code skills:
- `top-fetch-harness`: A runbook for dynamic/varied scenario testing and Fail & Fix History documentation across the 8 target environments (Vue3/Nuxt3/React18-19/Next.js App Router/NestJS/JSP-legacy/server template engines/bundle integrity).
