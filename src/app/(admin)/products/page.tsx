"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Select from "@/components/form/Select";
import { useProducts, useDeleteProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import type { ProductFilters } from "@/services/product.service";
import PermissionGuard from "@/components/auth/PermissionGuard";
import Can from "@/components/auth/Can";

const getStatusBadge = (stockQty: number, threshold: number) => {
  if (stockQty === 0) {
    return (
      <Badge variant="light" color="error">
        Out of Stock
      </Badge>
    );
  }
  if (stockQty <= threshold) {
    return (
      <Badge variant="light" color="warning">
        Low Stock
      </Badge>
    );
  }
  return (
    <Badge variant="light" color="success">
      In Stock
    </Badge>
  );
};

function AllProductsContent() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<Omit<ProductFilters, "search">>({
    page: 1,
    limit: 10,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Combine debounced search with other filters for API call
  const apiFilters: ProductFilters = useMemo(() => ({
    ...filters,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  }), [filters, debouncedSearch]);

  const { data: productsData, isLoading, error } = useProducts(apiFilters);
  const { data: categories } = useCategories();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: updateProduct } = useUpdateProduct();

  const products = productsData?.data || [];
  const totalPages = productsData?.pagination?.total_pages || 1;

  // Build category options from API - flatten the tree for dropdown
  const categoryOptions = useMemo(() => {
    if (!categories) return [{ value: "", label: "All Categories" }];
    const options: { value: string; label: string }[] = [{ value: "", label: "All Categories" }];

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
  }, [categories]);

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  const featuredOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Featured" },
    { value: "false", label: "Not Featured" },
  ];

  const stockOptions = [
    { value: "", label: "All Stock" },
    { value: "true", label: "In Stock" },
    { value: "false", label: "Out of Stock" },
  ];

  const sortOptions = [
    { value: "", label: "Sort By" },
    { value: "newest", label: "Newest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
    { value: "name_desc", label: "Name: Z to A" },
    { value: "rating", label: "Top Rated" },
  ];

  const handleFilterChange = (key: keyof ProductFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProduct(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="All Products" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header with Add button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Products
            </h3>
            <Can permission="products.create">
              <Link
                href="/products/add"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Product
              </Link>
            </Can>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="min-w-[180px]">
                <Select
                  options={categoryOptions}
                  defaultValue={filters.category_id || ""}
                  onChange={(val) => handleFilterChange("category_id", val)}
                />
              </div>

              {/* Status Filter */}
              <div className="min-w-[140px]">
                <Select
                  options={statusOptions}
                  defaultValue={filters.is_active === undefined ? "" : String(filters.is_active)}
                  onChange={(val) => handleFilterChange("is_active", val)}
                />
              </div>

              {/* Featured Filter */}
              <div className="min-w-[140px]">
                <Select
                  options={featuredOptions}
                  defaultValue={filters.is_featured === undefined ? "" : String(filters.is_featured)}
                  onChange={(val) => handleFilterChange("is_featured", val)}
                />
              </div>

              {/* Stock Filter */}
              <div className="min-w-[140px]">
                <Select
                  options={stockOptions}
                  defaultValue={filters.in_stock === undefined ? "" : String(filters.in_stock)}
                  onChange={(val) => handleFilterChange("in_stock", val)}
                />
              </div>

              {/* Sort */}
              <div className="min-w-[180px]">
                <Select
                  options={sortOptions}
                  defaultValue={filters.sort || ""}
                  onChange={(val) => handleFilterChange("sort", val)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-500">
                Failed to load products. Please try again.
              </div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                {debouncedSearch ? "No products match your search." : "No products found."}
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Featured
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Product
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      SKU
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Category
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Price
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Stock
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow
                      key={product.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <TableCell className="px-6 py-4 text-center">
                        <Can
                          permission="products.edit"
                          fallback={
                            <input
                              type="checkbox"
                              checked={product.is_featured || false}
                              disabled
                              className="h-4 w-4 rounded border-gray-300 text-brand-500 cursor-not-allowed opacity-60"
                            />
                          }
                        >
                          <input
                            type="checkbox"
                            checked={product.is_featured || false}
                            onChange={(e) => {
                              updateProduct({
                                id: product.id,
                                data: { is_featured: e.target.checked },
                              });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                          />
                        </Can>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-[48px] w-[48px] min-w-[48px] overflow-hidden rounded-lg bg-gray-100">
                            {product.primary_image || product.images?.[0]?.image_url ? (
                              <Image
                                src={product.primary_image || product.images![0].image_url}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="h-[48px] w-[48px] object-cover"
                              />
                            ) : (
                              <div className="flex h-[48px] w-[48px] items-center justify-center text-gray-400">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 dark:text-white/90">
                              {product.name}
                            </span>
                            {product.has_variants && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({product.variants?.length || 0} variants)
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {product.sku}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {product.category?.name || product.category_name || "-"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right font-medium text-gray-800 dark:text-white/90">
                        ₹{product.base_price.toLocaleString()}
                        {product.original_price && product.original_price > product.base_price && (
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            ₹{product.original_price.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                        {product.stock_quantity}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        {getStatusBadge(product.stock_quantity, product.low_stock_threshold)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Can permission="products.edit">
                            <Link
                              href={`/products/${product.id}/edit`}
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Link>
                          </Can>
                          <Can permission="products.delete">
                            <button
                              onClick={() => setDeleteId(product.id)}
                              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </Can>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500">
                Page {filters.page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                  }
                  disabled={(filters.page || 1) <= 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                  }
                  disabled={(filters.page || 1) >= totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Product
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this product? This action cannot be
              undone. Products that have orders can&apos;t be deleted. Set them to
              Inactive instead.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AllProducts() {
  return (
    <PermissionGuard permission="products.view">
      <AllProductsContent />
    </PermissionGuard>
  );
}
