import type React from "react";
import { IMAGE_ACCEPT, MAX_IMAGES } from "@/utils/productRules";

interface ImageUploadZoneProps {
  /** Images that can still be added */
  remaining: number;
  uploading: boolean;
  /** Images the product has now */
  count: number;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImageUploadZone({ remaining, uploading, count, onUpload }: ImageUploadZoneProps) {
  return (
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
        {count}/{MAX_IMAGES} used
      </span>
      <input
        id="product-images-upload"
        type="file"
        className="hidden"
        accept={IMAGE_ACCEPT}
        multiple
        disabled={remaining <= 0 || uploading}
        onChange={onUpload}
      />
    </label>
  );
}
