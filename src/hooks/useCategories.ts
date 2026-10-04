"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  categoryService,
  type Category,
  type CategoryFilters,
  type CreateCategoryRequest,
} from "@/services/category.service";
import { useToast } from "@/components/ui/toast";

// Query keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: CategoryFilters) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string | number) => [...categoryKeys.details(), id] as const,
};

// Get Categories
export const useCategories = (filters?: CategoryFilters) => {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => categoryService.getCategories(filters),
  });
};

// Get Category by ID
export const useCategory = (id: string | number) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
  });
};

// Create Category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create category");
    },
  });
};

// Update Category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<CreateCategoryRequest>;
    }) => categoryService.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });
      toast.success("Category updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update category");
    },
  });
};

// Delete Category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete category");
    },
  });
};

// Archive Category (optionally moving its products first)
export const useArchiveCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, moveProductsTo }: { id: string; moveProductsTo?: string }) =>
      categoryService.archiveCategory(id, moveProductsTo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
      toast.success("Category archived");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to archive category");
    },
  });
};

// Restore Category (comes back as Inactive)
export const useRestoreCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => categoryService.restoreCategory(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      toast.success("Category restored as Inactive");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to restore category");
    },
  });
};

// Upload Category Image
export const useUploadCategoryImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return categoryService.uploadCategoryImage(formData);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to upload image");
    },
  });
};

// Helper to build category tree
export const buildCategoryTree = (categories: Category[]): Category[] => {
  const categoryMap = new Map<string, Category>();
  const roots: Category[] = [];

  // First pass: create a map of all categories
  categories.length > 0 && categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Second pass: build the tree
    categories.length > 0 && categories.forEach((cat) => {
    const category = categoryMap.get(cat.id)!;
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      const parent = categoryMap.get(cat.parent_id)!;
      if (!parent.children) parent.children = [];
      parent.children.push(category);
    } else {
      roots.push(category);
    }
  });

  return roots;
};
