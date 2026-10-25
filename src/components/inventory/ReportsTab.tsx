"use client";

import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { usePermissions } from "@/context/AuthContext";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import { flattenCategoryOptions } from "@/utils/categoryOptions";
import { useDownloadReport, useInventoryReportList } from "@/hooks/useInventoryReports";
import type { ReportDef, ReportFilterDef } from "@/services/inventory.service";

export default function ReportsTab() {
  const { can } = usePermissions();
  const canSeeCost = can("products.view_cost");
  const { data, isLoading, error } = useInventoryReportList();

  // Cost reports are not listed without the cost permission (the server refuses them too).
  const reports = (data ?? []).filter((r) => !r.needs_cost_permission || (canSeeCost && r.allowed));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">Failed to load reports. Please try again.</div>;
  }
  if (reports.length === 0) {
    return <div className="py-12 text-center text-gray-500">No reports are available for your role.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-2">
      {reports.map((r) => (
        <ReportCard key={r.key} report={r} />
      ))}
    </div>
  );
}

function ReportCard({ report }: { report: ReportDef }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const { mutate, isPending, variables } = useDownloadReport();
  const busy = isPending && variables?.key === report.key;

  const missing = report.filters.some((f) => f.required && !(values[f.name] ?? "").trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (missing || busy) return;
    const filters: Record<string, string> = {};
    for (const f of report.filters) {
      const v = (values[f.name] ?? "").trim();
      if (v) filters[f.name] = v;
    }
    mutate({ key: report.key, filters });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">{report.title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{report.description}</p>

      {report.filters.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {report.filters.map((f) => {
            const id = `rep-${report.key}-${f.name}`;
            return (
              <div key={f.name}>
                <Label htmlFor={id}>
                  {f.label}
                  {f.required ? " *" : ""}
                </Label>
                <FilterInput
                  id={id}
                  def={f}
                  value={values[f.name] ?? ""}
                  onChange={(v) => setValues((prev) => ({ ...prev, [f.name]: v }))}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={missing || busy}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {busy ? "Preparing..." : "Download Excel"}
        </button>
      </div>
    </form>
  );
}

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "low_stock,out_of_stock", label: "Low and out of stock" },
];

function CategorySelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const { data } = useCategories();
  const options = flattenCategoryOptions(data);
  return <Select id={id} options={[{ value: "", label: "All categories" }, ...options]} value={value} onChange={onChange} />;
}

function BrandSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const { data } = useBrands({ limit: 100 });
  const options = (data?.data ?? []).map((b) => ({ value: b.id, label: b.name }));
  return <Select id={id} options={[{ value: "", label: "All brands" }, ...options]} value={value} onChange={onChange} />;
}

/** Category and brand get pickers when the role may read them; the rest are plain fields. */
function FilterInput({
  id,
  def,
  value,
  onChange,
}: {
  id: string;
  def: ReportFilterDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const { can } = usePermissions();
  if (def.name === "category" && can("categories.view")) return <CategorySelect id={id} value={value} onChange={onChange} />;
  if (def.name === "brand" && can("brands.view")) return <BrandSelect id={id} value={value} onChange={onChange} />;
  if (def.name === "status") return <Select id={id} options={STATUS_OPTIONS} value={value} onChange={onChange} />;
  return (
    <Input
      id={id}
      type={def.type === "date" ? "date" : def.type === "number" ? "number" : "text"}
      min={def.type === "number" ? "0" : undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={def.type === "uuid" ? "ID (optional)" : undefined}
    />
  );
}
