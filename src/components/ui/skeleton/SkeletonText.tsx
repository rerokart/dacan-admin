import React from "react";
import { Skeleton } from "./Skeleton";

export interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  lastLineWidth?: string;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lineHeight = 16,
  gap = 8,
  lastLineWidth = "60%",
  className = "",
}) => {
  return (
    <div className={`flex flex-col ${className}`} style={{ gap: `${gap}px` }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : "100%"}
          rounded="sm"
        />
      ))}
    </div>
  );
};

export default SkeletonText;
