"use client";

import React, { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/context/AuthContext";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs";
import HistoryTab from "@/components/inventory/HistoryTab";
import StockTab from "@/components/inventory/StockTab";
import { INVENTORY_TABS, type InventoryTabKey } from "@/components/inventory/inventoryTabs";

function InventoryPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { can } = usePermissions();

  // Tabs the role can't use are hidden.
  const tabs = INVENTORY_TABS.filter((t) => can(t.permission));
  const requested = searchParams.get("tab");
  const activeTab: InventoryTabKey = tabs.some((t) => t.key === requested)
    ? (requested as InventoryTabKey)
    : "stock";

  const handleTabChange = (tab: string) => {
    // Filters belong to a tab, so switching clears them.
    router.replace(`${pathname}?tab=${tab}`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Inventory" />
      <Tabs value={activeTab} onValueChange={handleTabChange} variant="underline">
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab.key} value={tab.key}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanel value="stock">
          <div className="pt-4">
            <StockTab canViewHistory={can("inventory.view")} />
          </div>
        </TabPanel>
        <TabPanel value="history">
          <HistoryTab />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <PermissionGuard permission="inventory.view">
      <Suspense fallback={null}>
        <InventoryPageContent />
      </Suspense>
    </PermissionGuard>
  );
}
