"use client";

import React from "react";
import { useTabsContext } from "./Tabs";

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabList: React.FC<TabListProps> = ({ children, className = "" }) => {
  const { variant } = useTabsContext();

  const baseStyles =
    variant === "underline"
      ? "flex gap-0 border-b border-gray-200 dark:border-gray-700"
      : "flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg";

  return (
    <div className={`${baseStyles} ${className}`} role="tablist">
      {children}
    </div>
  );
};

export default TabList;
