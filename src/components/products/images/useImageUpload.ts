"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useAddProductImage, useUpdateProductImage, useUploadProductImage } from "@/hooks/useProducts";
import { IMAGE_ACCEPT, MAX_IMAGES, MAX_IMAGE_BYTES } from "@/utils/productRules";
import type { Product, ProductImage } from "@/services/product.service";

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

/** Adding new images and replacing one in place. `remaining` is how many more images fit. */
export function useImageUpload(product: Product, remaining: number) {
  const { toast } = useToast();
  const { mutateAsync: uploadImage } = useUploadProductImage();
  const { mutateAsync: addImage } = useAddProductImage();
  const { mutateAsync: updateImageAsync } = useUpdateProductImage();

  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);

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

  return { uploading, replacingId, problems, replaceInput, handleUpload, startReplace, handleReplace };
}
