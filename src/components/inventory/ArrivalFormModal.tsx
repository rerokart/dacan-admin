"use client";

import React, { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import MarginReadout from "@/components/products/product-form/fields/MarginReadout";
import { TAX_READ_PERMISSIONS } from "@/components/products/product-form/tabs/PricingTab";
import { usePermissions } from "@/context/AuthContext";
import { useCreateArrival } from "@/hooks/useArrivals";
import { useProduct } from "@/hooks/useProducts";
import { useGstRates, useTaxSettings } from "@/hooks/useTaxSettings";
import { costWithGst } from "@/utils/margin";
import { rupees } from "@/utils/productFormat";
import VariantPicker, { type PickedVariant } from "./VariantPicker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const today = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function ArrivalFormModal({ isOpen, onClose }: Props) {
  // Remount the body per open so state resets without effects.
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-8 m-4 max-h-[92vh] overflow-y-auto">
      <Body onClose={onClose} />
    </Modal>
  );
}

function Body({ onClose }: { onClose: () => void }) {
  const { can } = usePermissions();
  const canReadTax = can(TAX_READ_PERMISSIONS);
  const { data: settings } = useTaxSettings({ enabled: canReadTax });
  const { data: rates } = useGstRates({ enabled: canReadTax });
  const { mutate, isPending } = useCreateArrival();

  const [picked, setPicked] = useState<PickedVariant | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  // null = the user has not touched the rate, so the variant's / product's rate is used
  const [rateChoice, setRateChoice] = useState<string | null>(null);
  const [supplier, setSupplier] = useState("");
  const [batch, setBatch] = useState("");
  const [mfg, setMfg] = useState("");
  const [exp, setExp] = useState("");
  const [received, setReceived] = useState(today());
  const [note, setNote] = useState("");

  const { data: product } = useProduct(picked?.product_id ?? "");
  const variant = product?.variants?.find((v) => v.id === picked?.variant_id);
  const defaultRate =
    variant?.cost_gst_rate ?? product?.gst_rate ?? settings?.default_gst_rate ?? null;
  const rate = rateChoice ?? (defaultRate === null ? "" : String(defaultRate));

  const rateOptions = useMemo(() => {
    const opts = (rates ?? [])
      .filter((r) => r.is_active || String(r.rate) === rate)
      .sort((a, b) => a.rate - b.rate)
      .map((r) => ({ value: String(r.rate), label: `${r.rate}% (${r.label})` }));
    return opts;
  }, [rates, rate]);

  const qtyNum = Number(quantity);
  const qtyError =
    quantity.trim() !== "" && (!/^\d+$/.test(quantity.trim()) || qtyNum < 1)
      ? "Enter a whole number of 1 or more"
      : undefined;
  const costError =
    unitCost.trim() !== "" && !/^\d+(\.\d{1,2})?$/.test(unitCost.trim())
      ? "Enter an amount with at most 2 decimals"
      : undefined;
  const supplierTrim = supplier.trim();
  const supplierError =
    supplier !== "" && (supplierTrim.length < 2 || supplierTrim.length > 120)
      ? "Supplier name must be 2 to 120 characters"
      : undefined;
  const dateError = mfg && exp && exp <= mfg ? "Expiry date must be after the manufacturing date" : undefined;

  const invalid =
    !picked ||
    quantity.trim() === "" ||
    !!qtyError ||
    unitCost.trim() === "" ||
    !!costError ||
    supplierTrim.length < 2 ||
    !!supplierError ||
    !!dateError ||
    !received;

  const withGst = unitCost.trim() && !costError ? costWithGst(unitCost, rate === "" ? null : rate) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid || !picked) return;
    mutate(
      {
        product_id: picked.product_id,
        variant_id: picked.variant_id,
        quantity: qtyNum,
        unit_cost: Number(unitCost),
        ...(rate !== "" ? { purchase_gst_rate: Number(rate) } : {}),
        supplier_name: supplierTrim,
        ...(batch.trim() ? { batch_no: batch.trim() } : {}),
        ...(mfg ? { manufactured_on: mfg } : {}),
        ...(exp ? { expires_on: exp } : {}),
        received_on: received,
        ...(note.trim() ? { note: note.trim() } : {}),
      },
      { onSuccess: onClose }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Record stock arrival</h3>

      <div>
        <Label htmlFor="arr-item">Product or variant *</Label>
        <VariantPicker id="arr-item" value={picked} onChange={(v) => { setPicked(v); setRateChoice(null); }} />
      </div>

      <div>
        <Label htmlFor="arr-qty">Quantity *</Label>
        <Input
          id="arr-qty"
          type="text"
          inputMode="numeric"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={!!qtyError}
        />
        {qtyError ? (
          <p className="mt-1 text-xs text-error-500">{qtyError}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            Enter only goods in good condition. Record damaged goods separately as a correction.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="arr-cost">Cost per unit (without GST) *</Label>
          <Input
            id="arr-cost"
            type="text"
            inputMode="decimal"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            error={!!costError}
          />
          {costError && <p className="mt-1 text-xs text-error-500">{costError}</p>}
        </div>
        <div>
          <Label htmlFor="arr-rate">Purchase GST rate</Label>
          <Select
            id="arr-rate"
            options={rateOptions}
            value={rate}
            onChange={(v) => setRateChoice(v)}
            placeholder={canReadTax ? "Choose a rate" : "Product's rate"}
          />
        </div>
      </div>

      {withGst !== null &&
        (settings && variant && variant.price != null ? (
          <MarginReadout
            price={String(variant.price)}
            cost={unitCost}
            gstRate={product?.gst_rate ?? settings.default_gst_rate}
            costGstRate={rate === "" ? null : rate}
            pricesIncludeGst={settings.prices_include_gst}
          />
        ) : (
          <p className="text-xs tabular-nums text-gray-500 dark:text-gray-400">Cost with GST {rupees(withGst)}</p>
        ))}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="arr-supplier">Supplier *</Label>
          <Input
            id="arr-supplier"
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            error={!!supplierError}
          />
          {supplierError && <p className="mt-1 text-xs text-error-500">{supplierError}</p>}
        </div>
        <div>
          <Label htmlFor="arr-batch">Batch</Label>
          <Input id="arr-batch" type="text" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="arr-mfg">Manufacturing date</Label>
          <Input id="arr-mfg" type="date" value={mfg} onChange={(e) => setMfg(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="arr-exp">Expiry date</Label>
          <Input id="arr-exp" type="date" value={exp} onChange={(e) => setExp(e.target.value)} error={!!dateError} />
        </div>
        <div>
          <Label htmlFor="arr-received">Received date *</Label>
          <Input id="arr-received" type="date" value={received} onChange={(e) => setReceived(e.target.value)} />
        </div>
      </div>
      {dateError && <p className="-mt-2 text-xs text-error-500">{dateError}</p>}

      <div>
        <Label htmlFor="arr-note">Note</Label>
        <TextArea id="arr-note" rows={2} value={note} onChange={(v) => setNote(v)} placeholder="Optional" />
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
          {isPending ? "Saving..." : "Record arrival"}
        </button>
      </div>
    </form>
  );
}
