"use client";

import React, { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs";
import TaxGeneralTab from "@/components/settings/tax/TaxGeneralTab";
import GstRatesTab from "@/components/settings/tax/GstRatesTab";
import HsnCodesTab from "@/components/settings/tax/HsnCodesTab";

const TABS = [
  { key: "general", label: "General" },
  { key: "gst-rates", label: "GST rates" },
  { key: "hsn-codes", label: "HSN codes" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function TaxPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedTab = searchParams.get("tab");
  const activeTab: TabKey = TABS.some((t) => t.key === requestedTab) ? (requestedTab as TabKey) : "general";

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Tax" />
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <Tabs value={activeTab} onValueChange={handleTabChange} variant="underline">
          <TabList>
            {TABS.map((tab) => (
              <Tab key={tab.key} value={tab.key}>
                {tab.label}
              </Tab>
            ))}
          </TabList>
          <TabPanel value="general">
            <TaxGeneralTab />
          </TabPanel>
          <TabPanel value="gst-rates">
            <GstRatesTab />
          </TabPanel>
          <TabPanel value="hsn-codes">
            <HsnCodesTab />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

export default function TaxSettingsPage() {
  return (
    <PermissionGuard permission="settings.view">
      <Suspense fallback={null}>
        <TaxPageInner />
      </Suspense>
    </PermissionGuard>
  );
}
