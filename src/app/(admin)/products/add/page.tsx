"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/auth/PermissionGuard";
import ProductForm from "@/components/products/ProductForm";
import { usePermissions } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/services/product.service";

function AddProductContent() {
  const router = useRouter();
  const { can } = usePermissions();
  const { toast } = useToast();
  // Bumped to start a fresh form when the admin can't open the new product.
  const [formKey, setFormKey] = useState(0);

  // Go where this admin is allowed: the edit page needs both view and edit.
  const handleCreated = (product: Product) => {
    const canView = can("products.view");
    if (canView && can("products.edit")) {
      toast.success("Product created. Add options and images below.");
      router.push(`/products/${product.id}/edit`);
    } else if (canView) {
      toast.success("Created. Ask an editor to add options and images");
      router.push("/products");
    } else {
      toast.success("Product created");
      setFormKey((k) => k + 1);
    }
  };

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
          <ProductForm key={formKey} mode="create" onDone={handleCreated} />
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
