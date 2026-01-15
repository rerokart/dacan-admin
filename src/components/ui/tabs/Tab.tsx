"use client";

import React from "react";
import { useTabsContext } from "./Tabs";

export interface TabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Tab: React.FC<TabProps> = ({
  value,
  children,
  disabled = false,
  icon,
  className = "",
}) => {
  const { activeTab, setActiveTab, variant } = useTabsContext();
  const isActive = activeTab === value;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  const baseStyles =
    variant === "underline"
      ? `px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
          isActive
            ? "border-brand-500 text-brand-500"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        }`
      : `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        }`;

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      className={`flex items-center gap-2 ${baseStyles} ${disabledStyles} ${className}`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};

export default Tab;
