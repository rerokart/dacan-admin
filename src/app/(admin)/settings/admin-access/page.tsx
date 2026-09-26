"use client";

import React, { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/context/AuthContext";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs";
import AdminsTab from "@/components/admin-access/AdminsTab";
import RolesMatrixTab from "@/components/admin-access/RolesMatrixTab";

type TabKey = "admins" | "roles" | "audit-log" | "login-history";

function ComingSoonPanel() {
  return (
    <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
      Coming in next task
    </div>
  );
}

function AdminAccessPageInner() {
  const { can } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rolesTabDirty, setRolesTabDirty] = useState(false);

  const availableTabs = useMemo(() => {
    const tabs: { key: TabKey; label: string }[] = [];
    if (can("admin_access.view")) {
      tabs.push({ key: "admins", label: "Admins" });
      tabs.push({ key: "roles", label: "Roles & Permissions" });
    }
    if (can("audit_log.view")) {
      tabs.push({ key: "audit-log", label: "Audit Log" });
      tabs.push({ key: "login-history", label: "Login History" });
    }
    return tabs;
  }, [can]);

  const requestedTab = searchParams.get("tab");
  const activeTab: TabKey | undefined = availableTabs.some((tab) => tab.key === requestedTab)
    ? (requestedTab as TabKey)
    : availableTabs[0]?.key;

  const handleTabChange = (tab: string) => {
    if (activeTab === "roles" && rolesTabDirty && tab !== activeTab) {
      const confirmed = window.confirm(
        "You have unsaved role permission changes. Leave this tab and discard them?"
      );
      if (!confirmed) return;
      setRolesTabDirty(false);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Admin Access" />
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {activeTab ? (
          <Tabs value={activeTab} onValueChange={handleTabChange} variant="underline">
            <TabList>
              {availableTabs.map((tab) => (
                <Tab key={tab.key} value={tab.key}>
                  {tab.label}
                </Tab>
              ))}
            </TabList>

            {can("admin_access.view") && (
              <TabPanel value="admins">
                <AdminsTab />
              </TabPanel>
            )}
            {can("admin_access.view") && (
              <TabPanel value="roles">
                <RolesMatrixTab onDirtyChange={setRolesTabDirty} />
              </TabPanel>
            )}
            {can("audit_log.view") && (
              <TabPanel value="audit-log">
                <ComingSoonPanel />
              </TabPanel>
            )}
            {can("audit_log.view") && (
              <TabPanel value="login-history">
                <ComingSoonPanel />
              </TabPanel>
            )}
          </Tabs>
        ) : (
          // PermissionGuard already screens out an admin with neither
          // admin_access.view nor audit_log.view before this renders.
          <ComingSoonPanel />
        )}
      </div>
    </div>
  );
}

export default function AdminAccessPage() {
  return (
    <PermissionGuard permission={["admin_access.view", "audit_log.view"]}>
      <Suspense fallback={null}>
        <AdminAccessPageInner />
      </Suspense>
    </PermissionGuard>
  );
}
