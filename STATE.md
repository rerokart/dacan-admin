# dacan-admin — State

_Last updated: 2026-10-04_

## Done
- Next.js 16 + React 19 initialized from admin-dashboard template
- Tailwind CSS v4 configured
- TanStack Query + axios wired for data fetching
- react-hook-form + zod set up for forms
- Dashboard shell + several template pages present
- **Admin Access & RBAC (Phase 1, branch `feature/admin-rbac`, `3e18d45`)**: `AuthContext`/`usePermissions()` fed by `/auth/login` + `/auth/me` (M4 fix — `role` removed from `localStorage`); axios 401→logout / 403→toast+refetch (no logout); new public Forgot-password (3-step) and Accept-invitation pages; Settings → Admin Access screen (Admins / Roles & Permissions / Audit Log / Login History tabs); Profile page Active-sessions list + "Log out all devices"; `<Can>` gating + sidebar filtering + page-level 403 guard wired across every existing screen. Full detail: `docs/api/ADMIN.md`, `.claude/Arch/ARCHITECTURE_AD.md`.

- **Profile page cleanup (branch `feature/admin-profile`, 2026-09-27)**: fake template data removed.
  - The page now has a real header with an Edit name modal, read-only Account details and a Change password card, plus the existing Preferences and Active sessions cards.
  - Needs the backend `feature/admin-profile` branch.

- **Stage A bug sprint (branch `fix/stage-a`, off `main` b7bd950, head `6afe17c`, unmerged)**: POS posts to `pos/orders/offline` with cash/card/upi, receipt shows variant, amount paid and change, totals rounded to paise (B02); Inventory page and Dashboard low-stock widget wired to the real inventory list/overview and stock `adjustment` (B04, B05, B26); product delete shows the 409 "has orders" message (B08); banner move up/down reorder + link-format hint (B11); Cancel order sends a status update, "Refunded" removed, Cash/Card/UPI payment filters (B13, B16, B15); dashboard demo data replaced by `analytics/dashboard` + `analytics/sales` (B57); `pnpm build` now passes (B29, reviews rating filter typing). Needs backend `fix/stage-a`. Detail: `docs/BUGS.md`, `docs/SEQUENCE.md`.

## In Progress
- Stage A on `fix/stage-a` is complete and unmerged, awaiting user QA (checklist: `.claude/qa-report/2026-10-04-multi-stage-a-user-checklist.md`)

## Next Up
- Apply the backend migration `create_phase7_stage_a.sql` first (see `docs/MIGRATION.md`, "Phase 7"), then deploy backend, then this build, together with `feature/admin-rbac` work; existing admin sessions will be logged out once (expected — no `admin_sessions` row for pre-release tokens).
- Manual QA by the user, then a gstack `qa` pass → `.claude/qa-report/` (not run as part of this task).
- Template-derived components still need auditing — remove or replace demo/placeholder data (unrelated to RBAC).

## Blocked / Waiting on
- None. (`pnpm build` passes on `fix/stage-a`; the old reviews-page TS2322 blocker is fixed. `pnpm lint` stays at the pre-existing baseline of 11 errors / 18 warnings.)

## Notes for next session
- No automated test setup exists yet (Jest/RTL recommended) — this feature was verified via `pnpm lint` + `pnpm exec tsc --noEmit` only (no unit tests on the admin side).
- Confirm auth cookie format still matches backend JWT expectations after the login response shape change (`admin.role` is now an object `{key, name, is_super}`, not a string; `status` replaces `is_active`).
