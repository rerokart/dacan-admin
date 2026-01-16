"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import { useCreateCoupon } from "@/hooks/useCoupons";
import { couponService } from "@/services/coupon.service";

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export default function AddCouponPage() {
  const router = useRouter();
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 10,
    max_discount: 0,
    min_order_value: 0,
    usage_limit: 0,
    per_user_limit: 1,
    valid_from: formatDateForInput(today),
    valid_to: formatDateForInput(nextMonth),
    is_active: true,
  });

  const { mutate: createCoupon, isPending } = useCreateCoupon();

  const handleGenerateCode = () => {
    setFormData((prev) => ({ ...prev, code: couponService.generateCode() }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      max_discount: formData.discount_type === "percentage" && formData.max_discount > 0
        ? formData.max_discount
        : undefined,
      min_order_value: formData.min_order_value > 0 ? formData.min_order_value : undefined,
      usage_limit: formData.usage_limit > 0 ? formData.usage_limit : undefined,
      per_user_limit: formData.per_user_limit > 0 ? formData.per_user_limit : undefined,
      valid_from: formData.valid_from,
      valid_to: formData.valid_to,
      is_active: formData.is_active,
    };

    createCoupon(data, {
      onSuccess: () => {
        router.push("/coupons");
      },
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Coupon" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Coupon Information
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Coupon Code */}
              <div>
                <Label htmlFor="code">Coupon Code *</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="SAVE20"
                    required
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="20% off on orders above Rs 500"
                  required
                />
              </div>

              {/* Discount Type */}
              <div>
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select
                  options={[
                    { value: "percentage", label: "Percentage (%)" },
                    { value: "fixed", label: "Fixed Amount (Rs)" },
                  ]}
                  defaultValue={formData.discount_type}
                  onChange={(val) => setFormData((prev) => ({ ...prev, discount_type: val as "percentage" | "fixed" }))}
                />
              </div>

              {/* Discount Value */}
              <div>
                <Label htmlFor="discount_value">
                  Discount Value {formData.discount_type === "percentage" ? "(%)" : "(Rs)"} *
                </Label>
                <Input
                  type="number"
                  id="discount_value"
                  name="discount_value"
                  value={String(formData.discount_value)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                  placeholder="10"
                  min="0"
                  max={formData.discount_type === "percentage" ? "100" : undefined}
                  required
                />
              </div>

              {/* Max Discount (only for percentage) */}
              {formData.discount_type === "percentage" && (
                <div>
                  <Label htmlFor="max_discount">Maximum Discount (Rs)</Label>
                  <Input
                    type="number"
                    id="max_discount"
                    name="max_discount"
                    value={String(formData.max_discount)}
                    onChange={(e) => setFormData((prev) => ({ ...prev, max_discount: parseFloat(e.target.value) || 0 }))}
                    placeholder="500"
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave as 0 for no limit
                  </p>
                </div>
              )}

              {/* Min Order Value */}
              <div>
                <Label htmlFor="min_order_value">Minimum Order Value (Rs)</Label>
                <Input
                  type="number"
                  id="min_order_value"
                  name="min_order_value"
                  value={String(formData.min_order_value)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, min_order_value: parseFloat(e.target.value) || 0 }))}
                  placeholder="500"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave as 0 for no minimum
                </p>
              </div>

              {/* Usage Limit */}
              <div>
                <Label htmlFor="usage_limit">Total Usage Limit</Label>
                <Input
                  type="number"
                  id="usage_limit"
                  name="usage_limit"
                  value={String(formData.usage_limit)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, usage_limit: parseInt(e.target.value) || 0 }))}
                  placeholder="100"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave as 0 for unlimited
                </p>
              </div>

              {/* Per User Limit */}
              <div>
                <Label htmlFor="per_user_limit">Per User Limit</Label>
                <Input
                  type="number"
                  id="per_user_limit"
                  name="per_user_limit"
                  value={String(formData.per_user_limit)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, per_user_limit: parseInt(e.target.value) || 0 }))}
                  placeholder="1"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave as 0 for unlimited
                </p>
              </div>

              {/* Valid From */}
              <div>
                <Label htmlFor="valid_from">Valid From *</Label>
                <Input
                  type="date"
                  id="valid_from"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={(e) => setFormData((prev) => ({ ...prev, valid_from: e.target.value }))}
                  required
                />
              </div>

              {/* Valid To */}
              <div>
                <Label htmlFor="valid_to">Valid Until *</Label>
                <Input
                  type="date"
                  id="valid_to"
                  name="valid_to"
                  value={formData.valid_to}
                  onChange={(e) => setFormData((prev) => ({ ...prev, valid_to: e.target.value }))}
                  min={formData.valid_from}
                  required
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
                disabled={isPending || !formData.code || !formData.description}
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
              >
                {isPending ? "Creating..." : "Save Coupon"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
