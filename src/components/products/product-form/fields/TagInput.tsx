"use client";

import { useState } from "react";
import Label from "@/components/form/Label";
import { MAX_TAGS, TAG_MAX } from "@/utils/productRules";
import { normaliseTag, tagProblem } from "../formState";
import { inputClass } from "./styles";

interface TagInputProps {
  tags: string[];
  /** The text typed but not yet added; kept in form state so Save can commit it */
  draft: string;
  onChange: (tags: string[]) => void;
  onDraftChange: (draft: string) => void;
  /** Error from the form check on Save (an invalid draft) */
  error?: string;
}

export default function TagInput({ tags, draft, onChange, onDraftChange, error: formError }: TagInputProps) {
  const [error, setError] = useState<string | null>(null);

  const commit = () => {
    const tag = normaliseTag(draft);
    if (!tag) return;
    const problem = tagProblem(tags, tag);
    if (problem) {
      setError(problem);
      return;
    }
    if (!tags.includes(tag)) onChange([...tags, tag]);
    onDraftChange("");
    setError(null);
  };

  const shownError = error ?? formError;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label htmlFor="tags">Tags</Label>
        <span className="text-xs text-gray-400">
          {tags.length}/{MAX_TAGS}
        </span>
      </div>
      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        id="tags"
        type="text"
        value={draft}
        maxLength={TAG_MAX + 10}
        disabled={tags.length >= MAX_TAGS && !draft}
        placeholder="Type a tag and press Enter"
        onChange={(e) => {
          onDraftChange(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        className={inputClass}
      />
      <p className={`mt-1 text-xs ${shownError ? "text-error-500" : "text-gray-500"}`}>
        {shownError ?? "Saved in lowercase. Used for search."}
      </p>
    </div>
  );
}
