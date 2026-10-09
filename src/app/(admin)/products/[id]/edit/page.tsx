"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { useParams } from "next/navigation";
import { useProduct, useRestoreProduct } from "@/hooks/useProducts";
import ProductForm from "@/components/products/ProductForm";
import OptionsEditor from "@/components/products/OptionsEditor";
import VariantGrid from "@/components/products/VariantGrid";
import ImageManager from "@/components/products/ImageManager";
import PermissionGuard from "@/components/auth/PermissionGuard";
import Can from "@/components/auth/Can";

const card = "rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]";
const cardTitle = "mb-6 text-lg font-semibold text-gray-800 dark:text-white/90";

function EditProductPageContent() {
  const params = useParams();
  const productId = params.id as string;
  const { data: product, isLoading: loadingProduct } = useProduct(productId);
  const { mutate: restoreProduct, isPending: isRestoring } = useRestoreProduct();

  if (loadingProduct) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Product" />
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Product" />
        <div className={`${card} p-12 text-center`}>
          <p className="text-red-500">Product not found.</p>
        </div>
      </div>
    );
  }

  // A product without options keeps its price and stock on the default variant (Pricing tab).
  const isSimple = !!product.default_variant_id;
  // The server refuses every write on an archived product, so the page shows it read-only.
  const readOnly = product.status === "archived";
  // Remount the options editor whenever the saved option set changes, so its draft starts fresh.
  const optionsKey = JSON.stringify(
    (product.options ?? []).map((o) => [o.id, o.name, o.values.map((v) => [v.id, v.value])])
  );

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Product" />
      <div className="space-y-6">
        {readOnly && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
            <span>This product is archived. Restore it to make changes.</span>
            <Can permission="products.delete">
              <button
                type="button"
                onClick={() => restoreProduct(product.id)}
                disabled={isRestoring}
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {isRestoring ? "Restoring..." : "Restore"}
              </button>
            </Can>
          </div>
        )}
        <div className={card}>
          <h3 className={cardTitle}>Product Information</h3>
          {/* Stays on this page after saving so warnings stay visible. Keyed on the id only:
              the form itself follows a new default variant and archive / restore. */}
          <ProductForm key={product.id} mode="edit" initial={product} onDone={() => undefined} readOnly={readOnly} />
        </div>

        <Can permission="products.edit">
          <div className={card}>
            <h3 className={cardTitle}>Options</h3>
            <OptionsEditor key={optionsKey} product={product} readOnly={readOnly} />
          </div>

          {!isSimple && (
            <div className={card}>
              <h3 className={cardTitle}>Variants</h3>
              <VariantGrid product={product} readOnly={readOnly} />
            </div>
          )}

          <div className={card}>
            <h3 className={cardTitle}>Images</h3>
            <ImageManager product={product} readOnly={readOnly} />
          </div>
        </Can>
      </div>
    </div>
  );
}

export default function EditProductPage() {
  // Both are needed (an array would mean any-of).
  return (
    <PermissionGuard permission="products.view">
      <PermissionGuard permission="products.edit">
        <EditProductPageContent />
      </PermissionGuard>
    </PermissionGuard>
  );
}
