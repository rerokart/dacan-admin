import Label from "@/components/form/Label";

export default function TextBlock({
  id,
  label,
  value,
  max,
  rows = 4,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  max: number;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />
      <p className="mt-1 text-right text-xs text-gray-400">
        {value.length}/{max}
      </p>
    </div>
  );
}
