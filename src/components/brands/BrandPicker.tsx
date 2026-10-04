"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useBrands } from "@/hooks/useBrands";
import { usePermissions } from "@/context/AuthContext";
import { preventEnterSubmit } from "@/utils/formHelpers";
import BrandFormModal from "@/components/brands/BrandFormModal";

export interface BrandPickerProps {
  value: string | null;
  onChange: (id: string | null) => void;
  /** The product's saved brand; stays visible (and selectable) even if inactive */
  currentBrand?: { id: string; name: string } | null;
  disabled?: boolean;
}

export default function BrandPicker({ value, onChange, currentBrand, disabled }: BrandPickerProps) {
  const { can } = usePermissions();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  // Brand just created in the modal, shown before the list refetches
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);
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

  const { data } = useBrands({ status: "active", limit: 100, ...(debounced ? { search: debounced } : {}) });
  const brands = useMemo(() => data?.data ?? [], [data]);

  const options = useMemo(() => {
    const list: { id: string; name: string; inactive?: boolean }[] = brands.map((b) => ({
      id: b.id,
      name: b.name,
    }));
    const extra = [currentBrand, created].filter(
      (b): b is { id: string; name: string } => !!b
    );
    const needle = debounced.trim().toLowerCase();
    for (const b of extra) {
      if (list.some((o) => o.id === b.id)) continue;
      if (needle && !b.name.toLowerCase().includes(needle)) continue;
      // Not in the active list: for the current brand that means inactive
      list.unshift({ id: b.id, name: b.name, inactive: b.id === currentBrand?.id && b.id !== created?.id });
    }
    return list;
  }, [brands, currentBrand, created, debounced]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const hit = options.find((o) => o.id === value);
    if (hit) return hit.name + (hit.inactive ? " (inactive)" : "");
    if (created?.id === value) return created.name;
    if (currentBrand?.id === value) {
      const isActive = brands.some((b) => b.id === value);
      return currentBrand.name + (isActive ? "" : " (inactive)");
    }
    return "Selected brand";
  }, [value, options, created, currentBrand, brands]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 text-left text-sm text-gray-800 focus:border-brand-500 focus:outline-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        <span className={selectedLabel ? "" : "text-gray-400"}>{selectedLabel ?? "No brand"}</span>
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
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                No brand
              </button>
            </li>
            {options.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
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
          {can("brands.create") && (
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
          setCreated({ id: b.id, name: b.name });
          onChange(b.id);
        }}
      />
    </div>
  );
}
