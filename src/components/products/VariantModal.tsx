"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useAddVariant, useUpdateVariant } from "@/hooks/useProducts";
import type { ProductVariant, CreateVariantRequest } from "@/services/product.service";

interface VariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  variant?: ProductVariant | null;
}

const initialFormState: CreateVariantRequest = {
  variant_type: "",
  variant_name: "",
  sku: "",
  price: 0,
  original_price: undefined,
  stock_quantity: 0,
  display_order: 0,
  is_active: true,
};

export const VariantModal: React.FC<VariantModalProps> = ({
  isOpen,
  onClose,
  productId,
  variant,
}) => {
  const [formData, setFormData] = useState<CreateVariantRequest>(initialFormState);

  const { mutate: addVariant, isPending: isAdding } = useAddVariant();
  const { mutate: updateVariant, isPending: isUpdating } = useUpdateVariant();

  const isEditMode = !!variant;
  const isPending = isAdding || isUpdating;

  useEffect(() => {
    if (variant) {
      setFormData({
        variant_type: variant.variant_type,
        variant_name: variant.variant_name,
        sku: variant.sku || "",
        price: variant.price,
        original_price: variant.original_price,
        stock_quantity: variant.stock_quantity,
        display_order: variant.display_order,
        is_active: variant.is_active,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [variant, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateVariantRequest = {
      ...formData,
      price: Number(formData.price) || 0,
      original_price: formData.original_price ? Number(formData.original_price) : undefined,
      stock_quantity: Number(formData.stock_quantity) || 0,
      display_order: Number(formData.display_order) || 0,
    };

    if (isEditMode && variant) {
      updateVariant(
        { productId, variantId: variant.id, data },
        {
          onSuccess: () => {
            onClose();
            setFormData(initialFormState);
          },
        }
      );
    } else {
      addVariant(
        { productId, data },
        {
          onSuccess: () => {
            onClose();
            setFormData(initialFormState);
          },
        }
      );
    }
  };

  const statusOptions = [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
        {isEditMode ? "Edit Variant" : "Add Variant"}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variant_type">Variant Type *</Label>
              <Input
                type="text"
                id="variant_type"
                value={formData.variant_type ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, variant_type: e.target.value }))}
                placeholder="e.g., Size, Color, Weight"
                required
              />
            </div>
            <div>
              <Label htmlFor="variant_name">Variant Name *</Label>
              <Input
                type="text"
                id="variant_name"
                value={formData.variant_name ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, variant_name: e.target.value }))}
                placeholder="e.g., Small, Red, 500g"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              type="text"
              id="sku"
              value={formData.sku || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
              placeholder="Auto-generated if empty"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                type="number"
                id="price"
                value={formData.price || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="original_price">Original Price (₹)</Label>
              <Input
                type="number"
                id="original_price"
                value={formData.original_price || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, original_price: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="For discount display"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                type="number"
                id="stock_quantity"
                value={formData.stock_quantity || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                placeholder="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="is_active">Status</Label>
              <Select
                options={statusOptions}
                defaultValue={String(formData.is_active)}
                onChange={(val) => setFormData((prev) => ({ ...prev, is_active: val === "true" }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              type="number"
              id="display_order"
              value={formData.display_order || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, display_order: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-2.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !formData.variant_type || !formData.variant_name}
            className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-2.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
          >
            {isPending ? "Saving..." : isEditMode ? "Update Variant" : "Add Variant"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VariantModal;
