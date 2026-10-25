"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import {
  useArchiveCategory,
  useCategories,
  useCategory,
  useRestoreCategory,
} from "@/hooks/useCategories";
import type { Category, CategoryStatus } from "@/services/category.service";
import { flattenCategoryOptions, subtreeIds } from "@/utils/categoryOptions";
import PermissionGuard from "@/components/auth/PermissionGuard";
import DeleteCategoryDialog from "@/components/categories/DeleteCategoryDialog";
import Can from "@/components/auth/Can";

const STATUS_BADGE: Record<CategoryStatus, { label: string; color: "success" | "light" | "warning" | "error" }> = {
  active: { label: "Active", color: "success" },
  draft: { label: "Draft", color: "light" },
  inactive: { label: "Inactive", color: "warning" },
  archived: { label: "Archived", color: "error" },
};

const CHANNELS: { key: "show_on_app" | "show_on_web" | "show_in_pos"; label: string }[] = [
  { key: "show_on_app", label: "App" },
  { key: "show_on_web", label: "Web" },
  { key: "show_in_pos", label: "POS" },
];

const iconBtn =
  "rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200";
const cancelBtn =
  "rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800";

function Modal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ArchiveDialog({
  category,
  tree,
  onClose,
}: {
  category: Category;
  tree: Category[];
  onClose: () => void;
}) {
  const { data: detail, isLoading } = useCategory(category.id);
  const { mutate: archive, isPending } = useArchiveCategory();
  const [target, setTarget] = useState("");

  const productCount = detail?.direct_product_count ?? 0;
  const liveChildren = (detail?.children ?? []).filter((c) => c.status !== "archived").length;
  const targetOptions = useMemo(
    () => flattenCategoryOptions(tree, {
        excludeIds: subtreeIds(tree, category.id),
        onlySubcategories: true,
      }),
    [tree, category.id]
  );

  const blocked = liveChildren > 0;
  const needsTarget = productCount > 0;

  return (
    <Modal title={`Archive "${category.name}"`}>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Archived categories are hidden everywhere (app, website and POS) but kept for orders and
        reports. You can restore it later.
      </p>
      {isLoading ? (
        <div className="mt-4 h-6 w-6 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      ) : blocked ? (
        <p className="mt-4 text-sm text-error-600">
          Archive its {liveChildren} {liveChildren === 1 ? "subcategory" : "subcategories"} first.
        </p>
      ) : (
        needsTarget && (
          <div className="mt-4">
            <Label htmlFor="move-target">
              Move {productCount} {productCount === 1 ? "product" : "products"} to:
            </Label>
            <Select
              id="move-target"
              options={targetOptions}
              placeholder="Select a subcategory"
              value={target}
              onChange={setTarget}
            />
            {targetOptions.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                No other subcategory to move them to. Create one first.
              </p>
            )}
          </div>
        )
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className={cancelBtn}>
          Cancel
        </button>
        {!blocked && (
          <button
            onClick={() =>
              archive(
                { id: category.id, moveProductsTo: needsTarget ? target : undefined },
                { onSuccess: onClose }
              )
            }
            disabled={isPending || isLoading || (needsTarget && !target)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Archiving..." : "Archive"}
          </button>
        )}
      </div>
    </Modal>
  );
}

function CategoriesPageContent() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Category | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  // Rows are expanded by default; this holds the collapsed ones.
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: categories, isLoading, error } = useCategories({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(showArchived ? { include_archived: true } : {}),
  });
  // Unfiltered tree for "move products to" choices.
  const { data: fullTree } = useCategories();
  const { mutate: restoreCategory, isPending: isRestoring } = useRestoreCategory();

  const roots = useMemo(() => (categories ?? []).filter((cat) => !cat.parent_id), [categories]);

  const toggleExpand = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderCategoryRow = (category: Category, depth: number = 0) => {
    const hasChildren = !!category.children?.length;
    const isExpanded = !collapsedIds.has(category.id);
    const image = category.icon_url || category.thumbnail_url || category.image_url;
    const badge = STATUS_BADGE[category.status] ?? STATUS_BADGE.active;
    const isArchived = category.status === "archived";

    return (
      <React.Fragment key={category.id}>
        <TableRow className="border-b border-gray-100 dark:border-gray-800">
          <TableCell className="px-6 py-4">
            <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 24}px` }}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(category.id)}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                  className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <div className="w-6" />
              )}
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={category.name} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {category.name}
                  {category.is_featured && (
                    <span className="ml-2 text-amber-500" title="Featured category">★</span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {category.code} · {category.slug}
                </p>
              </div>
            </div>
          </TableCell>
          <TableCell className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
            <span title="in stock / total">
              {category.product_count ?? 0} / {category.total_product_count ?? 0}
            </span>
          </TableCell>
          <TableCell className="px-6 py-4 text-center">
            <Badge variant="light" color={badge.color}>
              {badge.label}
            </Badge>
            {category.hidden_by_parent && (
              <p className="mt-1 text-xs text-gray-500">Hidden by parent</p>
            )}
          </TableCell>
          <TableCell className="px-6 py-4 text-center">
            <div className="flex justify-center gap-1">
              {CHANNELS.map((ch) => (
                <span
                  key={ch.key}
                  className={`rounded px-1.5 py-0.5 text-xs ${
                    category[ch.key]
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                      : "bg-gray-100 text-gray-400 line-through dark:bg-gray-800"
                  }`}
                >
                  {ch.label}
                </span>
              ))}
            </div>
          </TableCell>
          <TableCell className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-1">
              <Can permission="categories.edit">
                <Link href={`/categories/${category.id}/edit`} className={iconBtn} title="Edit">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
              </Can>
              <Can permission="categories.delete">
                {isArchived ? (
                  <button onClick={() => setRestoreTarget(category)} className={iconBtn} title="Restore">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                ) : (
                  <button onClick={() => setArchiveTarget(category)} className={iconBtn} title="Archive">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(category)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </Can>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && category.children!.map((child) => renderCategoryRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Categories" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Categories</h3>
            <Can permission="categories.create">
              <Link
                href="/categories/add"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Category
              </Link>
            </Can>
          </div>

          {/* Search + archived toggle */}
          <div className="flex flex-col gap-4 p-6 border-b border-gray-200 dark:border-gray-800 sm:flex-row sm:items-center">
            <div className="relative max-w-md flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <Checkbox
              id="show-archived"
              label="Show archived"
              checked={showArchived}
              onChange={setShowArchived}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-500">Failed to load categories. Please try again.</div>
            ) : roots.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                {debouncedSearch ? "No categories match your search." : "No categories found."}
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Category
                    </TableCell>
                    <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      Products
                    </TableCell>
                    <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      Channels
                    </TableCell>
                    <TableCell isHeader className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>{roots.map((category) => renderCategoryRow(category))}</TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {archiveTarget && (
        <ArchiveDialog
          category={archiveTarget}
          tree={fullTree ?? []}
          onClose={() => setArchiveTarget(null)}
        />
      )}

      {restoreTarget && (
        <Modal title={`Restore "${restoreTarget.name}"`}>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The category comes back as <strong>Inactive</strong>. Set it to Active when it is ready
            for customers.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setRestoreTarget(null)} className={cancelBtn}>
              Cancel
            </button>
            <button
              onClick={() => restoreCategory(restoreTarget.id, { onSuccess: () => setRestoreTarget(null) })}
              disabled={isRestoring}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {isRestoring ? "Restoring..." : "Restore"}
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <DeleteCategoryDialog category={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <PermissionGuard permission="categories.view">
      <CategoriesPageContent />
    </PermissionGuard>
  );
}
