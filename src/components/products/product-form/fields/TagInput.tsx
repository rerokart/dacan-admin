"use client";

import { useState } from "react";
import Label from "@/components/form/Label";
import { MAX_TAGS, TAG_MAX, TAG_MIN } from "@/utils/productRules";
import { inputClass } from "./styles";

const normaliseTag = (raw: string) => raw.trim().toLowerCase().replace(/\s+/g, " ");

export default function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const commit = () => {
    const tag = normaliseTag(draft);
    if (!tag) return;
    if (tag.length < TAG_MIN || tag.length > TAG_MAX) {
      setError(`Each tag must be ${TAG_MIN}-${TAG_MAX} characters`);
      return;
    }
    if (tags.length >= MAX_TAGS) {
      setError(`At most ${MAX_TAGS} tags`);
      return;
    }
    if (!tags.includes(tag)) onChange([...tags, tag]);
    setDraft("");
    setError(null);
  };

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
        disabled={tags.length >= MAX_TAGS}
        placeholder="Type a tag and press Enter"
        onChange={(e) => {
          setDraft(e.target.value);
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
      <p className={`mt-1 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
        {error ?? "Saved in lowercase. Used for search."}
      </p>
    </div>
  );
}
