"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen, toggleMobileSidebar } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[260px]"
    : "lg:ml-[80px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Mobile-only: the sidebar is off-canvas below lg, so it needs an opener */}
        <button
          onClick={toggleMobileSidebar}
          aria-label="Open sidebar"
          className="fixed z-30 flex items-center justify-center w-10 h-10 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-theme-xs top-3 left-3 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 lg:hidden"
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path
              d="M1.33 1h13.34M1.33 11h13.34M1.33 6H8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {/* Page Content */}
        <div className="p-4 pt-16 mx-auto max-w-(--breakpoint-2xl) md:p-5 md:pt-16 lg:pt-5">{children}</div>
      </div>
    </div>
  );
}
