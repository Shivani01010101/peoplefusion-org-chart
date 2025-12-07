"use client";

import React from "react";
import { PositionData } from "@/store/slices/orgChartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarEmployee, setSelectedEmployee } from "@/store/slices/orgChartSlice";
import { Avatar } from "@/components/common/Avatar";

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
}

/**
 * PositionNode Component
 *
 * Renders a position card in the Position view of the organizational chart.
 * Shows position name and employees in that position.
 */
export const PositionNode: React.FC<PositionNodeProps> = ({
  position,
  level = 0,
  isExpanded = true,
  onToggleExpand,
  isHighlighted = false,
}) => {
  const dispatch = useAppDispatch();
  const selectedEmployee = useAppSelector(
    (state) => state.orgChart.selectedEmployee
  );

  const hasChildren = position.children && position.children.length > 0;
  const hasEmployees = position.employees && position.employees.length > 0;

  /**
   * Handles click on the position card
   */
  const handleNodeClick = () => {
    if (hasEmployees && position.employees[0]) {
      dispatch(setSelectedEmployee(position.employees[0]));
    }
  };

  /**
   * Handles click on an employee in the position
   */
  const handleEmployeeClick = (e: React.MouseEvent, employee: any) => {
    e.stopPropagation();
    dispatch(setSidebarEmployee(employee));
  };

  return (
    <div className="flex flex-col items-center">
      {/* Position Card */}
      <div
        className={`group relative flex min-w-[220px] max-w-[240px] cursor-pointer flex-col rounded-lg border-2 bg-white p-4 shadow-sm transition-all duration-200 ${
          isHighlighted
            ? "border-yellow-400 ring-4 ring-yellow-200 bg-yellow-50 animate-pulse"
            : "border-purple-200 hover:border-purple-300 hover:shadow-md focus-within:ring-2 focus-within:ring-purple-300 focus-within:ring-offset-2"
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
        {/* Position Title */}
        <div className="text-center">
          <h3 className="text-base font-semibold text-purple-700">{position.name}</h3>
          <p className="mt-1 text-xs text-gray-500">Position</p>
        </div>

        {/* Employees in this position */}
        {hasEmployees && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-gray-500">
              {position.employees.length} {position.employees.length === 1 ? "Employee" : "Employees"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {position.employees.slice(0, 3).map((emp) => (
                <button
                  key={emp.id}
                  onClick={(e) => handleEmployeeClick(e, emp)}
                  className="focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full"
                  aria-label={`View details for ${emp.name}`}
                >
                  <Avatar
                    src={emp.profilePic}
                    alt={emp.name || "Employee"}
                    size="sm"
                    className="border-2 border-gray-200 hover:border-purple-400 transition-colors"
                  />
                </button>
              ))}
              {position.employees.length > 3 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  +{position.employees.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Count */}
        {(position.directReports !== undefined || position.indirectReports !== undefined) && (
          <div className="mt-2 text-center text-xs text-gray-500">
            {position.directReports || 0} / {position.indirectReports || 0} Reports
          </div>
        )}

        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${position.name} position`}
          >
            <span>{isExpanded ? "Collapse" : "Expand"}</span>
            <svg
              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
          </button>
        )}
      </div>
    </div>
  );
};

