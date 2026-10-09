import { preventEnterSubmit } from "@/utils/formHelpers";
import {
  SPECS_MAX_ROWS,
  SPEC_GROUP_MAX,
  SPEC_NAME_MAX,
  SPEC_UNIT_MAX,
  SPEC_VALUE_MAX,
} from "@/utils/productRules";
import type { SpecRow } from "../formState";
import type { FieldErrors } from "../validate";
import FieldError from "./FieldError";
import { addButton, inputClass, smallButton } from "./styles";

export default function SpecsEditor({
  rows,
  errors,
  onChange,
}: {
  rows: SpecRow[];
  errors: FieldErrors;
  onChange: (rows: SpecRow[]) => void;
}) {
  const update = (index: number, key: keyof SpecRow, value: string) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const columns: { key: keyof SpecRow; label: string; max: number; placeholder: string }[] = [
    { key: "group_name", label: "Group", max: SPEC_GROUP_MAX, placeholder: "Dimensions" },
    { key: "name", label: "Name", max: SPEC_NAME_MAX, placeholder: "Length" },
    { key: "value", label: "Value", max: SPEC_VALUE_MAX, placeholder: "120" },
    { key: "unit", label: "Unit", max: SPEC_UNIT_MAX, placeholder: "mm" },
  ];

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm text-gray-500">
          Free rows shown as a table on the product page. Rows with the same group are shown together.
        </p>
        <span className="text-xs text-gray-400">
          {rows.length}/{SPECS_MAX_ROWS}
        </span>
      </div>
      {rows.length > 0 && (
        <div className="space-y-2">
          <div className="hidden grid-cols-[1fr_1fr_1.5fr_0.6fr_auto] gap-2 text-xs font-medium text-gray-500 lg:grid">
            {columns.map((c) => (
              <span key={c.key}>{c.label}</span>
            ))}
            <span className="w-36" />
          </div>
          {rows.map((row, index) => (
            <div key={index}>
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_1.5fr_0.6fr_auto]">
                {columns.map((c) => (
                  <input
                    key={c.key}
                    type="text"
                    aria-label={`${c.label} ${index + 1}`}
                    value={row[c.key]}
                    maxLength={c.max}
                    placeholder={c.placeholder}
                    onChange={(e) => update(index, c.key, e.target.value)}
                    onKeyDown={preventEnterSubmit}
                    className={inputClass}
                  />
                ))}
                <div className="flex w-36 items-center gap-1">
                  <button type="button" className={smallButton} disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">
                    ↑
                  </button>
                  <button
                    type="button"
                    className={smallButton}
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button type="button" className={smallButton} onClick={() => onChange(rows.filter((_, i) => i !== index))}>
                    Remove
                  </button>
                </div>
              </div>
              <FieldError error={errors[`spec-${index}`]} />
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        disabled={rows.length >= SPECS_MAX_ROWS}
        onClick={() => onChange([...rows, { group_name: rows[rows.length - 1]?.group_name ?? "", name: "", value: "", unit: "" }])}
        className={addButton}
      >
        + Add specification
      </button>
    </div>
  );
}
