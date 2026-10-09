"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { flattenCategoryOptions } from "@/utils/categoryOptions";
import { num } from "@/utils/productFormat";
import type { CreateProductRequest, Product, UpdateProductRequest } from "@/services/product.service";
import {
  type FormState,
  type TabKey,
  TAB_ORDER,
  defaultVariantOf,
  sameValue,
  toFormState,
  toPayload,
  followServer,
} from "./product-form/formState";
import { type FieldErrors, validate } from "./product-form/validate";
import Notice from "./product-form/fields/Notice";
import BasicsTab from "./product-form/tabs/BasicsTab";
import PricingTab from "./product-form/tabs/PricingTab";
import IdentityTab from "./product-form/tabs/IdentityTab";
import ContentTab from "./product-form/tabs/ContentTab";
import SpecsTab from "./product-form/tabs/SpecsTab";
import LimitsTab from "./product-form/tabs/LimitsTab";

interface ProductFormProps {
  mode: "create" | "edit";
  initial?: Product;
  /** Called with the saved product (create / update response) */
  onDone: (product: Product) => void;
  /** Archived product: every field is disabled and Save is hidden */
  readOnly?: boolean;
}

export default function ProductForm({ mode, initial, onDone, readOnly = false }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  // The saved product the edit diff is measured against; moves on after each save.
  const [baseline, setBaseline] = useState<Product | undefined>(initial);
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [tab, setTab] = useState<TabKey>("basics");
  const [showErrors, setShowErrors] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // The edit page keeps this form mounted across refetches (keyed on the product id only).
  // Follow two server changes while rendering, without an effect:
  // - options added or all removed (new default variant): reset the pricing fields, and let
  //   untouched fields follow the server (removing all options can change the product SKU);
  // - archived or restored: nothing could be edited meanwhile, so start from the saved product.
  const [synced, setSynced] = useState({
    defaultVariantId: initial?.default_variant_id ?? null,
    archived: initial?.status === "archived",
  });
  if (mode === "edit" && initial) {
    const defaultVariantId = initial.default_variant_id ?? null;
    const archived = initial.status === "archived";
    if (archived !== synced.archived) {
      setSynced({ defaultVariantId, archived });
      setBaseline(initial);
      setForm(toFormState(initial));
      setShowErrors(false);
      setProblems([]);
    } else if (defaultVariantId !== synced.defaultVariantId) {
      const oldSaved = toFormState(baseline);
      const fresh = toFormState(initial);
      setSynced({ defaultVariantId, archived });
      setBaseline(initial);
      setForm((prev) => followServer(prev, oldSaved, fresh));
      setWarnings([]);
      setProblems([]);
    }
  }

  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const isCreate = mode === "create";
  const isArchived = baseline?.status === "archived";
  // Price / stock / identifiers live on the default variant: only simple products have one.
  const hasPricing = isCreate || !!baseline?.default_variant_id;
  const skuLocked = !isCreate && !!defaultVariantOf(baseline)?.sku_locked;
  const categoryOptions = useMemo(() => flattenCategoryOptions(categories), [categories]);

  const errors = useMemo(
    () => validate(form, hasPricing, isCreate, baseline?.sku ?? ""),
    [form, hasPricing, isCreate, baseline?.sku]
  );
  const shownErrors: FieldErrors = showErrors ? errors : {};
  const errorsByTab = useMemo(() => {
    const tabs = new Set<TabKey>();
    Object.values(errors).forEach((e) => e && tabs.add(e.tab));
    return tabs;
  }, [errors]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleError = (error: Error & { problems?: string[] }) => {
    // The hook already toasts the message.
    setProblems(error.problems ?? []);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (readOnly) return;
    setShowErrors(true);
    setProblems([]);
    setWarnings([]);

    const count = Object.values(errors).filter(Boolean).length;
    if (count) {
      const firstTab = TAB_ORDER.find((key) => errorsByTab.has(key));
      if (firstTab) setTab(firstTab);
      toast.error(`Fix ${count} field${count === 1 ? "" : "s"}`);
      return;
    }

    const payload = toPayload(form, hasPricing);

    if (isCreate) {
      const data: CreateProductRequest = { ...payload, name: payload.name ?? "", category_id: form.category_id };
      if (data.price === null) delete data.price;
      const stock = num(form.stock_quantity);
      if (stock) data.stock_quantity = stock;
      createProduct(data, {
        onSuccess: (product) => {
          (product.warnings ?? []).forEach((w) => toast.warning(w));
          onDone(product);
        },
        onError: handleError,
      });
      return;
    }

    // Edit: send only what changed (an untouched field is never re-validated,
    // and stock is never sent: it changes from Inventory).
    const before = toPayload(toFormState(baseline), hasPricing);
    const changed = Object.fromEntries(
      Object.entries(payload).filter(
        ([key, value]) => !sameValue(value, before[key as keyof UpdateProductRequest])
      )
    ) as UpdateProductRequest;
    if (isArchived) delete changed.status;
    if (Object.keys(changed).length === 0) {
      toast.info("No changes to save");
      return;
    }
    updateProduct(
      { id: baseline!.id, data: changed },
      {
        onSuccess: (product) => {
          setBaseline(product);
          setForm(toFormState(product));
          setShowErrors(false);
          setWarnings(product.warnings ?? []);
          onDone(product);
        },
        onError: handleError,
      }
    );
  };

  const isBusy = isCreating || isUpdating;
  const defaultVariant = defaultVariantOf(baseline);
  const tabLabel = (key: TabKey, label: string) => (
    <span className="flex items-center gap-1.5">
      {label}
      {showErrors && errorsByTab.has(key) && <span className="h-1.5 w-1.5 rounded-full bg-error-500" aria-label="has errors" />}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabList className="overflow-x-auto">
          <Tab value="basics">{tabLabel("basics", "Basics")}</Tab>
          <Tab value="pricing">{tabLabel("pricing", "Pricing & stock")}</Tab>
          <Tab value="identity">{tabLabel("identity", "Identity")}</Tab>
          <Tab value="content">{tabLabel("content", "Content")}</Tab>
          <Tab value="specs">{tabLabel("specs", "Specifications")}</Tab>
          <Tab value="limits">{tabLabel("limits", "Purchase limits")}</Tab>
        </TabList>
        {/* min-w-0: a fieldset otherwise grows to fit wide content */}
        <fieldset disabled={readOnly} className="min-w-0">
          <TabPanel value="basics" className="pt-6">
            <BasicsTab
              form={form}
              set={set}
              errors={shownErrors}
              isCreate={isCreate}
              isArchived={isArchived}
              skuLocked={skuLocked}
              baseline={baseline}
              categoryOptions={categoryOptions}
              loadingCategories={loadingCategories}
            />
          </TabPanel>
          <TabPanel value="pricing" className="pt-6">
            <PricingTab
              form={form}
              set={set}
              errors={shownErrors}
              hasPricing={hasPricing}
              isCreate={isCreate}
              baseline={baseline}
              defaultVariant={defaultVariant}
            />
          </TabPanel>
          <TabPanel value="identity" className="pt-6">
            <IdentityTab form={form} set={set} errors={shownErrors} />
          </TabPanel>
          <TabPanel value="content" className="pt-6">
            <ContentTab form={form} set={set} errors={shownErrors} />
          </TabPanel>
          <TabPanel value="specs" className="pt-6">
            <SpecsTab form={form} set={set} errors={shownErrors} />
          </TabPanel>
          <TabPanel value="limits" className="pt-6">
            {/* All errors, not only shown ones: the quantity rule is inline from the start */}
            <LimitsTab form={form} set={set} errors={errors} />
          </TabPanel>
        </fieldset>
      </Tabs>

      {problems.length > 0 && <Notice tone="error" title="Can't publish this product yet" items={problems} />}
      {warnings.length > 0 && <Notice tone="warning" title="Saved, but please check" items={warnings} />}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
        >
          Cancel
        </button>
        {!readOnly && (
          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-50"
          >
            {isBusy ? "Saving..." : isCreate ? "Create Product" : "Save Product"}
          </button>
        )}
      </div>
    </form>
  );
}
