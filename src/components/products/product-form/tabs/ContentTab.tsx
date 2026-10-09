import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import Select from "@/components/form/Select";
import {
  HIGHLIGHTS_MAX_ITEMS,
  HIGHLIGHT_MAX_LENGTH,
  KEY_FEATURES_MAX_ITEMS,
  KEY_FEATURE_MAX_LENGTH,
  TEXT_BLOCK_MAX,
  WARRANTY_CONDITIONS_MAX,
  WARRANTY_MONTHS_MAX,
  WARRANTY_MONTHS_MIN,
  WARRANTY_PROVIDERS,
  WARRANTY_TYPE_MAX,
  WHATS_INCLUDED_MAX_ITEMS,
  WHATS_INCLUDED_MAX_LENGTH,
} from "@/utils/productRules";
import { TEXT_BLOCKS } from "../formState";
import FieldError from "../fields/FieldError";
import ListEditor from "../fields/ListEditor";
import TextBlock from "../fields/TextBlock";
import type { TabProps } from "./types";

const PROVIDER_OPTIONS = [
  { value: "", label: "Not set" },
  ...WARRANTY_PROVIDERS.map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) })),
];

export default function ContentTab({ form, set, errors }: TabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <Label htmlFor="short_description">Short Description</Label>
        <Input
          id="short_description"
          value={form.short_description}
          onChange={(e) => set("short_description", e.target.value)}
          placeholder="One line for listings (needed to publish)"
        />
      </div>
      <div className="lg:col-span-2">
        <TextBlock
          id="description"
          label="Full Description"
          value={form.description}
          max={TEXT_BLOCK_MAX}
          rows={6}
          onChange={(v) => set("description", v)}
        />
        <p className="text-xs text-gray-500">Plain text. Lines starting with &quot;- &quot; show as bullets.</p>
      </div>
      <ListEditor
        id="highlights"
        label="Highlights"
        hint="Short phrases shown as chips near the price"
        items={form.highlights}
        maxItems={HIGHLIGHTS_MAX_ITEMS}
        maxLength={HIGHLIGHT_MAX_LENGTH}
        placeholder="e.g. Rust proof"
        onChange={(items) => set("highlights", items)}
      />
      <ListEditor
        id="key_features"
        label="Key Features"
        items={form.key_features}
        maxItems={KEY_FEATURES_MAX_ITEMS}
        maxLength={KEY_FEATURE_MAX_LENGTH}
        placeholder="e.g. Solid brass body"
        onChange={(items) => set("key_features", items)}
      />
      <ListEditor
        id="whats_included"
        label="What's Included"
        items={form.whats_included}
        maxItems={WHATS_INCLUDED_MAX_ITEMS}
        maxLength={WHATS_INCLUDED_MAX_LENGTH}
        placeholder="e.g. 4 screws"
        onChange={(items) => set("whats_included", items)}
      />
      <div />
      {TEXT_BLOCKS.map((b) => (
        <TextBlock
          key={b.key}
          id={b.key}
          label={b.label}
          value={form[b.key]}
          max={TEXT_BLOCK_MAX}
          onChange={(v) => set(b.key, v)}
        />
      ))}

      <div className="rounded-lg border border-gray-200 p-4 lg:col-span-2 dark:border-gray-800">
        <Checkbox
          id="warranty_available"
          label="Warranty available"
          checked={form.warranty_available}
          onChange={(v) => set("warranty_available", v)}
        />
        {form.warranty_available && (
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <Label htmlFor="warranty_months">Months *</Label>
              <Input
                id="warranty_months"
                type="number"
                min={String(WARRANTY_MONTHS_MIN)}
                max={String(WARRANTY_MONTHS_MAX)}
                value={form.warranty_months}
                error={!!errors.warranty_months}
                onChange={(e) => set("warranty_months", e.target.value)}
                placeholder="12"
              />
              <FieldError error={errors.warranty_months} />
            </div>
            <div>
              <Label htmlFor="warranty_provider">Provided by</Label>
              <Select
                options={PROVIDER_OPTIONS}
                value={form.warranty_provider}
                onChange={(val) => set("warranty_provider", val)}
              />
            </div>
            <div>
              <Label htmlFor="warranty_type">Type</Label>
              <Input
                id="warranty_type"
                value={form.warranty_type}
                maxLength={WARRANTY_TYPE_MAX}
                onChange={(e) => set("warranty_type", e.target.value)}
                placeholder="e.g. Replacement"
              />
            </div>
            <div className="lg:col-span-3">
              <TextBlock
                id="warranty_conditions"
                label="Conditions"
                value={form.warranty_conditions}
                max={WARRANTY_CONDITIONS_MAX}
                rows={3}
                onChange={(v) => set("warranty_conditions", v)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
