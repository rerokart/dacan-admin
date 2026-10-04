"use client";

import React, { useMemo, useRef, useState } from "react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import {
  useAddProductImage,
  useDeleteProductImage,
  useReorderProductImages,
  useUpdateProductImage,
  useUploadProductImage,
} from "@/hooks/useProducts";
import {
  IMAGE_ACCEPT,
  IMAGE_ALT_MAX,
  IMAGE_TYPES,
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
  MIN_IMAGE_SIDE,
} from "@/utils/productRules";
import type { Product, ProductImage, UpdateImageRequest } from "@/services/product.service";

interface ImageManagerProps {
  product: Product;
}

const ACCEPTED_TYPES = IMAGE_ACCEPT.split(",");

/** Client check before upload; the server re-checks the real content. */
const fileProblem = (file: File): string | null => {
  if (!ACCEPTED_TYPES.includes(file.type)) return `${file.name}: use a PNG, JPEG, WebP or GIF image`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name} is larger than 2 MB`;
  return null;
};

const toFormData = (file: File) => {
  const data = new FormData();
  data.append("image", file);
  return data;
};

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((id) => b.includes(id));

const moveId = (ids: string[], from: number, to: number) => {
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const selectClass =
  "h-9 w-full rounded-lg border border-gray-300 bg-transparent px-2 text-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const smallButton =
  "rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800";

export default function ImageManager({ product }: ImageManagerProps) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { mutateAsync: uploadImage } = useUploadProductImage();
  const { mutateAsync: addImage } = useAddProductImage();
  const { mutate: updateImage, mutateAsync: updateImageAsync } = useUpdateProductImage();
  const { mutate: reorderImages } = useReorderProductImages();
  const { mutate: deleteImage } = useDeleteProductImage();

  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
  // Order shown while a reorder is saved; ignored once the image set changes.
  const [pendingOrder, setPendingOrder] = useState<string[] | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);

  const serverImages = useMemo(() => product.images ?? [], [product.images]);
  const images: ProductImage[] = useMemo(() => {
    const ids = serverImages.map((i) => i.id);
    if (!pendingOrder || !sameIds(pendingOrder, ids)) return serverImages;
    const byId = new Map(serverImages.map((i) => [i.id, i]));
    return pendingOrder.map((id) => byId.get(id) as ProductImage);
  }, [serverImages, pendingOrder]);

  const hasOptions = (product.options?.length ?? 0) > 0;
  const variantChoices = useMemo(
    () =>
      (product.variants ?? [])
        .filter((v) => !v.is_default)
        .map((v) => ({
          id: v.id,
          label: `${(v.option_values ?? []).map((ov) => ov.value).join(" / ") || v.sku} (${v.sku})`,
        })),
    [product.variants]
  );
  const remaining = MAX_IMAGES - images.length;

  const update = (image: ProductImage, data: UpdateImageRequest) =>
    updateImage({ productId: product.id, imageId: image.id, data });

  const reorder = (ids: string[]) => {
    if (ids.every((id, i) => id === images[i]?.id)) return;
    setPendingOrder(ids);
    reorderImages(
      { productId: product.id, imageIds: ids },
      { onError: () => setPendingOrder(null) }
    );
  };

  const moveBy = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    reorder(moveId(images.map((i) => i.id), index, target));
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = images.map((i) => i.id);
    reorder(moveId(ids, ids.indexOf(dragId), ids.indexOf(targetId)));
    setDragId(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // the same file can be picked again
    if (!files.length) return;

    const found: string[] = [];
    const valid = files.filter((file) => {
      const problem = fileProblem(file);
      if (problem) found.push(problem);
      return !problem;
    });
    if (valid.length > remaining) {
      found.push(
        `A product can have at most ${MAX_IMAGES} images. ${valid.length - remaining} image(s) were not added.`
      );
    }
    const toUpload = valid.slice(0, Math.max(remaining, 0));

    setUploading(true);
    let added = 0;
    for (const file of toUpload) {
      try {
        const uploaded = await uploadImage(toFormData(file));
        await addImage({ productId: product.id, data: { ...uploaded, image_type: "main" } });
        added += 1;
      } catch (error) {
        found.push(`${file.name}: ${(error as Error).message}`);
      }
    }
    setUploading(false);
    setProblems(found);
    if (added) toast.success(`${added} image(s) added`);
  };

  const startReplace = (image: ProductImage) => {
    replaceTarget.current = image.id;
    replaceInput.current?.click();
  };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const imageId = replaceTarget.current;
    if (!file || !imageId) return;
    const problem = fileProblem(file);
    if (problem) {
      setProblems([problem]);
      return;
    }
    setProblems([]);
    setReplacingId(imageId);
    try {
      const uploaded = await uploadImage(toFormData(file));
      // Replace keeps the image's position, primary flag, alt text and links.
      await updateImageAsync({ productId: product.id, imageId, data: uploaded });
      toast.success("Image replaced");
    } catch (error) {
      setProblems([`${file.name}: ${(error as Error).message}`]);
    } finally {
      setReplacingId(null);
    }
  };

  const handleDelete = async (image: ProductImage, position: number) => {
    const ok = await confirm({
      title: "Delete image",
      message: image.is_primary
        ? `Delete image ${position}? It is the primary image; the next image becomes primary.`
        : `Delete image ${position}?`,
      variant: "danger",
      confirmText: "Delete",
    });
    if (ok) deleteImage({ productId: product.id, imageId: image.id });
  };

  const saveAlt = (image: ProductImage) => {
    const draft = altDrafts[image.id];
    if (draft === undefined) return;
    const next = draft.trim();
    if (next !== (image.alt_text ?? "")) update(image, { alt_text: next || null });
    setAltDrafts((prev) => {
      const rest = { ...prev };
      delete rest[image.id];
      return rest;
    });
  };

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Up to {MAX_IMAGES} images, PNG, JPEG, WebP or GIF, at most 2 MB and at least {MIN_IMAGE_SIDE} × {MIN_IMAGE_SIDE}{" "}
        px. Drag to reorder (or use the arrows). The starred image is shown first in lists.
      </p>

      {images.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={image.id}
              onDragOver={(e) => {
                if (dragId) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(image.id);
              }}
              className={`rounded-xl border p-3 transition ${
                dragId === image.id
                  ? "border-brand-300 opacity-50"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <div
                draggable
                onDragStart={(e) => {
                  setDragId(image.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDragId(null)}
                className="relative aspect-square cursor-move overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.thumb_url || image.image_url}
                  alt={image.alt_text || `Image ${index + 1}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
                <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 text-xs text-white">{index + 1}</span>
                <button
                  type="button"
                  aria-label={image.is_primary ? "Primary image" : `Make image ${index + 1} primary`}
                  aria-pressed={image.is_primary}
                  title={image.is_primary ? "Primary image" : "Make primary"}
                  disabled={image.is_primary}
                  onClick={() => update(image, { is_primary: true })}
                  className={`absolute right-2 top-2 rounded-full bg-white/90 p-1 text-lg leading-none shadow dark:bg-gray-900/90 ${
                    image.is_primary ? "text-warning-500" : "text-gray-400 hover:text-warning-500"
                  }`}
                >
                  {image.is_primary ? "★" : "☆"}
                </button>
                {replacingId === image.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs dark:bg-gray-900/70">
                    Replacing…
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1">
                  <button type="button" className={smallButton} disabled={index === 0} onClick={() => moveBy(index, -1)} aria-label={`Move image ${index + 1} earlier`}>
                    ←
                  </button>
                  <button
                    type="button"
                    className={smallButton}
                    disabled={index === images.length - 1}
                    onClick={() => moveBy(index, 1)}
                    aria-label={`Move image ${index + 1} later`}
                  >
                    →
                  </button>
                </div>
                <div className="flex gap-1">
                  <button type="button" className={smallButton} disabled={!!replacingId} onClick={() => startReplace(image)}>
                    Replace
                  </button>
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                    onClick={() => handleDelete(image, index + 1)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-2 space-y-2">
                <label className="block text-xs text-gray-500">
                  Type
                  <select
                    value={image.image_type || "main"}
                    onChange={(e) => update(image, { image_type: e.target.value })}
                    className={`${selectClass} mt-1`}
                  >
                    {IMAGE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                {hasOptions && (
                  <label className="block text-xs text-gray-500">
                    Variant
                    <select
                      value={image.variant_id ?? ""}
                      onChange={(e) => update(image, { variant_id: e.target.value || null })}
                      className={`${selectClass} mt-1`}
                    >
                      <option value="">All variants</option>
                      {variantChoices.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="block text-xs text-gray-500">
                  <span className="flex justify-between">
                    Alt text
                    <span className="text-gray-400">
                      {(altDrafts[image.id] ?? image.alt_text ?? "").length}/{IMAGE_ALT_MAX}
                    </span>
                  </span>
                  <input
                    type="text"
                    value={altDrafts[image.id] ?? image.alt_text ?? ""}
                    maxLength={IMAGE_ALT_MAX}
                    placeholder="Describe the image"
                    onChange={(e) => setAltDrafts((prev) => ({ ...prev, [image.id]: e.target.value }))}
                    onBlur={() => saveAlt(image)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveAlt(image);
                      }
                    }}
                    className={`${selectClass} mt-1 px-3`}
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      {problems.length > 0 && (
        <ul role="alert" className="mt-4 space-y-1 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
          {problems.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      )}

      <label
        htmlFor="product-images-upload"
        className={`mt-4 flex h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 ${
          remaining <= 0 || uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {uploading
            ? "Uploading…"
            : remaining <= 0
              ? `${MAX_IMAGES} of ${MAX_IMAGES} images: delete one to add another`
              : "Click to add images"}
        </span>
        <span className="mt-1 text-xs text-gray-500">
          {images.length}/{MAX_IMAGES} used
        </span>
        <input
          id="product-images-upload"
          type="file"
          className="hidden"
          accept={IMAGE_ACCEPT}
          multiple
          disabled={remaining <= 0 || uploading}
          onChange={handleUpload}
        />
      </label>

      <input ref={replaceInput} type="file" className="hidden" accept={IMAGE_ACCEPT} onChange={handleReplace} />
    </div>
  );
}
