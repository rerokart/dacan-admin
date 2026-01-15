import React from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  className?: string;
}

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  rounded = "md",
  className = "",
}) => {
  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-skeleton-pulse ${roundedClasses[rounded]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
