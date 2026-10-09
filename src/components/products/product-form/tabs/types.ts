import type { FormState, SetField } from "../formState";
import type { FieldErrors } from "../validate";

/** Props every product form tab takes. */
export interface TabProps {
  form: FormState;
  set: SetField;
  errors: FieldErrors;
}
