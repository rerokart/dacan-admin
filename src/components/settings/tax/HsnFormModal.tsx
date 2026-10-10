"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useCreateHsnCode, useGstRates, useUpdateHsnCode } from "@/hooks/useTaxSettings";
import type { HsnCode } from "@/services/taxSettings.service";
import { primaryBtn, secondaryBtn } from "./styles";

const HSN_RE = /^[0-9]{4}([0-9]{2}){0,2}$/;
const DESCRIPTION_MAX = 200;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Row to edit; omit to add. */
  hsn?: HsnCode | null;
}

export default function HsnFormModal({ isOpen, onClose, hsn }: Props) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8 m-4">
      <Body key={hsn?.code ?? "new"} hsn={hsn} onClose={onClose} />
    </Modal>
  );
}

function Body({ hsn, onClose }: { hsn?: HsnCode | null; onClose: () => void }) {
  const isEdit = !!hsn;
  const { data: rates = [] } = useGstRates();
  const [code, setCode] = useState(hsn?.code ?? "");
  const [description, setDescription] = useState(hsn?.description ?? "");
  const [rate, setRate] = useState(hsn ? String(hsn.gst_rate) : "");
  const { mutateAsync: create, isPending: creating } = useCreateHsnCode();
  const { mutateAsync: update, isPending: updating } = useUpdateHsnCode();
  const busy = creating || updating;

  const rateOptions = rates
    .filter((r) => r.is_active || (hsn && r.rate === hsn.gst_rate))
    .sort((a, b) => a.rate - b.rate)
    .map((r) => ({ value: String(r.rate), label: `${r.rate}% (${r.label})` }));

  const codeTrim = code.trim();
  const codeError = !isEdit && codeTrim && !HSN_RE.test(codeTrim) ? "HSN/SAC code must be 4, 6 or 8 digits" : undefined;
  const descError =
    description.trim().length > DESCRIPTION_MAX ? `Description must be ${DESCRIPTION_MAX} characters or fewer` : undefined;
  const invalid = !!codeError || !!descError || !HSN_RE.test(codeTrim) || rate === "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) return;
    try {
      if (isEdit) {
        const data: { description?: string; gst_rate?: number } = {};
        if (description.trim() !== hsn!.description) data.description = description.trim();
        if (Number(rate) !== hsn!.gst_rate) data.gst_rate = Number(rate);
        if (Object.keys(data).length) await update({ code: hsn!.code, data });
      } else {
        await create({ code: codeTrim, description: description.trim(), gst_rate: Number(rate) });
      }
      onClose();
    } catch {
      // toast shown by hook; keep the modal open
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? "Edit HSN code" : "Add HSN code"}
      </h3>
      <div>
        <Label htmlFor="hsn-code">HSN / SAC code *</Label>
        <Input
          type="text"
          inputMode="numeric"
          id="hsn-code"
          value={code}
          maxLength={8}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          error={!!codeError}
          disabled={isEdit}
          placeholder="4, 6 or 8 digits"
        />
        {codeError ? (
          <p className="mt-1 text-xs text-error-500">{codeError}</p>
        ) : isEdit ? (
          <p className="mt-1 text-xs text-gray-500">The code can&apos;t be changed.</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="hsn-description">Description</Label>
        <Input
          type="text"
          id="hsn-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={!!descError}
          placeholder="Optional"
        />
        {descError && <p className="mt-1 text-xs text-error-500">{descError}</p>}
      </div>
      <div>
        <Label htmlFor="hsn-rate">GST rate *</Label>
        <Select id="hsn-rate" options={rateOptions} value={rate} onChange={setRate} placeholder="Select a rate" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className={secondaryBtn}>
          Cancel
        </button>
        <button type="submit" disabled={busy || invalid} className={primaryBtn}>
          {busy ? "Saving..." : isEdit ? "Save changes" : "Add HSN code"}
        </button>
      </div>
    </form>
  );
}
