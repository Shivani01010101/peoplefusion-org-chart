"use client";

import React, { useState } from "react";

/**
 * Available tab types for the organizational chart view
 */
type TabType = "People" | "Position" | "Organization" | "Others";

/**
 * Props for OrgChartTabs component
 */
interface OrgChartTabsProps {
  /** Currently active tab */
  activeTab?: TabType;
  /** Callback function when tab changes */
  onTabChange?: (tab: TabType) => void;
}

/**
 * OrgChartTabs Component
 *
 * Tab navigation for switching between different organizational chart views.
 * Features:
 * - Active tab highlighting with purple accent
 * - Smooth transitions
 * - Keyboard accessible
 * - Visual indicator for active state
 */

export const OrgChartTabs: React.FC<OrgChartTabsProps> = ({
  activeTab = "People",
  onTabChange,
}) => {
  const [currentTab, setCurrentTab] = useState<TabType>(activeTab);

  const tabs: TabType[] = ["People", "Position", "Organization", "Others"];

  const handleTabClick = (tab: TabType) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="flex items-center gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`relative px-4 py-3 text-sm font-medium transition-colors ${
            currentTab === tab
              ? "text-purple-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {tab}
          {currentTab === tab && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></span>
          )}
          {tab === "Others" && (
            <svg
              className="ml-1 inline h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
