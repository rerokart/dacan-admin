"use client";

import React, { useEffect, useRef, useState } from "react";
import Input from "@/components/form/input/InputField";
import { useStockLevels } from "@/hooks/useInventory";
import type { StockItem } from "@/services/inventory.service";

export interface PickedVariant {
  product_id: string;
  variant_id: string;
  label: string;
  sku: string;
}

interface Props {
  id?: string;
  value: PickedVariant | null;
  onChange: (v: PickedVariant | null) => void;
  placeholder?: string;
  error?: boolean;
}

export const toPicked = (item: StockItem): PickedVariant => ({
  product_id: item.product_id,
  variant_id: item.variant_id ?? item.id,
  label: `${item.name}${item.variant_info ? ` - ${item.variant_info}` : ""}`,
  sku: item.sku,
});

/** Search box over the stock list; picks one product or variant row. */
export default function VariantPicker({ id, value, onChange, placeholder = "Search product or SKU", error }: Props) {
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text.trim()), 300);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const { data, isFetching } = useStockLevels(
    { search: debounced, limit: 8 },
    { enabled: debounced.length >= 2 && !value }
  );
  const results = data?.inventory ?? [];

  if (value) {
    return (
      <div className="flex h-11 items-center justify-between gap-2 rounded-lg border border-gray-300 px-4 text-sm dark:border-gray-700 dark:text-white/90">
        <span className="truncate">
          {value.label} <span className="text-gray-500">({value.sku})</span>
        </span>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setText("");
          }}
          className="shrink-0 text-xs font-medium text-brand-500 hover:text-brand-600"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <Input
        id={id}
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        error={error}
        autoComplete="off"
      />
      {open && debounced.length >= 2 && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {isFetching && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">Searching...</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">No items found</p>
          ) : (
            results.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => {
                  onChange(toPicked(item));
                  setOpen(false);
                }}
                className="block w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.variant_info ? `${item.variant_info} · ` : ""}
                  {item.sku}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
