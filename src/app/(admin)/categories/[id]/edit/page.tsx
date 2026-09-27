"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import { useCategory, useCategories, useUpdateCategory, useUploadCategoryImage } from "@/hooks/useCategories";
import PermissionGuard from "@/components/auth/PermissionGuard";

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

function EditCategoryPageContent() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent_id: "",
    display_order: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState(false);

  const { data: category, isLoading: loadingCategory } = useCategory(categoryId);
  const { data: categories } = useCategories();
  const { mutate: updateCategory, isPending } = useUpdateCategory();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadCategoryImage();

  // Initialize form with existing data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        parent_id: category.parent_id || "",
        display_order: category.display_order,
        is_active: category.is_active,
      });
      if (category.image_url) {
        setImagePreview(category.image_url);
      }
    }
  }, [category]);

  // Only allow root categories as parents (one level nesting only)
  // Also exclude current category from options
  const parentOptions = [
    { value: "", label: "None (Root Category)" },
    ...(categories
      ?.filter((cat) => !cat.parent_id && cat.id !== categoryId) // Only root categories, exclude self
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      })) || []),
  ];

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      ...(autoSlug ? { slug: generateSlug(name) } : {}),
    }));
  }, [autoSlug]);

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let image_url: string | undefined;

    // Upload new image if selected
    if (imageFile) {
      try {
        const uploadResult = await uploadImage(imageFile);
        image_url = uploadResult.image_url;
      } catch {
        return; // Error toast shown by hook
      }
    }

    const data = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || undefined,
      parent_id: formData.parent_id || undefined,
      display_order: formData.display_order,
      is_active: formData.is_active,
      ...(image_url && { image_url }),
    };

    updateCategory(
      { id: categoryId, data },
      {
        onSuccess: () => {
          router.push("/categories");
        },
      }
    );
  };

  if (loadingCategory) {
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
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Category Name */}
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Enter category name"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="category-slug"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to auto-generate from name
                </p>
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <Label htmlFor="description">Description</Label>
                <TextArea
                  placeholder="Enter category description"
                  rows={4}
                  value={formData.description}
                  onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
                />
              </div>

              {/* Parent Category */}
              <div>
                <Label htmlFor="parent">Parent Category</Label>
                <Select
                  options={parentOptions}
                  defaultValue={formData.parent_id}
                  onChange={(val) => setFormData((prev) => ({ ...prev, parent_id: val }))}
                />
              </div>

              {/* Display Order */}
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  type="number"
                  id="display_order"
                  name="display_order"
                  value={String(formData.display_order)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  options={[
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ]}
                  defaultValue={String(formData.is_active)}
                  onChange={(val) => setFormData((prev) => ({ ...prev, is_active: val === "true" }))}
                />
              </div>

              {/* Category Image */}
              <div>
                <Label htmlFor="image">Category Image</Label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center flex-1 h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click to upload image
                      </p>
                    </div>
                    <input
                      id="image"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || isUploading || !formData.name}
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : isPending ? "Updating..." : "Update Category"}
              </button>
            </div>
          </form>
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
