import React from "react";
import { Skeleton } from "./Skeleton";
import { SkeletonText } from "./SkeletonText";

export interface SkeletonCardProps {
  showImage?: boolean;
  imageHeight?: number;
  showTitle?: boolean;
  textLines?: number;
  showFooter?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showImage = true,
  imageHeight = 160,
  showTitle = true,
  textLines = 2,
  showFooter = false,
  className = "",
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {showImage && (
        <Skeleton width="100%" height={imageHeight} rounded="none" />
      )}
      <div className="p-4 space-y-3">
        {showTitle && <Skeleton width="70%" height={20} rounded="md" />}
        <SkeletonText lines={textLines} lineHeight={14} gap={6} />
        {showFooter && (
          <div className="flex items-center justify-between pt-2">
            <Skeleton width={80} height={24} rounded="md" />
            <Skeleton width={60} height={24} rounded="md" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SkeletonCard;
