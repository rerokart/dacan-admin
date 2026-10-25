import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  id?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  id,
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // The list is drawn in a portal with fixed position, so a modal or a scroll box can't clip it.
  const [menuPos, setMenuPos] = useState<{ left: number; width: number; top?: number; bottom?: number } | null>(null);

  const toggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    const rect = selectRef.current?.getBoundingClientRect();
    if (rect) {
      const listHeight = Math.min(options.length * 42 + 8, 248);
      const below = window.innerHeight - rect.bottom;
      setMenuPos(
        below < listHeight + 8 && rect.top > below
          ? { left: rect.left, width: rect.width, bottom: window.innerHeight - rect.top + 4 }
          : { left: rect.left, width: rect.width, top: rect.bottom + 4 }
      );
    }
    setIsOpen(true);
  };

  // Uncontrolled callers that pass a changing defaultValue (e.g. data that
  // loads later) still follow it; adjusted during render, not in an effect.
  const [lastDefault, setLastDefault] = useState(defaultValue);
  if (!isControlled && lastDefault !== defaultValue) {
    setLastDefault(defaultValue);
    setInternalValue(defaultValue);
  }

  const selectedValue = isControlled ? value : internalValue;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (selectRef.current && !selectRef.current.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const close = (event: Event) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (val: string) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    onChange(val);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        onClick={toggleOpen}
        className={`h-11 w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 ${
          selectedValue
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
        }`}
      >
        <span className="truncate">
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`ml-2 h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && menuPos && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", left: menuPos.left, width: menuPos.width, top: menuPos.top, bottom: menuPos.bottom }}
          className="z-[9999999] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                className={`w-full disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  option.value === selectedValue
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {option.value === selectedValue && (
                    <svg
                      className="h-4 w-4 text-brand-600 dark:text-brand-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Select;
