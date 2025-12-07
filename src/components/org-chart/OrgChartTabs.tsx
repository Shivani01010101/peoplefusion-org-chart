"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveTab, ChartViewType } from "@/store/slices/orgChartSlice";

/**
 * OrgChartTabs Component
 *
 * Tab navigation for switching between different organizational chart views.
 * Features:
 * - Active tab highlighting with purple accent
 * - Smooth transitions
 * - Keyboard accessible
 * - Visual indicator for active state
 * - Connected to Redux state
 */
export const OrgChartTabs: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.orgChart.activeTab);

  const tabs: ChartViewType[] = [
    "People",
    "Position",
    "Organization",
    "Others",
  ];

  const handleTabClick = (tab: ChartViewType) => {
    dispatch(setActiveTab(tab));
  };

  return (
    <div className="flex items-center gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`relative px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === tab
              ? "text-purple-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          aria-pressed={activeTab === tab}
          aria-label={`Switch to ${tab} view`}
        >
          {tab}
          {activeTab === tab && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></span>
          )}
          {tab === "Others" && (
            <svg
              className="ml-1 inline h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
};
