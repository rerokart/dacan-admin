import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import LowStockAlerts from "@/components/ecommerce/LowStockAlerts";

export const metadata: Metadata = {
  title: "Dashboard | Rerokart Admin",
  description: "E-commerce Admin Dashboard for Rerokart",
};

export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Stats Cards - Full Width */}
      <div className="col-span-12">
        <EcommerceMetrics />
      </div>

      {/* Sales Chart */}
      <div className="col-span-12 xl:col-span-12">
        <MonthlySalesChart />
      </div>

      {/* Recent Orders */}
      <div className="col-span-12 xl:col-span-12">
        <RecentOrders />
      </div>

      {/* Low Stock Alerts - Full Width */}
      <div className="col-span-12">
        <LowStockAlerts />
      </div>
    </div>
  );
}
