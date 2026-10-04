"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/auth/PermissionGuard";
import CategoryForm from "@/components/categories/CategoryForm";

function AddCategoryPageContent() {
  const router = useRouter();

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Category" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Category Information
          </h3>
          <CategoryForm mode="create" onDone={() => router.push("/categories")} />
        </div>
      </div>
    </div>
  );
}

export default function AddCategoryPage() {
  return (
    <PermissionGuard permission="categories.create">
      <AddCategoryPageContent />
    </PermissionGuard>
  );
}
