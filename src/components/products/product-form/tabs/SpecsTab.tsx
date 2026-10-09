import SpecsEditor from "../fields/SpecsEditor";
import type { TabProps } from "./types";

export default function SpecsTab({ form, set, errors }: TabProps) {
  return (
    <SpecsEditor rows={form.specifications} errors={errors} onChange={(rows) => set("specifications", rows)} />
  );
}
