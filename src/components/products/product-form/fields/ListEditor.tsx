import Label from "@/components/form/Label";
import { preventEnterSubmit } from "@/utils/formHelpers";
import { addButton, inputClass, smallButton } from "./styles";

export default function ListEditor({
  id,
  label,
  hint,
  items,
  maxItems,
  maxLength,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  items: string[];
  maxItems: number;
  maxLength: number;
  placeholder: string;
  onChange: (items: string[]) => void;
}) {
  const update = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? value : item)));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label htmlFor={`${id}-0`}>{label}</Label>
        <span className="text-xs text-gray-400">
          {items.length}/{maxItems}
        </span>
      </div>
      {hint && <p className="mb-2 text-xs text-gray-500">{hint}</p>}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id={`${id}-${index}`}
                type="text"
                value={item}
                maxLength={maxLength}
                placeholder={placeholder}
                onChange={(e) => update(index, e.target.value)}
                onKeyDown={preventEnterSubmit}
                className={`${inputClass} pr-16`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {item.length}/{maxLength}
              </span>
            </div>
            <button
              type="button"
              aria-label={`Remove ${label} ${index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className={smallButton}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={items.length >= maxItems}
        onClick={() => onChange([...items, ""])}
        className={addButton}
      >
        + Add
      </button>
    </div>
  );
}
