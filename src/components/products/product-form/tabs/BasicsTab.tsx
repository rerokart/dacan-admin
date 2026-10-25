import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import Select from "@/components/form/Select";
import BrandPicker from "@/components/brands/BrandPicker";
import type { CategoryOption } from "@/utils/categoryOptions";
import { SHORT_NAME_MAX } from "@/utils/productRules";
import type { Product, WritableProductStatus } from "@/services/product.service";
import FieldError from "../fields/FieldError";
import type { TabProps } from "./types";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft (being prepared)" },
  { value: "active", label: "Active (visible to customers)" },
  { value: "inactive", label: "Inactive (temporarily hidden)" },
];

export default function BasicsTab({ form, set, errors, isCreate, isArchived, skuLocked, baseline, categoryOptions, loadingCategories }: TabProps & {
  isCreate: boolean;
  isArchived: boolean;
  skuLocked: boolean;
  baseline?: Product;
  categoryOptions: CategoryOption[];
  loadingCategories: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={form.name}
          error={!!errors.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Enter product name"
        />
        <FieldError error={errors.name} />
      </div>

      <div>
        <Label htmlFor="short_name">Short Name</Label>
        <Input
          id="short_name"
          value={form.short_name}
          maxLength={SHORT_NAME_MAX}
          onChange={(e) => set("short_name", e.target.value)}
          placeholder="Shown where space is tight"
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {form.short_name.length}/{SHORT_NAME_MAX}
        </p>
      </div>

      <div>
        <Label htmlFor="sku">SKU</Label>
        <Input
          id="sku"
          value={form.sku}
          disabled={skuLocked}
          error={!!errors.sku}
          onChange={(e) => set("sku", e.target.value.toUpperCase())}
          placeholder={isCreate ? "Leave empty for PRD-000123" : ""}
        />
        <p className={`mt-1 text-xs ${errors.sku ? "text-error-500" : "text-gray-500"}`}>
          {errors.sku?.message ??
            (skuLocked
              ? "Used by orders or stock history, so it can't be changed"
              : isCreate
                ? "Leave empty to generate one"
                : "A-Z, 0-9 and hyphens")}
        </p>
      </div>

      {!isCreate && (
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={baseline?.slug ?? ""} disabled />
        </div>
      )}

      <div>
        <Label htmlFor="category">Category *</Label>
        {loadingCategories ? (
          <div className="flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <span className="text-sm text-gray-500">Loading categories...</span>
          </div>
        ) : (
          <Select
            id="category"
            options={categoryOptions}
            placeholder="Select Category"
            value={form.category_id}
            onChange={(val) => set("category_id", val)}
          />
        )}
        {!loadingCategories && categoryOptions.length === 0 && (
          <p className="mt-1 text-xs text-gray-500">
            Add a subcategory first: products go on subcategories.
          </p>
        )}
        <FieldError error={errors.category_id} />
      </div>

      <div>
        <Label htmlFor="brand">Brand</Label>
        <BrandPicker
          id="brand"
          value={form.brand_id}
          onChange={(id) => set("brand_id", id)}
          currentBrand={baseline?.brand ? { id: baseline.brand.id, name: baseline.brand.name } : null}
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        {isArchived ? (
          <Input id="status" value="Archived" disabled />
        ) : (
          <Select
            id="status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(val) => set("status", val as WritableProductStatus)}
          />
        )}
        <p className="mt-1 text-xs text-gray-500">
          Active needs a category, a price above 0 and a short description.
        </p>
      </div>

      <div className="flex items-center pt-6">
        <Checkbox
          id="is_featured"
          label="Featured product"
          checked={form.is_featured}
          onChange={(v) => set("is_featured", v)}
        />
      </div>
    </div>
  );
}
