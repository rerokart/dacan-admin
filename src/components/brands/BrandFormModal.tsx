"use client";

import React, { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import { useCreateBrand, useUpdateBrand, useUploadBrandLogo } from "@/hooks/useBrands";
import { useToast } from "@/components/ui/toast";
import { MAX_IMAGE_BYTES } from "@/utils/productRules";
import type { Brand, BrandStatus } from "@/services/brand.service";

const NAME_MIN = 2;
const NAME_MAX = 80;

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Brand to edit; omit to create */
  brand?: Brand | null;
  /** Called with the saved brand (created or updated) */
  onSaved?: (brand: Brand) => void;
}

export default function BrandFormModal({ isOpen, onClose, brand, onSaved }: BrandFormModalProps) {
  // Portal to <body>: BrandPicker sits inside the product <form>, and forms can't nest.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  // Remount the body per open/brand so state resets without effects.
  if (!isOpen || !mounted) return null;
  return createPortal(
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8 m-4">
      <BrandFormBody key={brand?.id ?? "new"} brand={brand} onClose={onClose} onSaved={onSaved} />
    </Modal>,
    document.body
  );
}

function BrandFormBody({
  brand,
  onClose,
  onSaved,
}: {
  brand?: Brand | null;
  onClose: () => void;
  onSaved?: (brand: Brand) => void;
}) {
  const { toast } = useToast();
  const isEdit = !!brand;
  const [name, setName] = useState(brand?.name ?? "");
  const [description, setDescription] = useState(brand?.description ?? "");
  const [status, setStatus] = useState<BrandStatus>(brand?.status ?? "active");
  const [logoUrl, setLogoUrl] = useState<string | null>(brand?.logo_url ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { mutateAsync: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutateAsync: updateBrand, isPending: isUpdating } = useUpdateBrand();
  const { mutateAsync: uploadLogo, isPending: isUploading } = useUploadBrandLogo();
  const isBusy = isCreating || isUpdating || isUploading;

  const trimmed = name.trim();
  const nameError =
    name && (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX)
      ? `Name must be ${NAME_MIN}-${NAME_MAX} characters`
      : undefined;

  const handleFile = (f?: File) => {
    if (!f) return;
    if (f.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be 2 MB or smaller");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const removeLogo = () => {
    setFile(null);
    setPreview(null);
    setLogoUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (nameError || trimmed.length < NAME_MIN) return;

    let finalLogo = logoUrl;
    if (file) {
      try {
        const fd = new FormData();
        fd.append("logo", file);
        finalLogo = (await uploadLogo(fd)).logo_url;
      } catch {
        return; // toast shown by hook
      }
    }

    const payload = {
      name: trimmed,
      description: description.trim() || null,
      status,
      logo_url: finalLogo,
    };

    try {
      const saved = isEdit
        ? await updateBrand({ id: brand!.id, data: payload })
        : await createBrand(payload);
      onSaved?.(saved);
      onClose();
    } catch {
      // toast shown by hook; keep the modal open
    }
  };

  const src = preview ?? logoUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? "Edit brand" : "Add brand"}
      </h3>

      <div>
        <Label htmlFor="brand-name">Name *</Label>
        <Input
          type="text"
          id="brand-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!nameError}
          placeholder="e.g. Godrej"
          required
        />
        {nameError && <p className="mt-1 text-xs text-error-500">{nameError}</p>}
      </div>

      <div>
        <Label htmlFor="brand-description">Description</Label>
        <TextArea
          id="brand-description"
          placeholder="Optional"
          rows={3}
          value={description}
          onChange={(val) => setDescription(val)}
        />
      </div>

      <div>
        <Label htmlFor="brand-status">Status</Label>
        <Select
          id="brand-status"
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive (can't be picked for new products)" },
          ]}
          value={status}
          onChange={(val) => setStatus(val as BrandStatus)}
        />
      </div>

      <div>
        <Label htmlFor="brand-logo">Logo</Label>
        {src ? (
          <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Logo preview" className="h-full w-full object-contain" />
            <button
              type="button"
              onClick={removeLogo}
              className="absolute top-1 right-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ) : (
          <label
            htmlFor="brand-logo"
            className="flex h-24 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Click to upload
            <input
              id="brand-logo"
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        )}
        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF or WebP. Max 2 MB.</p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isBusy || trimmed.length < NAME_MIN || !!nameError}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : isBusy ? "Saving..." : isEdit ? "Save changes" : "Create brand"}
        </button>
      </div>
    </form>
  );
}
