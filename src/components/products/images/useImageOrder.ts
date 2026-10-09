"use client";

import { useMemo, useState } from "react";
import { useReorderProductImages } from "@/hooks/useProducts";
import type { Product, ProductImage } from "@/services/product.service";

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((id) => b.includes(id));

const moveId = (ids: string[], from: number, to: number) => {
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/** Image order with an optimistic reorder (arrows or drag and drop). */
export function useImageOrder(product: Product) {
  const { mutate: reorderImages } = useReorderProductImages();
  // Order shown while a reorder is saved; ignored once the image set changes.
  const [pendingOrder, setPendingOrder] = useState<string[] | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const serverImages = useMemo(() => product.images ?? [], [product.images]);
  const images: ProductImage[] = useMemo(() => {
    const ids = serverImages.map((i) => i.id);
    if (!pendingOrder || !sameIds(pendingOrder, ids)) return serverImages;
    const byId = new Map(serverImages.map((i) => [i.id, i]));
    return pendingOrder.map((id) => byId.get(id) as ProductImage);
  }, [serverImages, pendingOrder]);

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

  return { images, dragId, setDragId, moveBy, handleDrop };
}
