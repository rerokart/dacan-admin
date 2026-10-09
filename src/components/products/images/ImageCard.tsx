import type React from "react";
import { IMAGE_ALT_MAX, IMAGE_TYPES } from "@/utils/productRules";
import type { ProductImage, UpdateImageRequest } from "@/services/product.service";

const selectClass =
  "h-9 w-full rounded-lg border border-gray-300 bg-transparent px-2 text-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const smallButton =
  "rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800";

interface ImageCardProps {
  image: ProductImage;
  index: number;
  /** Number of images in the list */
  total: number;
  dragId: string | null;
  setDragId: React.Dispatch<React.SetStateAction<string | null>>;
  onDrop: (targetId: string) => void;
  moveBy: (index: number, delta: number) => void;
  replacingId: string | null;
  onReplace: (image: ProductImage) => void;
  onDelete: (image: ProductImage, position: number) => void;
  update: (image: ProductImage, data: UpdateImageRequest) => void;
  hasOptions: boolean;
  variantChoices: { id: string; label: string }[];
  /** Unsaved alt text, if the field is being edited */
  altDraft: string | undefined;
  onAltChange: (value: string) => void;
  onAltSave: (image: ProductImage) => void;
  /** Archived product: show the image and its details, no controls */
  readOnly?: boolean;
}

const typeLabel = (type: string) => type.charAt(0).toUpperCase() + type.slice(1);

export default function ImageCard({
  image,
  index,
  total,
  dragId,
  setDragId,
  onDrop,
  moveBy,
  replacingId,
  onReplace,
  onDelete,
  update,
  hasOptions,
  variantChoices,
  altDraft,
  onAltChange,
  onAltSave,
  readOnly = false,
}: ImageCardProps) {
  if (readOnly) {
    const variantLabel = variantChoices.find((v) => v.id === image.variant_id)?.label;
    return (
      <li className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.thumb_url || image.image_url}
            alt={image.alt_text || `Image ${index + 1}`}
            className="h-full w-full object-cover"
          />
          <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 text-xs text-white">{index + 1}</span>
          {image.is_primary && (
            <span
              title="Primary image"
              aria-label="Primary image"
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-lg leading-none text-warning-500 shadow dark:bg-gray-900/90"
            >
              ★
            </span>
          )}
        </div>
        <dl className="mt-2 space-y-1 text-xs text-gray-500">
          <div>
            <dt className="inline">Type: </dt>
            <dd className="inline text-gray-700 dark:text-gray-300">{image.image_type ? typeLabel(image.image_type) : "Not set"}</dd>
          </div>
          {hasOptions && (
            <div>
              <dt className="inline">Variant: </dt>
              <dd className="inline text-gray-700 dark:text-gray-300">{variantLabel ?? "All variants"}</dd>
            </div>
          )}
          <div>
            <dt className="inline">Alt text: </dt>
            <dd className="inline text-gray-700 dark:text-gray-300">{image.alt_text || "-"}</dd>
          </div>
        </dl>
      </li>
    );
  }

  return (
    <li
      onDragOver={(e) => {
        if (dragId) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(image.id);
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
            disabled={index === total - 1}
            onClick={() => moveBy(index, 1)}
            aria-label={`Move image ${index + 1} later`}
          >
            →
          </button>
        </div>
        <div className="flex gap-1">
          <button type="button" className={smallButton} disabled={!!replacingId} onClick={() => onReplace(image)}>
            Replace
          </button>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
            onClick={() => onDelete(image, index + 1)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        <label className="block text-xs text-gray-500">
          Type
          <select
            value={image.image_type || ""}
            onChange={(e) => update(image, { image_type: e.target.value })}
            className={`${selectClass} mt-1`}
          >
            {/* Images added after the first have no type until one is picked */}
            <option value="" disabled>
              Not set
            </option>
            {IMAGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {typeLabel(t)}
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
              {(altDraft ?? image.alt_text ?? "").length}/{IMAGE_ALT_MAX}
            </span>
          </span>
          <input
            type="text"
            value={altDraft ?? image.alt_text ?? ""}
            maxLength={IMAGE_ALT_MAX}
            placeholder="Describe the image"
            onChange={(e) => onAltChange(e.target.value)}
            onBlur={() => onAltSave(image)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAltSave(image);
              }
            }}
            className={`${selectClass} mt-1 px-3`}
          />
        </label>
      </div>
    </li>
  );
}
