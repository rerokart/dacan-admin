"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productService,
  type Product,
  type ProductFilters,
  type CreateProductRequest,
  type UpdateProductRequest,
  type SaveOptionsRequest,
  type UpdateImageRequest,
  type ProductVariant,
  type CreateVariantRequest,
  type AddImageRequest,
} from "@/services/product.service";
import { useToast } from "@/components/ui/toast";

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string | number) => [...productKeys.details(), id] as const,
  variants: (productId: string | number) =>
    [...productKeys.all, "variants", productId] as const,
};

// Get Products
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productService.getProducts(filters),
  });
};

// Get Product by ID
export const useProduct = (id: string | number) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};

// Create Product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Product created. Add options and images below.");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create product");
    },
  });
};

// Update Product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: UpdateProductRequest;
    }) => productService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
      toast.success("Product updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update product");
    },
  });
};

// Delete Product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Product deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete product");
    },
  });
};

// Get Variants
export const useProductVariants = (productId: string | number) => {
  return useQuery({
    queryKey: productKeys.variants(productId),
    queryFn: () => productService.getVariants(productId),
    enabled: !!productId,
  });
};

// Add Variant
export const useAddVariant = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string | number;
      data: CreateVariantRequest;
    }) => productService.addVariant(productId, data),
    onSuccess: (_, variables) => {
      // Price and stock mirrors on the list come from the variants.
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.variants(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Variant added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to add variant");
    },
  });
};

// Update Variant
export const useUpdateVariant = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: string | number;
      variantId: string | number;
      data: Partial<CreateVariantRequest>;
    }) => productService.updateVariant(productId, variantId, data),
    onSuccess: (_, variables) => {
      // Price and stock mirrors on the list come from the variants.
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.variants(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Variant updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update variant");
    },
  });
};

// Delete Variant
export const useDeleteVariant = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string | number;
      variantId: string | number;
    }) => productService.deleteVariant(productId, variantId),
    onSuccess: (_, variables) => {
      // Price and stock mirrors on the list come from the variants.
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.variants(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Variant deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete variant");
    },
  });
};

// Upload Images
export const useUploadProductImages = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      productId,
      files,
    }: {
      productId: string | number;
      files: FormData;
    }) => productService.uploadImages(productId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Images uploaded successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to upload images");
    },
  });
};

// Delete Image
export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string | number;
      imageId: string | number;
    }) => productService.deleteImage(productId, imageId),
    onSuccess: (_, variables) => {
      // The list shows the primary image, so refresh it too.
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Image deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete image");
    },
  });
};

// Upload Product Image (standalone - returns image_url)
export const useUploadProductImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: FormData) => productService.uploadImage(file),
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to upload image");
    },
  });
};

// Add Image URL to Product
export const useAddProductImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string | number;
      data: AddImageRequest;
    }) => productService.addProductImage(productId, data),
    onSuccess: (_, variables) => {
      // The list shows the primary image, so refresh it too.
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to add image to product");
    },
  });
};

const invalidateProduct = (
  queryClient: ReturnType<typeof useQueryClient>,
  id: string | number
) => {
  queryClient.invalidateQueries({ queryKey: productKeys.lists() });
  queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
  queryClient.invalidateQueries({ queryKey: productKeys.variants(id) });
};

// Archive Product
export const useArchiveProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => productService.archiveProduct(id),
    onSuccess: (_, id) => {
      invalidateProduct(queryClient, id);
      toast.success("Product archived");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to archive product");
    },
  });
};

// Restore Product (comes back as Inactive)
export const useRestoreProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => productService.restoreProduct(id),
    onSuccess: (_, id) => {
      invalidateProduct(queryClient, id);
      toast.success("Product restored as Inactive");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to restore product");
    },
  });
};

// Save the option set
export const useSaveOptions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string | number;
      data: SaveOptionsRequest;
    }) => productService.saveOptions(productId, data),
    onSuccess: (_, variables) => {
      invalidateProduct(queryClient, variables.productId);
      toast.success("Options saved");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to save options");
    },
  });
};

// Generate missing combinations
export const useGenerateVariants = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (productId: string | number) => productService.generateVariants(productId),
    onSuccess: (variants, productId) => {
      invalidateProduct(queryClient, productId);
      toast.success(
        variants.length
          ? `${variants.length} variant(s) created`
          : "No missing combinations"
      );
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to generate variants");
    },
  });
};

// Update one image (primary, alt text, type, variant, replace file)
export const useUpdateProductImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
      data,
    }: {
      productId: string | number;
      imageId: string | number;
      data: UpdateImageRequest;
    }) => productService.updateImage(productId, imageId, data),
    onSuccess: (_, variables) => {
      // The list shows the primary image, so refresh it too.
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update image");
    },
  });
};

// Reorder images
export const useReorderProductImages = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      productId,
      imageIds,
    }: {
      productId: string | number;
      imageIds: string[];
    }) => productService.reorderImages(productId, imageIds),
    onSuccess: (_, variables) => {
      // The list shows the primary image, so refresh it too.
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to reorder images");
    },
  });
};
