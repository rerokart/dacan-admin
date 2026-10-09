"use client";

import React from "react";
import { useCategory, useDeleteCategory } from "@/hooks/useCategories";
import type { Category } from "@/services/category.service";

const cancelBtn =
  "rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800";

/**
 * Delete confirmation. The list's own counts only cover Active products and
 * visible children, so this loads the category detail, which counts products
 * of every status and subcategories including archived ones.
 */
export default function DeleteCategoryDialog({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const { data: detail, isLoading, isError } = useCategory(category.id);
  const { mutate: deleteCategory, isPending } = useDeleteCategory();

  const productCount = detail?.direct_product_count ?? 0;
  const childCount = detail?.children?.length ?? 0;
  const blocked = productCount > 0 || childCount > 0;
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Category</h3>
        {isLoading ? (
          <div className="mt-4 h-6 w-6 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        ) : isError ? (
          <p className="mt-2 text-sm text-error-600">Couldn&apos;t check this category. Try again.</p>
        ) : blocked ? (
          <p className="mt-2 text-sm text-error-600">
            Has {plural(productCount, "product", "products")} and{" "}
            {plural(childCount, "subcategory", "subcategories")} (including archived). Archive it
            instead.
          </p>
        ) : (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Delete &quot;{category.name}&quot; permanently? Only empty categories can be deleted. To
            hide a category, archive it instead.
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className={cancelBtn}>
            Cancel
          </button>
          {!isLoading && !isError && !blocked && (
            <button
              onClick={() => deleteCategory(category.id, { onSuccess: onClose })}
              disabled={isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
