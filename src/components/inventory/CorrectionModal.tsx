"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import { useCorrectStock } from "@/hooks/useInventory";
import type { CorrectionReason } from "@/services/inventory.service";
import { CORRECTION_REASONS } from "./inventoryTabs";

export interface CorrectionTarget {
  product_id: string;
  variant_id: string | null;
  name: string;
  current_stock: number;
}

interface Props {
  target: CorrectionTarget | null;
  onClose: () => void;
}

export default function CorrectionModal({ target, onClose }: Props) {
  // Remount the body per open so state resets without effects.
  if (!target) return null;
  return (
    <Modal isOpen onClose={onClose} className="max-w-md p-6 sm:p-8 m-4">
      <Body key={`${target.product_id}-${target.variant_id}`} target={target} onClose={onClose} />
    </Modal>
  );
}

function Body({ target, onClose }: { target: CorrectionTarget; onClose: () => void }) {
  const [reason, setReason] = useState<CorrectionReason | "">("");
  const [change, setChange] = useState("");
  const [note, setNote] = useState("");
  const { mutate, isPending } = useCorrectStock();

  const trimmedChange = change.trim();
  const num = Number(trimmedChange);
  const isWhole = /^-?\d+$/.test(trimmedChange);
  const changeError =
    trimmedChange === ""
      ? undefined
      : !isWhole
      ? "Enter a whole number"
      : num === 0
      ? "The change can't be 0"
      : target.current_stock + num < 0
      ? `Stock can't go below 0 (current stock is ${target.current_stock})`
      : undefined;

  const trimmedNote = note.trim();
  const noteRequired = reason === "other";
  const noteError =
    (noteRequired && trimmedNote.length < 3) || (trimmedNote && (trimmedNote.length < 3 || trimmedNote.length > 300))
      ? "Note must be 3 to 300 characters" + (noteRequired ? " (required for Other)" : "")
      : undefined;

  const invalid =
    !reason || trimmedChange === "" || !!changeError || !isWhole || num === 0 || !!noteError;
  const result = isWhole && !changeError ? target.current_stock + num : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid || !reason) return;
    mutate(
      {
        product_id: target.product_id,
        variant_id: target.variant_id,
        quantity_change: num,
        reason,
        ...(trimmedNote ? { note: trimmedNote } : {}),
      },
      { onSuccess: onClose }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Correct stock</h3>
        <p className="mt-1 text-sm text-gray-500">{target.name}</p>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <p className="text-sm text-gray-500">Current stock</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{target.current_stock}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">After the change</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{result ?? "-"}</p>
        </div>
      </div>

      <div>
        <Label htmlFor="corr-reason">Reason *</Label>
        <Select
          id="corr-reason"
          options={CORRECTION_REASONS.map((r) => ({ value: r.value, label: r.label }))}
          value={reason}
          onChange={(v) => setReason(v as CorrectionReason)}
          placeholder="Select reason"
        />
      </div>

      <div>
        <Label htmlFor="corr-change">Quantity change *</Label>
        <Input
          id="corr-change"
          type="text"
          inputMode="numeric"
          value={change}
          onChange={(e) => setChange(e.target.value)}
          error={!!changeError}
          placeholder="e.g. -3 to remove 3, 5 to add 5"
        />
        {changeError ? (
          <p className="mt-1 text-xs text-error-500">{changeError}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            Use a minus sign to take stock out. For goods that arrived, use Arrivals instead.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="corr-note">Note{noteRequired ? " *" : ""}</Label>
        <TextArea id="corr-note" rows={3} value={note} onChange={(v) => setNote(v)} placeholder="What happened?" />
        {noteError && <p className="mt-1 text-xs text-error-500">{noteError}</p>}
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
          disabled={isPending || invalid}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Correct stock"}
        </button>
      </div>
    </form>
  );
}
