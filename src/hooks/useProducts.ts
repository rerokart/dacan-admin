"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productService,
  type Product,
  type ProductFilters,
  type CreateProductRequest,
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
      toast.success("Product created successfully!");
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
      data: Partial<CreateProductRequest>;
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
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to add image to product");
    },
  });
};
