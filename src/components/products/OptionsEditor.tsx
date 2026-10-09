"use client";

import React, { useMemo, useState } from "react";
import Label from "@/components/form/Label";
import { useSaveOptions } from "@/hooks/useProducts";
import {
  MAX_OPTIONS,
  MAX_VALUES_PER_OPTION,
  MAX_VARIANTS,
  OPTION_NAME_MAX,
  OPTION_VALUE_MAX,
} from "@/utils/productRules";
import type { Product, SaveOptionsRequest } from "@/services/product.service";

// Local draft rows carry a key so React keeps input focus while rows move.
interface DraftValue {
  key: string;
  id?: string;
  value: string;
}

interface DraftOption {
  key: string;
  id?: string;
  name: string;
  values: DraftValue[];
  /** Text typed into the "add value" box */
  pending: string;
}

let keySeq = 0;
const newKey = () => `k${++keySeq}`;

const toDraft = (product: Product): DraftOption[] =>
  (product.options ?? []).map((o) => ({
    key: newKey(),
    id: o.id,
    name: o.name,
    pending: "",
    values: o.values.map((v) => ({ key: newKey(), id: v.id, value: v.value })),
  }));

const toRequest = (options: DraftOption[]): SaveOptionsRequest => ({
  options: options.map((o) => ({
    ...(o.id ? { id: o.id } : {}),
    name: o.name.trim(),
    values: o.values.map((v) => ({ ...(v.id ? { id: v.id } : {}), value: v.value.trim() })),
  })),
});

/** First problem with the draft, or null. The server re-checks everything. */
const checkDraft = (options: DraftOption[]): string | null => {
  const names = new Set<string>();
  for (const o of options) {
    const name = o.name.trim();
    if (!name || name.length > OPTION_NAME_MAX) return `Option names must be 1-${OPTION_NAME_MAX} characters`;
    if (names.has(name.toLowerCase())) return "Option names must be unique";
    names.add(name.toLowerCase());
    if (o.values.length === 0) return `Option ${name} needs at least one value`;
    if (o.values.length > MAX_VALUES_PER_OPTION) {
      return `Option ${name} can have at most ${MAX_VALUES_PER_OPTION} values`;
    }
    const seen = new Set<string>();
    for (const v of o.values) {
      const value = v.value.trim();
      if (!value || value.length > OPTION_VALUE_MAX) return `Values must be 1-${OPTION_VALUE_MAX} characters`;
      if (seen.has(value.toLowerCase())) return `Values of ${name} must be unique`;
      seen.add(value.toLowerCase());
    }
  }
  return null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";
const smallButton =
  "rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800";

const move = <T,>(items: T[], index: number, delta: number): T[] => {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

interface OptionsEditorProps {
  /** Mount with a key derived from product.options so a save resets the draft. */
  product: Product;
  /** Archived product: the options are listed, nothing can be changed */
  readOnly?: boolean;
}

export default function OptionsEditor({ product, readOnly = false }: OptionsEditorProps) {
  const [options, setOptions] = useState<DraftOption[]>(() => toDraft(product));
  const [dirty, setDirty] = useState(false);
  const [showProblem, setShowProblem] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutate: saveOptions, isPending } = useSaveOptions({ silentError: true });

  const isSimple = !!product.default_variant_id;
  const problem = useMemo(() => checkDraft(options), [options]);
  const combinations = useMemo(
    () => (options.length ? options.reduce((n, o) => n * Math.max(o.values.length, 1), 1) : 0),
    [options]
  );

  const change = (next: DraftOption[]) => {
    setOptions(next);
    setDirty(true);
    setServerError(null);
  };
  const updateOption = (index: number, patch: Partial<DraftOption>) =>
    change(options.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  // Typing in the "add value" box is not an edit of the saved set.
  const setPending = (index: number, pending: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, pending } : o)));

  const addValue = (index: number) => {
    const option = options[index];
    const value = option.pending.trim();
    if (!value) return;
    if (option.values.some((v) => v.value.trim().toLowerCase() === value.toLowerCase())) {
      setPending(index, "");
      return;
    }
    if (option.values.length >= MAX_VALUES_PER_OPTION) return;
    updateOption(index, {
      pending: "",
      values: [...option.values, { key: newKey(), value: value.slice(0, OPTION_VALUE_MAX) }],
    });
  };

  /** The draft with any value still typed in an "add value" box included. */
  const withPending = (list: DraftOption[]): DraftOption[] =>
    list.map((o) => {
      const value = o.pending.trim();
      if (!value || o.values.some((v) => v.value.trim().toLowerCase() === value.toLowerCase())) {
        return { ...o, pending: "" };
      }
      return { ...o, pending: "", values: [...o.values, { key: newKey(), value }] };
    });
  const hasPending = options.some((o) => o.pending.trim());

  const handleSave = () => {
    const final = withPending(options);
    setOptions(final);
    setShowProblem(true);
    setServerError(null);
    if (checkDraft(final)) return;
    saveOptions(
      { productId: product.id, data: toRequest(final) },
      {
        // The page remounts this editor when the saved options change.
        onSuccess: () => setDirty(false),
        onError: (error: Error) => setServerError(error.message),
      }
    );
  };

  const handleReset = () => {
    setOptions(toDraft(product));
    setDirty(false);
    setShowProblem(false);
    setServerError(null);
  };

  if (readOnly) {
    const saved = product.options ?? [];
    return saved.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">This product has no options.</p>
    ) : (
      <dl className="space-y-3">
        {saved.map((option) => (
          <div key={option.id}>
            <dt className="text-sm font-medium text-gray-800 dark:text-white/90">{option.name}</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {option.values.map((v) => (
                <span
                  key={v.id}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {v.value}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {isSimple
          ? "This product has no options. Adding the first option (for example Size: S, M) turns the product into its first variant: its SKU, price, stock and history move to the first value of each option. Then generate or add the other combinations below."
          : `Up to ${MAX_OPTIONS} options with up to ${MAX_VALUES_PER_OPTION} values each. A value used by a variant can't be removed; delete or change that variant first.`}
      </p>

      <div className="space-y-4">
        {options.map((option, index) => (
          <div
            key={option.key}
            className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
          >
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[12rem] flex-1">
                <Label htmlFor={`option-${option.key}`}>Option {index + 1} name</Label>
                <input
                  id={`option-${option.key}`}
                  type="text"
                  value={option.name}
                  maxLength={OPTION_NAME_MAX}
                  placeholder="Size"
                  onChange={(e) => updateOption(index, { name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <button type="button" className={smallButton} disabled={index === 0} onClick={() => change(move(options, index, -1))} aria-label="Move option up">
                ↑
              </button>
              <button
                type="button"
                className={smallButton}
                disabled={index === options.length - 1}
                onClick={() => change(move(options, index, 1))}
                aria-label="Move option down"
              >
                ↓
              </button>
              <button type="button" className={smallButton} onClick={() => change(options.filter((_, i) => i !== index))}>
                Remove option
              </button>
            </div>

            <div className="mt-3">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-xs font-medium text-gray-500">Values</span>
                <span className="text-xs text-gray-400">
                  {option.values.length}/{MAX_VALUES_PER_OPTION}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value, vIndex) => (
                  <span
                    key={value.key}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 py-1 pl-1 pr-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <button
                      type="button"
                      aria-label={`Move ${value.value} left`}
                      disabled={vIndex === 0}
                      onClick={() => updateOption(index, { values: move(option.values, vIndex, -1) })}
                      className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                    >
                      ‹
                    </button>
                    <input
                      type="text"
                      aria-label={`Value ${vIndex + 1} of ${option.name || `option ${index + 1}`}`}
                      value={value.value}
                      maxLength={OPTION_VALUE_MAX}
                      size={Math.max(value.value.length, 2)}
                      onChange={(e) =>
                        updateOption(index, {
                          values: option.values.map((v, i) => (i === vIndex ? { ...v, value: e.target.value } : v)),
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                      className="bg-transparent px-1 text-xs text-gray-800 focus:outline-hidden dark:text-white/90"
                    />
                    <button
                      type="button"
                      aria-label={`Move ${value.value} right`}
                      disabled={vIndex === option.values.length - 1}
                      onClick={() => updateOption(index, { values: move(option.values, vIndex, 1) })}
                      className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                    >
                      ›
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${value.value}`}
                      onClick={() => updateOption(index, { values: option.values.filter((_, i) => i !== vIndex) })}
                      className="text-gray-400 hover:text-error-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  aria-label={`Add a value to ${option.name || `option ${index + 1}`}`}
                  value={option.pending}
                  maxLength={OPTION_VALUE_MAX}
                  disabled={option.values.length >= MAX_VALUES_PER_OPTION}
                  placeholder="Type a value and press Enter"
                  onChange={(e) => setPending(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addValue(index);
                    }
                  }}
                  className={`${inputClass} max-w-xs`}
                />
                <button
                  type="button"
                  onClick={() => addValue(index)}
                  disabled={!option.pending.trim() || option.values.length >= MAX_VALUES_PER_OPTION}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 ring-1 ring-inset ring-brand-200 hover:bg-brand-50 disabled:opacity-40 dark:text-brand-400 dark:ring-brand-800 dark:hover:bg-brand-900/20"
                >
                  Add value
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={options.length >= MAX_OPTIONS}
        onClick={() => change([...options, { key: newKey(), name: "", values: [], pending: "" }])}
        className="mt-3 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 ring-1 ring-inset ring-brand-200 hover:bg-brand-50 disabled:opacity-40 dark:text-brand-400 dark:ring-brand-800 dark:hover:bg-brand-900/20"
      >
        + Add option ({options.length}/{MAX_OPTIONS})
      </button>

      {options.length > 0 && (
        <p className={`mt-3 text-xs ${combinations > MAX_VARIANTS ? "text-warning-600" : "text-gray-500"}`}>
          {combinations} possible combination{combinations === 1 ? "" : "s"}
          {combinations > MAX_VARIANTS && ` (a product can have at most ${MAX_VARIANTS} variants)`}
        </p>
      )}

      {showProblem && problem && <p className="mt-3 text-sm text-error-500">{problem}</p>}
      {serverError && (
        <p role="alert" className="mt-3 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
          {serverError}
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || (!dirty && !hasPending)}
          className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save options"}
        </button>
        {dirty && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
          >
            Discard changes
          </button>
        )}
      </div>
    </div>
  );
}
