"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Checkbox from "@/components/form/input/Checkbox";
import Select from "@/components/form/Select";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useUploadCategoryImage,
} from "@/hooks/useCategories";
import { useToast } from "@/components/ui/toast";
import { parentCategoryOptions, subtreeHeight } from "@/utils/categoryOptions";
import { imageFileProblem } from "@/utils/imageCheck";
import type {
  Category,
  CreateCategoryRequest,
  WritableCategoryStatus,
} from "@/services/category.service";

const CODE_PATTERN = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const generateCode = (name: string): string =>
  name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20)
    .replace(/-$/, "");

type ImageKind = "icon_url" | "thumbnail_url" | "banner_url";

const IMAGE_SLOTS: { key: ImageKind; label: string; hint: string; wide?: boolean }[] = [
  { key: "icon_url", label: "Icon", hint: "Square, small. Used in the home grid and menus." },
  { key: "thumbnail_url", label: "Thumbnail", hint: "Square. Used in category lists." },
  { key: "banner_url", label: "Banner", hint: "Wide (about 3:1). Shown at the top of the category page.", wide: true },
];

interface FormState {
  name: string;
  code: string;
  slug: string;
  description: string;
  parent_id: string;
  display_order: number;
  status: WritableCategoryStatus;
  show_on_app: boolean;
  show_on_web: boolean;
  show_in_pos: boolean;
  is_featured: boolean;
  featured_order: number;
  icon_url: string | null;
  thumbnail_url: string | null;
  banner_url: string | null;
}

const toFormState = (category?: Category): FormState => ({
  name: category?.name ?? "",
  code: category?.code ?? "",
  slug: category?.slug ?? "",
  description: category?.description ?? "",
  parent_id: category?.parent_id ?? "",
  display_order: category?.display_order ?? 0,
  status: category && category.status !== "archived" ? category.status : "active",
  show_on_app: category?.show_on_app ?? true,
  show_on_web: category?.show_on_web ?? true,
  show_in_pos: category?.show_in_pos ?? true,
  is_featured: category?.is_featured ?? false,
  featured_order: category?.featured_order ?? 0,
  icon_url: category?.icon_url ?? null,
  thumbnail_url: category?.thumbnail_url ?? null,
  banner_url: category?.banner_url ?? null,
});

const toPayload = (state: FormState): CreateCategoryRequest => ({
  name: state.name,
  slug: state.slug || generateSlug(state.name),
  code: state.code || undefined,
  description: state.description || null,
  parent_id: state.parent_id || null,
  display_order: state.display_order,
  status: state.status,
  show_on_app: state.show_on_app,
  show_on_web: state.show_on_web,
  show_in_pos: state.show_in_pos,
  is_featured: state.is_featured,
  featured_order: state.featured_order,
  icon_url: state.icon_url,
  thumbnail_url: state.thumbnail_url,
  banner_url: state.banner_url,
});

interface CategoryFormProps {
  mode: "create" | "edit";
  initial?: Category;
  onDone: () => void;
}

export default function CategoryForm({ mode, initial, onDone }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const startState = useMemo(() => toFormState(initial), [initial]);
  const [form, setForm] = useState<FormState>(startState);
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [files, setFiles] = useState<Partial<Record<ImageKind, File>>>({});
  const [previews, setPreviews] = useState<Partial<Record<ImageKind, string>>>({});

  const { data: categories } = useCategories();
  // Edit mode only: the server counts archived descendants when it checks the
  // 3-level limit, so the height has to come from the tree that includes them.
  const { data: fullTree } = useCategories(
    mode === "edit" ? { include_archived: true } : undefined
  );
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadCategoryImage();

  const isArchived = initial?.status === "archived";
  const codeLocked = mode === "edit" && (initial?.direct_product_count ?? 0) > 0;
  const selfHeight = useMemo(
    () => (mode === "edit" && initial ? subtreeHeight(fullTree, initial.id) : 1),
    [mode, initial, fullTree]
  );
  const parentOptions = useMemo(
    () => parentCategoryOptions(categories, initial?.id, selfHeight),
    [categories, initial?.id, selfHeight]
  );
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const parentStatusOf = (parentId: string): Category["status"] | undefined => {
    let found: Category["status"] | undefined;
    const visit = (nodes: Category[]) =>
      nodes.forEach((node) => {
        if (node.id === parentId) found = node.status;
        else if (node.children?.length) visit(node.children);
      });
    visit(categories ?? []);
    return found;
  };

  // A category can't be Active under a parent that isn't Active.
  const handleParentChange = (parentId: string) => {
    const parentStatus = parentId ? parentStatusOf(parentId) : undefined;
    if (parentStatus && parentStatus !== "active" && form.status === "active") {
      setStatusNote(
        `Parent is ${parentStatus === "draft" ? "Draft" : "Inactive"}, so this starts as Draft`
      );
      setForm((prev) => ({ ...prev, parent_id: parentId, status: "draft" }));
      return;
    }
    set("parent_id", parentId);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setForm((prev) => ({
        ...prev,
        name,
        ...(autoSlug ? { slug: generateSlug(name) } : {}),
      }));
    },
    [autoSlug]
  );

  const handleFile = async (key: ImageKind, file?: File) => {
    if (!file) return;
    // Category icons can be small: no minimum size, only the 50 MP ceiling.
    const problem = await imageFileProblem(file, { minSide: 0 });
    if (problem) {
      toast.error(problem);
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviews((prev) => ({ ...prev, [key]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const removeImage = (key: ImageKind) => {
    setFiles((prev) => ({ ...prev, [key]: undefined }));
    setPreviews((prev) => ({ ...prev, [key]: undefined }));
    set(key, null);
  };

  const codeError =
    mode === "edit" && !codeLocked && !form.code
      ? "Code can't be empty"
      : form.code && !(CODE_PATTERN.test(form.code) && form.code.length >= 2 && form.code.length <= 20)
        ? "2-20 characters: A-Z, 0-9 and single hyphens (e.g. HW-LOCK)"
        : undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Upload changed images first; stop (keeping the form) if one fails.
    const uploaded: Partial<Record<ImageKind, string>> = {};
    for (const slot of IMAGE_SLOTS) {
      const file = files[slot.key];
      if (!file) continue;
      try {
        uploaded[slot.key] = (await uploadImage(file)).image_url;
      } catch {
        return; // Error toast shown by hook
      }
    }

    const payload = toPayload({ ...form, ...uploaded });

    if (mode === "create") {
      createCategory(payload, { onSuccess: onDone });
      return;
    }

    // Edit: send only what changed, so an unchanged code or status is
    // never re-validated by the server.
    const before = toPayload(toFormState(initial));
    const changed = Object.fromEntries(
      Object.entries(payload).filter(
        ([key, value]) => value !== before[key as keyof CreateCategoryRequest]
      )
    ) as Partial<CreateCategoryRequest>;
    if (isArchived) {
      delete changed.status;
      delete changed.parent_id;
      delete changed.show_on_app;
      delete changed.show_on_web;
      delete changed.show_in_pos;
      delete changed.is_featured;
      delete changed.featured_order;
    }
    if (Object.keys(changed).length === 0) {
      onDone();
      return;
    }
    updateCategory({ id: initial!.id, data: changed }, { onSuccess: onDone });
  };

  const isBusy = isCreating || isUpdating || isUploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {isArchived && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
          This category is archived. Restore it to change its status, parent, channels or featured.
        </div>
      )}

      {/* Basics */}
      <section>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Basics</h4>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Label htmlFor="name">Category Name *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleNameChange}
              placeholder="Enter category name"
              required
            />
          </div>

          <div>
            <Label htmlFor="code">Category Code</Label>
            <Input
              type="text"
              id="code"
              name="code"
              value={form.code}
              disabled={codeLocked}
              error={!!codeError}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              // Suggestion only: an empty code is generated (and de-duplicated,
              // e.g. HINGES-2) by the server.
              placeholder={generateCode(form.name) || "HW-LOCK"}
            />
            <p className={`mt-1 text-xs ${codeError ? "text-error-500" : "text-gray-500"}`}>
              {codeLocked
                ? "Can't change once products use this category"
                : codeError ??
                  (mode === "create"
                    ? "Unique short code, e.g. HW-LOCK. Leave empty to generate from the name."
                    : "Unique short code, e.g. HW-LOCK.")}
            </p>
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              type="text"
              id="slug"
              name="slug"
              value={form.slug}
              onChange={(e) => {
                setAutoSlug(false);
                set("slug", e.target.value);
              }}
              placeholder="category-slug"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate from name</p>
          </div>

          <div className="lg:col-span-2">
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              placeholder="Enter category description"
              rows={4}
              value={form.description}
              onChange={(val) => set("description", val)}
            />
          </div>
        </div>
      </section>

      {/* Placement */}
      <section>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Placement</h4>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Label htmlFor="parent">Parent Category</Label>
            {isArchived ? (
              <Input type="text" id="parent" value={initial?.path?.slice(0, -1).map((p) => p.name).join(" › ") || "None (main category)"} disabled />
            ) : (
              <Select
                id="parent"
                options={parentOptions}
                value={form.parent_id}
                onChange={handleParentChange}
              />
            )}
            <p className="mt-1 text-xs text-gray-500">
              Up to 3 levels: Category › Subcategory › Product type
            </p>
          </div>

          <div>
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              type="number"
              id="display_order"
              name="display_order"
              min="0"
              value={String(form.display_order)}
              onChange={(e) => set("display_order", parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>
      </section>

      {/* Status */}
      <section>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Status</h4>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Label htmlFor="status">Status</Label>
            {isArchived ? (
              <Input type="text" id="status" value="Archived" disabled />
            ) : (
              <Select
                id="status"
                options={[
                  { value: "active", label: "Active (visible to customers)" },
                  { value: "draft", label: "Draft (being prepared)" },
                  { value: "inactive", label: "Inactive (temporarily hidden)" },
                ]}
                value={form.status}
                onChange={(val) => {
                  setStatusNote(null);
                  set("status", val as WritableCategoryStatus);
                }}
              />
            )}
            {statusNote && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{statusNote}</p>}
          </div>
        </div>
      </section>

      {/* Visibility */}
      <section>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Visibility</h4>
        <div className="flex flex-wrap gap-6">
          <Checkbox id="show_on_app" label="Show on App" checked={form.show_on_app} onChange={(v) => set("show_on_app", v)} disabled={isArchived} />
          <Checkbox id="show_on_web" label="Show on Website" checked={form.show_on_web} onChange={(v) => set("show_on_web", v)} disabled={isArchived} />
          <Checkbox id="show_in_pos" label="Show in Store (POS)" checked={form.show_in_pos} onChange={(v) => set("show_in_pos", v)} disabled={isArchived} />
          <Checkbox id="is_featured" label="Featured category" checked={form.is_featured} onChange={(v) => set("is_featured", v)} disabled={isArchived} />
        </div>
        {form.is_featured && (
          <div className="mt-4 max-w-xs">
            <Label htmlFor="featured_order">Featured order</Label>
            <Input
              type="number"
              id="featured_order"
              min="0"
              disabled={isArchived}
              value={String(form.featured_order)}
              onChange={(e) => set("featured_order", Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>
        )}
      </section>

      {/* Images */}
      <section>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Images</h4>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {IMAGE_SLOTS.map((slot) => {
            const src = previews[slot.key] ?? form[slot.key];
            const inputId = `image-${slot.key}`;
            return (
              <div key={slot.key}>
                <Label htmlFor={inputId}>{slot.label}</Label>
                {src ? (
                  <div className={`relative overflow-hidden rounded-lg ${slot.wide ? "h-24 w-full" : "h-24 w-24"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${slot.label} preview`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(slot.key)}
                      className="absolute top-1 right-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor={inputId}
                    className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload</p>
                    <input
                      id={inputId}
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={(e) => handleFile(slot.key, e.target.files?.[0])}
                    />
                  </label>
                )}
                <p className="mt-1 text-xs text-gray-500">{slot.hint} Max 2 MB.</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isBusy || !form.name || !!codeError}
          className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : isBusy ? "Saving..." : "Save Category"}
        </button>
      </div>
    </form>
  );
}
