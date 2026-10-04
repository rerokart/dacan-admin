import type React from "react";

/** Enter inside a single-line editor input must not submit the surrounding form. */
export const preventEnterSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") e.preventDefault();
};
