"use client";

import React from "react";
import { useTabsContext } from "./Tabs";

export interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  children,
  className = "",
}) => {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={`pt-4 focus:outline-none ${className}`}
    >
      {children}
    </div>
  );
};

export default TabPanel;
