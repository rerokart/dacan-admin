"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BREADCRUMBS, type BreadcrumbItem } from "@/utils/constants/navigation";
import { ChevronLeftIcon } from "@/icons";

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname();

  // Use provided items or get from BREADCRUMBS constant based on pathname
  const breadcrumbItems = items || BREADCRUMBS[pathname] || [];

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={`${className}`}>
      <ol className="flex items-center gap-1.5 text-sm">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronLeftIcon className="w-4 h-4 text-gray-400 rotate-180" />
              )}
              {item.path && !isLast ? (
                <Link
                  href={item.path}
                  className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? "text-gray-800 dark:text-white/90 font-medium"
                      : "text-gray-500 dark:text-gray-400"
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
