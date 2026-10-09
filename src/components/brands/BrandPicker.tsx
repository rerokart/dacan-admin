"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useBrand, useBrands } from "@/hooks/useBrands";
import { usePermissions } from "@/context/AuthContext";
import { preventEnterSubmit } from "@/utils/formHelpers";
import BrandFormModal from "@/components/brands/BrandFormModal";

export interface BrandPickerProps {
  value: string | null;
  onChange: (id: string | null) => void;
  /** The product's saved brand; stays visible (and selectable) even if inactive */
  currentBrand?: { id: string; name: string } | null;
  disabled?: boolean;
  /** pick: active brands, "No brand", "+ Add new". filter: every brand, "All brands", no add. */
  mode?: "pick" | "filter";
  /** id of the picker's button, for a <Label htmlFor> */
  id?: string;
}

interface SelectedBrand {
  id: string;
  name: string;
  inactive: boolean;
}

export default function BrandPicker({
  value,
  onChange,
  currentBrand,
  disabled,
  mode = "pick",
  id,
}: BrandPickerProps) {
  const { can } = usePermissions();
  const canView = can("brands.view");
  const isFilter = mode === "filter";
  const emptyLabel = isFilter ? "All brands" : "No brand";
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  // Brand the user just chose or created: drives the label until a refetch says otherwise
  const [picked, setPicked] = useState<SelectedBrand | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const { data } = useBrands(
    {
      ...(isFilter ? {} : { status: "active" as const }),
      limit: 100,
      ...(debounced ? { search: debounced } : {}),
    },
    { enabled: canView }
  );
  const brands = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? brands.length;

  // The selected brand's own record (not the search-filtered list) tells us if it is inactive
  const needsDetail = !!value && picked?.id !== value;
  const { data: detail } = useBrand(value ?? "", { enabled: canView && needsDetail });

  const selected = useMemo<SelectedBrand | null>(() => {
    if (!value) return null;
    if (picked?.id === value) return picked;
    if (detail?.id === value) {
      return { id: value, name: detail.name, inactive: detail.status === "inactive" };
    }
    const hit = brands.find((b) => b.id === value);
    if (hit) return { id: hit.id, name: hit.name, inactive: hit.status === "inactive" };
    if (currentBrand?.id === value) return { id: value, name: currentBrand.name, inactive: false };
    return { id: value, name: "Selected brand", inactive: false };
  }, [value, picked, detail, brands, currentBrand]);

  const options = useMemo(() => {
    const list: SelectedBrand[] = brands.map((b) => ({
      id: b.id,
      name: b.name,
      inactive: b.status === "inactive",
    }));
    // Keep the selected brand reachable when it is not in the list (e.g. inactive in pick mode)
    if (selected && !list.some((o) => o.id === selected.id)) {
      const needle = debounced.trim().toLowerCase();
      if (!needle || selected.name.toLowerCase().includes(needle)) list.unshift(selected);
    }
    return list;
  }, [brands, selected, debounced]);

  const choose = (b: SelectedBrand | null) => {
    setPicked(b);
    onChange(b ? b.id : null);
    setOpen(false);
  };

  if (!canView) {
    return (
      <div>
        <div id={id} className="flex h-11 w-full items-center rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90">
          {value ? (currentBrand?.id === value ? currentBrand.name : "Selected brand") : emptyLabel}
        </div>
        <p className="mt-1 text-xs text-gray-500">You can&apos;t browse brands</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 text-left text-sm text-gray-800 focus:border-brand-500 focus:outline-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected ? selected.name + (selected.inactive ? " (inactive)" : "") : emptyLabel}
        </span>
        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="p-2">
            <input
              type="text"
              autoFocus
              onKeyDown={preventEnterSubmit}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                onClick={() => choose(null)}
                className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {emptyLabel}
              </button>
            </li>
            {options.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => choose(o)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    o.id === value ? "font-medium text-brand-600" : "text-gray-800 dark:text-white/90"
                  }`}
                >
                  {o.name}
                  {o.inactive && <span className="ml-1 text-gray-500">(inactive)</span>}
                </button>
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-500">No matching brands</li>
            )}
          </ul>
          {total > brands.length && (
            <p className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-gray-700">
              Showing {brands.length} of {total}. Type to search
            </p>
          )}
          {!isFilter && can("brands.create") && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setShowCreate(true);
              }}
              className="w-full border-t border-gray-200 px-4 py-2 text-left text-sm font-medium text-brand-600 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              + Add new brand
            </button>
          )}
        </div>
      )}

      <BrandFormModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={(b) => {
          setPicked({ id: b.id, name: b.name, inactive: b.status === "inactive" });
          onChange(b.id);
        }}
      />
    </div>
  );
}
