# dacan-admin

## Purpose
Web admin panel for the Rerokart e-commerce platform. Used to manage catalog, orders, and users. Consumes the REST API from `dacan-ecom-be`.

## Stack
- Language: TypeScript
- Framework: Next.js 16 (App Router) + React 19
- Styling: Tailwind CSS v4 + @tailwindcss/forms + @tailwindcss/postcss
- Data: TanStack Query v5 + axios
- Forms: react-hook-form + zod
- Charts / viz: ApexCharts, Recharts, FullCalendar, jvectormap
- Package manager: pnpm
- Deployment: {TODO — Vercel?}

## How to run
```bash
pnpm install
pnpm dev         # http://localhost:3000
```

## How to test
```bash
# {TODO — no test setup detected}
```

## Conventions
- Linter: ESLint (eslint-config-next 16) — see `eslint.config.mjs`
- Base template: derived from "free-nextjs-admin-dashboard" v2.2.2 — some upstream demo code likely still present
- Auth: cookie-based (js-cookie) — flows through backend JWT

## Key files
- `next.config.ts` — Next.js config
- `app/` — App Router pages (not yet inspected — expected)
- `docs/` — internal docs

## Gotchas
- Template-derived — audit all pages/components for demo data before shipping to production
- Bleeding-edge stack: Next 16 + React 19. `overrides` in package.json pin jvectormap for React 19 compat — do not remove without checking

## See also
- Workspace docs live in `../docs/` (index: `../docs/README.md`) — shared feature list, architecture, API specs, audits.
- `STATE.md` — current status and where I left off

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
