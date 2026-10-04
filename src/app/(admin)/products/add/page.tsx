"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import { useCategories } from "@/hooks/useCategories";
import { flattenCategoryOptions } from "@/utils/categoryOptions";
import { useCreateProduct, useUploadProductImage, useAddProductImage } from "@/hooks/useProducts";
import PermissionGuard from "@/components/auth/PermissionGuard";

function AddProductContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    category_id: "",
    base_price: "",
    original_price: "",
    stock_quantity: "",
    low_stock_threshold: "10",
    is_active: true,
    is_featured: false,
    has_variants: false,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { mutate: createProduct, isPending } = useCreateProduct();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadProductImage();
  const { mutateAsync: addProductImage } = useAddProductImage();

  // Category options: full path, archived left out
  const categoryOptions = flattenCategoryOptions(categories);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);

      // Create previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      short_description: formData.short_description,
      description: formData.description,
      category_id: formData.category_id,
      base_price: parseFloat(formData.base_price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      has_variants: formData.has_variants,
    };

    createProduct(data, {
      onSuccess: async (product) => {
        // Upload images if any were selected
        if (imageFiles.length > 0 && product.id) {
          try {
            // Upload each image and add to product
            for (let i = 0; i < imageFiles.length; i++) {
              const file = imageFiles[i];
              const formDataFile = new FormData();
              formDataFile.append("image", file);

              // Upload image to get URL
              const { image_url } = await uploadImage(formDataFile);

              // Add image URL to product
              await addProductImage({
                productId: product.id,
                data: {
                  image_url,
                  is_primary: i === 0, // First image is primary
                  display_order: i,
                },
              });
            }
          } catch {
            // Continue even if image upload fails
          }
        }
        router.push("/products");
      },
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Product" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Product Information
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Product Name */}
              <div className="lg:col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Short Description */}
              <div className="lg:col-span-2">
                <Label htmlFor="short_description">Short Description *</Label>
                <Input
                  type="text"
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Brief description for listings"
                  required
                />
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <Label htmlFor="description">Full Description *</Label>
                <TextArea
                  placeholder="Enter detailed product description"
                  rows={4}
                  value={formData.description}
                  onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                {loadingCategories ? (
                  <div className="h-11 rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center dark:border-gray-700 dark:bg-gray-800">
                    <span className="text-sm text-gray-500">Loading categories...</span>
                  </div>
                ) : (
                  <Select
                    options={categoryOptions}
                    placeholder="Select Category"
                    defaultValue={formData.category_id}
                    onChange={(val) => setFormData((prev) => ({ ...prev, category_id: val }))}
                  />
                )}
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

              {/* Featured Product */}
              <div>
                <Label htmlFor="is_featured">Featured</Label>
                <div className="mt-2 flex items-center gap-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
                  </label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.is_featured ? "Featured" : "Not Featured"}
                  </span>
                </div>
              </div>

              {/* Base Price */}
              <div>
                <Label htmlFor="base_price">Price (₹) *</Label>
                <Input
                  type="number"
                  id="base_price"
                  name="base_price"
                  value={formData.base_price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, base_price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Original Price */}
              <div>
                <Label htmlFor="original_price">Original Price (₹)</Label>
                <Input
                  type="number"
                  id="original_price"
                  name="original_price"
                  value={formData.original_price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, original_price: e.target.value }))}
                  placeholder="0.00 (for showing discount)"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  type="number"
                  id="stock_quantity"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                  placeholder="0"
                />
              </div>

              {/* Low Stock Threshold */}
              <div>
                <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                <Input
                  type="number"
                  id="low_stock_threshold"
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData((prev) => ({ ...prev, low_stock_threshold: e.target.value }))}
                  placeholder="10"
                />
              </div>

              {/* Has Variants Toggle */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={formData.has_variants}
                      onChange={(e) => setFormData((prev) => ({ ...prev, has_variants: e.target.checked }))}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
                  </label>
                  <Label htmlFor="has_variants" className="mb-0">This product has variants</Label>
                </div>
                {formData.has_variants && (
                  <div className="mt-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Variants (like size, color, weight) can be added after creating the product. Go to Edit Product to manage variants.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Images */}
              <div className="lg:col-span-2">
                <Label htmlFor="images">Product Images</Label>
                <div className="space-y-4">
                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Area */}
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG or WEBP (MAX. 2MB)
                      </p>
                    </div>
                    <input
                      id="images"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
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
                disabled={isPending || isUploading || !formData.name || !formData.category_id || !formData.base_price}
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
              >
                {isUploading ? "Uploading Images..." : isPending ? "Creating..." : "Save Product"}
              </button>
            </div>
          </form>
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
