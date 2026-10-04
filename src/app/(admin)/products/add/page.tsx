"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/auth/PermissionGuard";
import ProductForm from "@/components/products/ProductForm";

function AddProductContent() {
  const router = useRouter();

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Product" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            Product Information
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Options (size, colour…) and images are added on the next page, after the product is created.
          </p>
          <ProductForm mode="create" onDone={(product) => router.push(`/products/${product.id}/edit`)} />
        </div>
      </div>
    </div>
  );
}

export default function AddProduct() {
  return (
    <PermissionGuard permission="products.create">
      <AddProductContent />
    </PermissionGuard>
  );
}
