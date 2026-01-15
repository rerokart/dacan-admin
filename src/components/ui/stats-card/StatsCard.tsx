import React from "react";

export type StatsCardColor = "blue" | "green" | "red" | "yellow" | "purple" | "orange";
export type StatsCardTrend = "up" | "down" | "neutral";
export type StatsCardSize = "default" | "compact";

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: StatsCardTrend;
  icon?: React.ReactNode;
  color?: StatsCardColor;
  size?: StatsCardSize;
  className?: string;
}

const colorStyles: Record<StatsCardColor, { bg: string; icon: string }> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-500",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    icon: "text-green-500",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    icon: "text-red-500",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    icon: "text-yellow-500",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    icon: "text-purple-500",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    icon: "text-orange-500",
  },
};

const trendColors: Record<StatsCardTrend, string> = {
  up: "text-green-500",
  down: "text-red-500",
  neutral: "text-gray-500",
};

const TrendIcon: React.FC<{ trend: StatsCardTrend }> = ({ trend }) => {
  if (trend === "up") {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (trend === "down") {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  trend = "neutral",
  icon,
  color = "blue",
  size = "default",
  className = "",
}) => {
  const styles = colorStyles[color];
  const isCompact = size === "compact";

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${
        isCompact ? "p-4" : "p-5"
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p
            className={`font-semibold text-gray-900 dark:text-white mt-1 ${
              isCompact ? "text-xl" : "text-2xl"
            }`}
          >
            {value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${trendColors[trend]}`}>
              <TrendIcon trend={trend} />
              <span className="text-sm font-medium">
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                vs last period
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`${styles.bg} ${styles.icon} ${
              isCompact ? "p-2" : "p-3"
            } rounded-lg`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
