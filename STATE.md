# dacan-admin — State

_Last updated: 2026-10-09_

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

- **Stage A bug sprint (merged into `main` 2026-10-04 @ `c690661`)**: POS posts to `pos/orders/offline` with cash/card/upi, receipt shows variant, amount paid and change, totals rounded to paise (B02); Inventory page and Dashboard low-stock widget wired to the real inventory list/overview and stock `adjustment` (B04, B05, B26); product delete shows the 409 "has orders" message (B08); banner move up/down reorder + link-format hint (B11); Cancel order sends a status update, "Refunded" removed, Cash/Card/UPI payment filters (B13, B16, B15); dashboard demo data replaced by `analytics/dashboard` + `analytics/sales` (B57); `pnpm build` now passes (B29, reviews rating filter typing). Needs backend `fix/stage-a`. Detail: `docs/BUGS.md`, `docs/SEQUENCE.md`.

## In Progress
- **C2.5 follow-up sweep, built 2026-10-09 on `fix/c2-5` @ `159139e` (off `main` 85827e9). NOT merged, NOT pushed; needs the backend `fix/c2-5` and its Phase 11 migration, then QA in a browser** (decisions `docs/decision/2026-10-09-c2-5-sweep.md`). Fixes B60, B61, B62, B74, B75, B76 (admin side), B93 (admin side), B94 to B98.
  - **Categories:** the parent list offers only parents the server accepts; new categories under a non-Active parent default to Draft; clearing the code in edit mode is blocked; archived categories show channel and featured fields read-only; Delete follows the category detail's direct product count and all children, with the delete dialog in its own file.
  - **Brands:** the brand picker and the product-list brand filter search on the server (no 100-brand stop); for roles without `brands.view` the list filter is hidden and the product-form picker shows a read-only box; Delete follows `product_count_all`; deleting a brand clears its detail cache.
  - **Products:** archived products open as a read-only view (no "Access denied"), with Restore still working and no Edit link on archived rows; unsaved form edits survive when a product gains or loses options; an image with no type shows "Not set"; first upload is typed "main", later ones send no type; reorder state clears after success; no duplicate error toasts; half-typed tags are kept; description cap 20,000; large-file warning before upload; category images have no minimum pixel size (50 MP ceiling).
  - **Tidy:** shared query keys (`src/hooks/queryKeys.ts`); `TextArea` and `Select` take an `id`; `ProductForm`, `ImageManager` and `VariantModal` are split into `product-form/`, `images/` and `variant-modal/` files.
  - **Checks:** tsc 0; lint **7 errors / 12 warnings**; `pnpm build` OK. Not run in a browser yet (manual checks are in the QA part).
- **Products C2, built on `feature/products-c2` @ `8645065` and since merged into `main`; awaiting user QA** (`.claude/qa-report/2026-10-05-multi-products-c2-user-checklist.md`). Needs the backend `feature/products-c2` and its Phase 9 migration. Follow-ups B94–B98 in `docs/BUGS.md`: fixed in C2.5.
  - **Data layer:** product/brand types and services, `useBrands`, new product hooks (archive, restore, options, generate, image PATCH/reorder), `src/utils/productRules.ts`, `src/utils/formHelpers.ts` (`preventEnterSubmit`), `src/hooks/catalogInvalidation.ts` (stock changes refresh products, inventory and the low-stock widget together).
  - **Brands:** `src/app/(admin)/brands/page.tsx`, `BrandFormModal` (portaled), `BrandPicker` (search, "(inactive)", add new); top-level "Brands" nav item gated `brands.view`.
  - **Product form:** shared `src/components/products/ProductForm.tsx` for add and edit (Basics, Pricing & stock, Identity, Content, Specifications, Purchase limits); new products default to Draft; edit sends only changed fields; publish problems and duplicate warnings shown.
  - **Edit page:** `OptionsEditor`, `VariantGrid` (SKU lock, generate missing combinations), rewritten `VariantModal`, `ImageManager` (drag reorder, primary, alt text, type, variant link, replace, 2 MB / 8-image checks).
  - **List:** status and brand filters, brand column, status badge, variant count, price range, Archive / Restore, Delete only for drafts.
  - **Consumers checked:** POS, inventory, low-stock widget, wishlists, order detail need no change.
  - **Checks:** tsc 0; lint **8 errors / 12 warnings** (below the 10 / 15 baseline); `pnpm build` OK. No browser run.
- **Categories C1, merged into `main` 2026-10-04 @ `e4d0315`**, awaiting user QA. Follow-ups: B58-B78 in `docs/BUGS.md` (`.claude/qa-report/2026-10-04-multi-categories-c1-user-checklist.md`):
  - **Shared form:** `src/components/categories/CategoryForm.tsx` (code, status, parent up to level 2, App/Web/POS, featured, icon/thumbnail/banner with a 2 MB limit; edits send only changed fields).
  - **Category list:** code, in-stock/total, status badge, "Hidden by parent", channel chips, featured star, show-archived toggle, archive dialog (moves products), restore, delete only when empty with the corrected copy (B31).
  - **Product dropdowns:** full category paths via `src/utils/categoryOptions.ts`.
  - **Checks:** tsc 0, lint 10 errors / 15 warnings (below baseline), build OK.
  - **Depends on:** the backend C1 code and its migration (`create_phase8_categories.sql`).
- Stage A is merged and awaiting user QA (checklist: `.claude/qa-report/2026-10-04-multi-stage-a-user-checklist.md`)

## Next Up
- **C2.5:** QA of `fix/c2-5` in a browser with the backend `fix/c2-5` (Phase 11 applied first), then merge into `main` and deploy after the backend. Then C3.
- **C2:** merged; user QA still to do (see the C2 checklist).
- Apply the backend migration `create_phase7_stage_a.sql` first (see `docs/MIGRATION.md`, "Phase 7"), then deploy backend, then this build, together with `feature/admin-rbac` work; existing admin sessions will be logged out once (expected — no `admin_sessions` row for pre-release tokens).
- Manual QA by the user, then a gstack `qa` pass → `.claude/qa-report/` (not run as part of this task).
- Template-derived components still need auditing — remove or replace demo/placeholder data (unrelated to RBAC).

## Blocked / Waiting on
- None. (`pnpm build` passes on `fix/stage-a`; the old reviews-page TS2322 blocker is fixed. `pnpm lint` stays at the pre-existing baseline of 11 errors / 18 warnings.)

## Notes for next session
- No automated test setup exists yet (Jest/RTL recommended) — this feature was verified via `pnpm lint` + `pnpm exec tsc --noEmit` only (no unit tests on the admin side).
- Confirm auth cookie format still matches backend JWT expectations after the login response shape change (`admin.role` is now an object `{key, name, is_super}`, not a string; `status` replaces `is_active`).
