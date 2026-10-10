import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { COUNTRY_MAX, UNITS_OF_MEASURE } from "@/utils/productRules";
import FieldError from "../fields/FieldError";
import TagInput from "../fields/TagInput";
import type { TabProps } from "./types";

const UNIT_OPTIONS = UNITS_OF_MEASURE.map((u) => ({ value: u, label: u.replace("_", " ") }));

export default function IdentityTab({
  form,
  set,
  errors,
  rateHint,
}: TabProps & {
  /** "Rate filled from HSN 7214" after the GST rate followed a new HSN code */
  rateHint?: string | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <Label htmlFor="model_number">Model Number</Label>
        <Input id="model_number" value={form.model_number} maxLength={80} onChange={(e) => set("model_number", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="mpn">MPN (manufacturer part number)</Label>
        <Input id="mpn" value={form.mpn} maxLength={80} onChange={(e) => set("mpn", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="manufacturer">Manufacturer</Label>
        <Input id="manufacturer" value={form.manufacturer} maxLength={120} onChange={(e) => set("manufacturer", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="country_of_origin">Country of Origin</Label>
        <Input
          id="country_of_origin"
          value={form.country_of_origin}
          maxLength={COUNTRY_MAX}
          error={!!errors.country_of_origin}
          onChange={(e) => set("country_of_origin", e.target.value)}
          placeholder="India"
        />
        <FieldError error={errors.country_of_origin} />
      </div>
      <div>
        <Label htmlFor="hsn_code">HSN / SAC Code</Label>
        <Input
          id="hsn_code"
          inputMode="numeric"
          value={form.hsn_code}
          maxLength={8}
          error={!!errors.hsn_code}
          onChange={(e) => set("hsn_code", e.target.value.replace(/\D/g, ""))}
          placeholder="4, 6 or 8 digits"
        />
        <FieldError error={errors.hsn_code} />
        {rateHint && !errors.hsn_code && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{rateHint}</p>}
      </div>
      <div>
        <Label htmlFor="unit_of_measure">Unit of Measure</Label>
        <Select id="unit_of_measure" options={UNIT_OPTIONS} value={form.unit_of_measure} onChange={(val) => set("unit_of_measure", val)} />
      </div>
      <div className="lg:col-span-2">
        <TagInput
          tags={form.tags}
          draft={form.tag_draft}
          onChange={(tags) => set("tags", tags)}
          onDraftChange={(draft) => set("tag_draft", draft)}
          error={errors.tags?.message}
        />
      </div>
    </div>
  );
}
