"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PermissionGuard from "@/components/auth/PermissionGuard";
import InventorySettingsForm from "@/components/settings/inventory/InventorySettingsForm";

export default function InventorySettingsPage() {
  return (
    <PermissionGuard permission="settings.view">
      <div>
        <PageBreadcrumb pageTitle="Inventory settings" />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <InventorySettingsForm />
        </div>
      </div>
    </PermissionGuard>
  );
}
