"use client";

import React, { useMemo, useState } from "react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useDeleteProductImage, useUpdateProductImage } from "@/hooks/useProducts";
import { IMAGE_ACCEPT, MAX_IMAGES, MIN_IMAGE_SIDE } from "@/utils/productRules";
import type { Product, ProductImage, UpdateImageRequest } from "@/services/product.service";
import ImageCard from "./images/ImageCard";
import ImageUploadZone from "./images/ImageUploadZone";
import { useImageOrder } from "./images/useImageOrder";
import { useImageUpload } from "./images/useImageUpload";

interface ImageManagerProps {
  product: Product;
}

export default function ImageManager({ product }: ImageManagerProps) {
  const { confirm } = useConfirm();
  const { mutate: updateImage } = useUpdateProductImage();
  const { mutate: deleteImage } = useDeleteProductImage();

  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
  const { images, dragId, setDragId, moveBy, handleDrop } = useImageOrder(product);

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
  const { uploading, replacingId, problems, replaceInput, handleUpload, startReplace, handleReplace } =
    useImageUpload(product, remaining);

  const update = (image: ProductImage, data: UpdateImageRequest) =>
    updateImage({ productId: product.id, imageId: image.id, data });

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
            <ImageCard
              key={image.id}
              image={image}
              index={index}
              total={images.length}
              dragId={dragId}
              setDragId={setDragId}
              onDrop={handleDrop}
              moveBy={moveBy}
              replacingId={replacingId}
              onReplace={startReplace}
              onDelete={handleDelete}
              update={update}
              hasOptions={hasOptions}
              variantChoices={variantChoices}
              altDraft={altDrafts[image.id]}
              onAltChange={(value) => setAltDrafts((prev) => ({ ...prev, [image.id]: value }))}
              onAltSave={saveAlt}
            />
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

      <ImageUploadZone remaining={remaining} uploading={uploading} count={images.length} onUpload={handleUpload} />

      <input ref={replaceInput} type="file" className="hidden" accept={IMAGE_ACCEPT} onChange={handleReplace} />
    </div>
  );
}
