# dacan-admin — State

_Last updated: 2026-09-27_

## Done
- Next.js 16 + React 19 initialized from admin-dashboard template
- Tailwind CSS v4 configured
- TanStack Query + axios wired for data fetching
- react-hook-form + zod set up for forms
- Dashboard shell + several template pages present
- **Admin Access & RBAC (Phase 1, branch `feature/admin-rbac`, `3e18d45`)**: `AuthContext`/`usePermissions()` fed by `/auth/login` + `/auth/me` (M4 fix — `role` removed from `localStorage`); axios 401→logout / 403→toast+refetch (no logout); new public Forgot-password (3-step) and Accept-invitation pages; Settings → Admin Access screen (Admins / Roles & Permissions / Audit Log / Login History tabs); Profile page Active-sessions list + "Log out all devices"; `<Can>` gating + sidebar filtering + page-level 403 guard wired across every existing screen. Full detail: `docs/api/ADMIN.md`, `.claude/Arch/ARCHITECTURE_AD.md`.

## In Progress
- (feature complete — one pre-existing build blocker below needs a fix before deploy)

## Next Up
- Fix the pre-existing `pnpm build` type error at `src/app/(admin)/reviews/page.tsx` (`TS2322`, ~line 165) — predates this feature, not introduced by it. `pnpm lint` is clean against the pre-existing baseline (12 errors/18 warnings, unchanged).
- After that: deploy together with the `dacan-ecom-be` `feature/admin-rbac` branch; existing admin sessions will be logged out once (expected — no `admin_sessions` row for pre-release tokens).
- Manual QA by the user, then a gstack `qa` pass → `.claude/qa-report/` (not run as part of this task).
- Template-derived components still need auditing — remove or replace demo/placeholder data (unrelated to RBAC).

## Blocked / Waiting on
- **`pnpm build` fails** on a pre-existing type error in `src/app/(admin)/reviews/page.tsx` — confirmed via `pnpm exec tsc --noEmit` to be the only error, and confirmed pre-existing on `main` before this branch. Blocks a clean production build until fixed.

## Notes for next session
- No automated test setup exists yet (Jest/RTL recommended) — this feature was verified via `pnpm lint` + `pnpm exec tsc --noEmit` only (no unit tests on the admin side).
- Confirm auth cookie format still matches backend JWT expectations after the login response shape change (`admin.role` is now an object `{key, name, is_super}`, not a string; `status` replaces `is_active`).
