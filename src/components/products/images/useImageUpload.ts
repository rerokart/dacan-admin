"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useAddProductImage, useUpdateProductImage, useUploadProductImage } from "@/hooks/useProducts";
import { MAX_IMAGES } from "@/utils/productRules";
import { imageFileProblem } from "@/utils/imageCheck";
import type { Product, ProductImage } from "@/services/product.service";

/** Client check before upload (type, size, pixel size); the server re-checks the real content. */
const fileProblem = async (file: File): Promise<string | null> => {
  const problem = await imageFileProblem(file);
  return problem ? `${file.name}: ${problem}` : null;
};

const toFormData = (file: File) => {
  const data = new FormData();
  data.append("image", file);
  return data;
};

/** Adding new images and replacing one in place. `remaining` is how many more images fit. */
export function useImageUpload(product: Product, remaining: number) {
  const { toast } = useToast();
  const { mutateAsync: uploadImage } = useUploadProductImage({ silentError: true });
  const { mutateAsync: addImage } = useAddProductImage({ silentError: true });
  const { mutateAsync: updateImageAsync } = useUpdateProductImage({ silentError: true });

  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // the same file can be picked again
    if (!files.length) return;

    setUploading(true);
    const found: string[] = [];
    const checks = await Promise.all(files.map(fileProblem));
    const valid = files.filter((file, i) => {
      if (checks[i]) found.push(checks[i] as string);
      return !checks[i];
    });
    if (valid.length > remaining) {
      found.push(
        `A product can have at most ${MAX_IMAGES} images. ${valid.length - remaining} image(s) were not added.`
      );
    }
    const toUpload = valid.slice(0, Math.max(remaining, 0));

    // Only a product's very first image is typed "main"; later ones have no type until the admin picks one.
    const hadImages = (product.images?.length ?? 0) > 0;
    let added = 0;
    for (const file of toUpload) {
      try {
        const uploaded = await uploadImage(toFormData(file));
        const data = !hadImages && added === 0 ? { ...uploaded, image_type: "main" } : uploaded;
        await addImage({ productId: product.id, data });
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
    const problem = await fileProblem(file);
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
