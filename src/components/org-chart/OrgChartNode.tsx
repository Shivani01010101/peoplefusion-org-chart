"use client";

import React from "react";
import { EmployeeData } from "@/store/slices/orgChartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSidebarEmployee,
  setSelectedEmployee,
} from "@/store/slices/orgChartSlice";
import { Avatar } from "@/components/common/Avatar";

/**
 * Props for OrgChartNode component
 */
interface OrgChartNodeProps {
  /** Employee data to display */
  employee: EmployeeData;
  /** Depth level in the tree hierarchy (0-based) */
  level?: number;
  /** Whether this node is currently expanded */
  isExpanded?: boolean;
  /** Callback function to toggle expand/collapse state */
  onToggleExpand?: () => void;
  /** Whether this node has children */
  hasChildren?: boolean;
  /** Whether this node is highlighted from search results */
  isHighlighted?: boolean;
}

/**
 * OrgChartNode Component
 *
 * Renders a single employee card in the organizational chart.
 * Features:
 * - Profile picture with fallback avatar
 * - Employee name and position
 * - Direct/indirect reports count
 * - Expand/collapse button for nodes with children
 * - Side icon to open employee details in sidebar
 * - Keyboard accessible with proper ARIA labels
 * - Visual states: selected, highlighted, hover
 */

export const OrgChartNode: React.FC<OrgChartNodeProps> = ({
  employee,
  level = 0,
  isExpanded = true,
  onToggleExpand,
  hasChildren = false,
  isHighlighted = false,
}) => {
  const dispatch = useAppDispatch();
  const selectedEmployee = useAppSelector(
    (state) => state.orgChart.selectedEmployee
  );

  const isSelected = selectedEmployee?.id === employee.id;

  /**
   * Handles click on the employee card
   * Opens the sidebar with employee details and sets as selected
   */
  const handleNodeClick = () => {
    dispatch(setSelectedEmployee(employee));
    dispatch(setSidebarEmployee(employee));
  };

  /**
   * Formats the direct/indirect reports display
   * Format: "directReports / indirectReports"
   */
  const reportsDisplay =
    employee.directReports !== undefined
      ? `${employee.directReports} / ${employee.indirectReports || 0}`
      : null;

  return (
    <div className="flex flex-col items-center">
      {/* Employee Card */}
      <div
        className={`group relative flex min-w-[160px] max-w-[180px] sm:min-w-[180px] sm:max-w-[200px] md:min-w-[220px] md:max-w-[240px] cursor-pointer flex-col rounded-lg border-2 bg-white p-2.5 sm:p-3 md:p-4 shadow-sm transition-all duration-200 ${
          isSelected
            ? "border-purple-500 ring-2 ring-purple-200 shadow-md"
            : isHighlighted
            ? "border-yellow-400 ring-4 ring-yellow-200 bg-yellow-50 animate-pulse"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md focus-within:ring-2 focus-within:ring-purple-300 focus-within:ring-offset-2"
        }`}
        onClick={handleNodeClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNodeClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Employee: ${employee.name}${
          employee.position ? `, ${employee.position}` : ""
        }${
          hasChildren
            ? `. ${isExpanded ? "Expanded" : "Collapsed"} node with ${
                employee.children?.length || 0
              } direct reports.`
            : ""
        }`}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-describedby={`employee-${employee.id}-description`}
      >
        {/* Profile Picture and Content */}
        <div className="flex items-start gap-2 sm:gap-3">
          {/* Profile Picture */}
          <div className="shrink-0">
            <Avatar
              src={employee.profilePic}
              alt={employee.name || "Employee"}
              size="md"
              className="border-2 border-gray-100"
            />
          </div>

          {/* Name and Title */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-xs sm:text-sm font-semibold text-gray-900 truncate"
              id={`employee-${employee.id}-name`}
            >
              {employee.name}
            </h3>
            {employee.position && (
              <p
                className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-600 truncate"
                id={`employee-${employee.id}-position`}
              >
                {employee.position}
              </p>
            )}
            {reportsDisplay && (
              <p
                className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-500"
                id={`employee-${employee.id}-description`}
              >
                {reportsDisplay} reports
              </p>
            )}
          </div>

          {/* Profile Card Icon - Always Visible */}
          <div
            className="shrink-0 flex items-center justify-center"
            aria-label="Profile card"
          >
            <img
              src="/icons/profile-card.svg"
              alt="Profile card"
              className="h-4 w-4"
            />
          </div>
        </div>

        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
            className="absolute -bottom-2.5 sm:-bottom-3 left-1/2 z-10 flex h-5 w-5 sm:h-6 sm:w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-purple-600 text-white shadow-md transition-all duration-200 hover:bg-purple-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${
              employee.name
            }'s team of ${employee.children?.length || 0} direct reports`}
            aria-expanded={isExpanded}
            tabIndex={0}
          >
            {isExpanded ? (
              <svg
                className="h-3 w-3 sm:h-4 sm:w-4"
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
            ) : (
              <svg
                className="h-3 w-3 sm:h-4 sm:w-4"
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
        )}
      </div>
    </div>
  );
};
