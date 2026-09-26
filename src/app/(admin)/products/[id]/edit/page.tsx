"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import { useCategories } from "@/hooks/useCategories";
import { useProduct, useUpdateProduct, useUploadProductImage, useAddProductImage, useDeleteProductImage, useProductVariants, useDeleteVariant } from "@/hooks/useProducts";
import { VariantModal } from "@/components/products/VariantModal";
import type { ProductVariant } from "@/services/product.service";
import Badge from "@/components/ui/badge/Badge";
import PermissionGuard from "@/components/auth/PermissionGuard";

function EditProductPageContent() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

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
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);

  const { data: product, isLoading: loadingProduct } = useProduct(productId);
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadProductImage();
  const { mutateAsync: addProductImage } = useAddProductImage();
  const { mutate: deleteImage } = useDeleteProductImage();
  const { data: variants, isLoading: loadingVariants } = useProductVariants(productId);
  const { mutate: deleteVariant, isPending: isDeletingVariant } = useDeleteVariant();

  // Initialize form with existing data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        short_description: product.short_description,
        description: product.description,
        category_id: product.category_id,
        base_price: String(product.base_price),
        original_price: product.original_price ? String(product.original_price) : "",
        stock_quantity: String(product.stock_quantity),
        low_stock_threshold: String(product.low_stock_threshold),
        is_active: product.is_active,
        is_featured: product.is_featured || false,
        has_variants: product.has_variants,
      });
    }
  }, [product]);

  // Build category options from API - flatten the tree for dropdown
  const categoryOptions = (() => {
    if (!categories) return [];
    const options: { value: string; label: string }[] = [];

    const flattenCategories = (cats: typeof categories, prefix = "") => {
      cats.forEach((cat) => {
        options.push({
          value: cat.id,
          label: prefix ? `${prefix} > ${cat.name}` : cat.name,
        });
        if (cat.children?.length) {
          flattenCategories(cat.children, cat.name);
        }
      });
    };

    // Only process root categories (parent_id is null)
    flattenCategories(categories.filter(cat => !cat.parent_id));
    return options;
  })();

  const handleNewImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewImageFiles((prev) => [...prev, ...files]);

      // Create previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  }, []);

  const removeNewImage = useCallback((index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDeleteExistingImage = useCallback((imageId: string) => {
    deleteImage({ productId, imageId });
  }, [deleteImage, productId]);

  const handleEditVariant = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    setVariantModalOpen(true);
  }, []);

  const handleAddVariant = useCallback(() => {
    setSelectedVariant(null);
    setVariantModalOpen(true);
  }, []);

  const handleDeleteVariant = useCallback(() => {
    if (deleteVariantId) {
      deleteVariant(
        { productId, variantId: deleteVariantId },
        { onSuccess: () => setDeleteVariantId(null) }
      );
    }
  }, [deleteVariant, productId, deleteVariantId]);

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

    updateProduct(
      { id: productId, data },
      {
        onSuccess: async () => {
          // Upload new images if any
          if (newImageFiles.length > 0) {
            try {
              const existingImagesCount = product?.images?.length || 0;
              // Upload each image and add to product
              for (let i = 0; i < newImageFiles.length; i++) {
                const file = newImageFiles[i];
                const formDataFile = new FormData();
                formDataFile.append("image", file);

                // Upload image to get URL
                const { image_url } = await uploadImage(formDataFile);

                // Add image URL to product
                await addProductImage({
                  productId,
                  data: {
                    image_url,
                    is_primary: existingImagesCount === 0 && i === 0, // First image is primary only if no existing images
                    display_order: existingImagesCount + i,
                  },
                });
              }
            } catch {
              // Continue even if image upload fails
            }
          }
          router.push("/products");
        },
      }
    );
  };

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
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-red-500">Product not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Product" />
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

              {/* Product Images */}
              <div className="lg:col-span-2">
                <Label htmlFor="images">Product Images</Label>
                <div className="space-y-4">
                  {/* Existing Images */}
                  {product.images && product.images.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Current Images</p>
                      <div className="flex flex-wrap gap-4">
                        {product.images.map((image) => (
                          <div key={image.id} className="relative h-24 w-24 rounded-lg overflow-hidden">
                            <img
                              src={image.image_url}
                              alt="Product"
                              className="h-full w-full object-cover"
                            />
                            {image.is_primary && (
                              <span className="absolute bottom-1 left-1 bg-brand-500 text-white text-xs px-1 rounded">
                                Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingImage(image.id)}
                              className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Image Previews */}
                  {newImagePreviews.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">New Images to Upload</p>
                      <div className="flex flex-wrap gap-4">
                        {newImagePreviews.map((preview, index) => (
                          <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
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
                      onChange={handleNewImageChange}
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
                {isUploading ? "Uploading..." : isPending ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>

        {/* Product Variants Section */}
        {(formData.has_variants || (variants && variants.length > 0)) && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Product Variants
              </h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Variant
              </button>
            </div>

            {loadingVariants ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              </div>
            ) : variants && variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">SKU</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Price</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Stock</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{variant.variant_type}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{variant.variant_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{variant.sku}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-800 dark:text-white/90">
                          ₹{variant.price.toLocaleString()}
                          {variant.original_price && variant.original_price > variant.price && (
                            <span className="ml-1 text-xs text-gray-400 line-through">
                              ₹{variant.original_price.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">{variant.stock_quantity}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="light" color={variant.is_active ? "success" : "error"}>
                            {variant.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditVariant(variant)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteVariantId(variant.id)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No variants added yet. Click &quot;Add Variant&quot; to create one.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Variant Modal */}
      <VariantModal
        isOpen={variantModalOpen}
        onClose={() => {
          setVariantModalOpen(false);
          setSelectedVariant(null);
        }}
        productId={productId}
        variant={selectedVariant}
      />

      {/* Delete Variant Confirmation Modal */}
      {deleteVariantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Variant
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this variant? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteVariantId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVariant}
                disabled={isDeletingVariant}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeletingVariant ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
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
