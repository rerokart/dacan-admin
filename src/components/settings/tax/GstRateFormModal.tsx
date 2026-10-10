"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useCreateGstRate, useUpdateGstRate } from "@/hooks/useTaxSettings";
import type { GstRate } from "@/services/taxSettings.service";
import { primaryBtn, secondaryBtn } from "./styles";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Rate to edit; omit to add. */
  rate?: GstRate | null;
}

export default function GstRateFormModal({ isOpen, onClose, rate }: Props) {
  // Remount the body per open so state resets without effects.
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8 m-4">
      <Body key={rate?.id ?? "new"} rate={rate} onClose={onClose} />
    </Modal>
  );
}

function Body({ rate, onClose }: { rate?: GstRate | null; onClose: () => void }) {
  const isEdit = !!rate;
  const [value, setValue] = useState(rate ? String(rate.rate) : "");
  const [label, setLabel] = useState(rate?.label ?? "");
  const { mutateAsync: create, isPending: creating } = useCreateGstRate();
  const { mutateAsync: update, isPending: updating } = useUpdateGstRate();
  const busy = creating || updating;

  const num = Number(value);
  const valueError =
    !isEdit && value.trim() !== "" && (!Number.isFinite(num) || num < 0 || num > 100 || !/^\d+(\.\d{1,2})?$/.test(value.trim()))
      ? "Enter a number from 0 to 100 with at most 2 decimals"
      : undefined;
  const trimmed = label.trim();
  const labelError = label && (trimmed.length < 2 || trimmed.length > 60) ? "Label must be 2-60 characters" : undefined;
  const invalid = !!valueError || !!labelError || trimmed.length < 2 || (!isEdit && value.trim() === "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) return;
    try {
      if (isEdit) {
        if (trimmed !== rate!.label) await update({ id: rate!.id, data: { label: trimmed } });
      } else {
        await create({ rate: num, label: trimmed });
      }
      onClose();
    } catch {
      // toast shown by hook; keep the modal open
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? "Edit GST rate" : "Add GST rate"}
      </h3>
      <div>
        <Label htmlFor="rate-value">Rate (%) *</Label>
        <Input
          type="text"
          inputMode="decimal"
          id="rate-value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error={!!valueError}
          disabled={isEdit}
          placeholder="e.g. 18"
        />
        {valueError ? (
          <p className="mt-1 text-xs text-error-500">{valueError}</p>
        ) : isEdit ? (
          <p className="mt-1 text-xs text-gray-500">The rate can&apos;t be changed. Add a new rate instead.</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="rate-label">Label *</Label>
        <Input
          type="text"
          id="rate-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          error={!!labelError}
          placeholder="e.g. Standard"
        />
        {labelError && <p className="mt-1 text-xs text-error-500">{labelError}</p>}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className={secondaryBtn}>
          Cancel
        </button>
        <button type="submit" disabled={busy || invalid} className={primaryBtn}>
          {busy ? "Saving..." : isEdit ? "Save changes" : "Add rate"}
        </button>
      </div>
    </form>
  );
}
