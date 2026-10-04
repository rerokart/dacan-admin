"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { useParams } from "next/navigation";
import { useProduct } from "@/hooks/useProducts";
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
  // Remount the options editor whenever the saved option set changes, so its draft starts fresh.
  const optionsKey = JSON.stringify(
    (product.options ?? []).map((o) => [o.id, o.name, o.values.map((v) => [v.id, v.value])])
  );

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Product" />
      <div className="space-y-6">
        <div className={card}>
          <h3 className={cardTitle}>Product Information</h3>
          {/* Stays on this page after saving so warnings stay visible. Remounts when
              options are added or all removed, since that moves price and stock. */}
          <ProductForm
            key={`${product.id}-${isSimple ? "simple" : "options"}`}
            mode="edit"
            initial={product}
            onDone={() => undefined}
          />
        </div>

        <Can permission="products.edit">
          <div className={card}>
            <h3 className={cardTitle}>Options</h3>
            <OptionsEditor key={optionsKey} product={product} />
          </div>

          {!isSimple && (
            <div className={card}>
              <h3 className={cardTitle}>Variants</h3>
              <VariantGrid product={product} />
            </div>
          )}

          <div className={card}>
            <h3 className={cardTitle}>Images</h3>
            <ImageManager product={product} />
          </div>
        </Can>
      </div>
    </div>
  );
}

export default function EditProductPage() {
  return (
    <PermissionGuard permission="products.edit">
      <EditProductPageContent />
    </PermissionGuard>
  );
}
