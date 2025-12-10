"use client";

import React from "react";
import { PositionData } from "@/store/slices/orgChartSlice";
import { useAppDispatch } from "@/store/hooks";
import {
  setSidebarEmployee,
  setSelectedEmployee,
} from "@/store/slices/orgChartSlice";

/**
 * Props for PositionNode component
 */
interface PositionNodeProps {
  /** Position data to display */
  position: PositionData;
  /** Depth level in the tree hierarchy (0-based) */
  level?: number;
  /** Whether this node is currently expanded */
  isExpanded?: boolean;
  /** Callback function to toggle expand/collapse state */
  onToggleExpand?: () => void;
  /** Whether this node is highlighted from search results */
  isHighlighted?: boolean;
  /** Whether this node has a parent (for "Up one level" button) */
  hasParent?: boolean;
  /** Callback to navigate up one level */
  onNavigateUp?: () => void;
}

/**
 * PositionNode Component
 *
 * Renders a position card in the Position view of the organizational chart.
 * Matches Figma design with job title, department, location, employee name, and FTE.
 */
export const PositionNode: React.FC<PositionNodeProps> = ({
  position,
  level = 0,
  isExpanded = true,
  onToggleExpand,
  isHighlighted = false,
  hasParent = false,
  onNavigateUp,
}) => {
  const dispatch = useAppDispatch();

  const hasChildren = position.children && position.children.length > 0;
  const containsCount = position.containsCount || position.directReports || 0;

  /**
   * Handles click on the position card
   */
  const handleNodeClick = () => {
    if (position.employees && position.employees.length > 0) {
      dispatch(setSelectedEmployee(position.employees[0]));
      dispatch(setSidebarEmployee(position.employees[0]));
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Position Card */}
      <div
        className={`group relative flex min-w-[200px] max-w-[280px] sm:min-w-[240px] sm:max-w-[300px] cursor-pointer flex-col rounded-lg border border-gray-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm transition-all duration-200 ${
          isHighlighted
            ? "border-yellow-400 ring-4 ring-yellow-200 bg-yellow-50 animate-pulse"
            : "hover:border-gray-300 hover:shadow-md focus-within:ring-2 focus-within:ring-purple-300 focus-within:ring-offset-2"
        }`}
        onClick={handleNodeClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleNodeClick();
          }
        }}
        role="treeitem"
        aria-level={level + 1}
      >
        {/* Job Title */}
        <div className="mb-3">
          <h3 className="text-base font-bold text-gray-900">{position.name}</h3>
        </div>

        {/* Department and Location */}
        <div className="space-y-1 mb-3">
          {position.department && (
            <p className="text-xs text-gray-500">{position.department}</p>
          )}
          {position.location && (
            <p className="text-xs text-gray-500">{position.location}</p>
          )}
        </div>

        {/* Separator Line */}
        <div className="h-px bg-gray-200 mb-3"></div>

        {/* Employee Name */}
        {position.employeeName && (
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-900">
              {position.employeeName}
            </p>
          </div>
        )}

        {/* FTE Information */}
        {position.fte && (
          <div>
            <p className="text-sm text-gray-900">{position.fte}</p>
          </div>
        )}
      </div>

      {/* Contains button - only if has children */}
      {hasChildren && !isExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.();
          }}
          className="mt-2 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label={`Expand to show ${containsCount} positions`}
        >
          <span>Contains {containsCount}</span>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
