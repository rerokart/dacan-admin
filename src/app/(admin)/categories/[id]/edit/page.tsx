"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useCategory } from "@/hooks/useCategories";
import PermissionGuard from "@/components/auth/PermissionGuard";
import CategoryForm from "@/components/categories/CategoryForm";

function EditCategoryPageContent() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const { data: category, isLoading } = useCategory(categoryId);

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Category" />
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Category" />
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-red-500">Category not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Category" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Category Information
          </h3>
          <CategoryForm
            key={category.id}
            mode="edit"
            initial={category}
            onDone={() => router.push("/categories")}
          />
        </div>
      </div>
    </div>
  );
}

export default function EditCategoryPage() {
  return (
    <PermissionGuard permission="categories.edit">
      <EditCategoryPageContent />
    </PermissionGuard>
  );
}
