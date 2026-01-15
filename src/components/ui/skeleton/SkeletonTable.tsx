import React from "react";
import { Skeleton } from "./Skeleton";

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = "",
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      {showHeader && (
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={`header-${index}`} className="flex-1">
              <Skeleton height={14} width={`${60 + Math.random() * 30}%`} rounded="sm" />
            </div>
          ))}
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex items-center gap-4 px-5 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1">
              {colIndex === 0 ? (
                <div className="flex items-center gap-3">
                  <Skeleton width={40} height={40} rounded="lg" />
                  <Skeleton height={14} width="70%" rounded="sm" />
                </div>
              ) : (
                <Skeleton
                  height={14}
                  width={`${50 + Math.random() * 40}%`}
                  rounded="sm"
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonTable;
