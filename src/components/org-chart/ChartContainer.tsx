"use client";

import React from "react";
import { useAppSelector } from "@/store/hooks";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";

/**
 * ChartContainer Component
 *
 * Wrapper component that handles loading, error, and empty states for the org chart.
 * Displays appropriate UI based on the current state:
 * - Loading: Shows skeleton loader
 * - Error: Shows error message with helpful information
 * - Empty: Shows empty state with suggestions
 * - Success: Renders the chart content
 *
 * @param children - The org chart content to render when data is available
 */
export const ChartContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const loading = useAppSelector((state) => state.orgChart.loading);
  const error = useAppSelector((state) => state.orgChart.error);
  const treeData = useAppSelector((state) => state.orgChart.treeData);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Loading State with Skeleton */}
      {loading && <SkeletonLoader />}

      {/* Error State */}
      {error && !loading && (
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Error loading chart
            </h3>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <p className="mt-4 text-xs text-gray-500">
              Please check your connection and try again, or contact support if
              the problem persists.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !treeData && (
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No organizational chart data
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              The organizational chart data is empty or unavailable. This could
              mean:
            </p>
            <ul className="mt-3 text-left text-sm text-gray-500 space-y-1">
              <li>• The employee has no reporting relationships</li>
              <li>• The data is still being loaded</li>
              <li>• There was an issue fetching the data</li>
            </ul>
            <p className="mt-4 text-xs text-gray-400">
              Please try refreshing the page or selecting a different employee.
            </p>
          </div>
        </div>
      )}

      {/* Chart Content */}
      {!loading && !error && treeData && (
        <div
          data-chart-wrapper="true"
          className="flex h-full w-full overflow-auto bg-gray-50"
          style={{
            minHeight: "calc(100vh - 280px)",
            position: "relative",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
