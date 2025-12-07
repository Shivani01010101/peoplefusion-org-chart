"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  EmployeeData,
  setHighlightedEmployee,
} from "@/store/slices/orgChartSlice";
import { OrgChartNode } from "./OrgChartNode";

/**
 * Expanded state mapping for tree nodes
 * Maps employee ID to boolean indicating if node is expanded
 */
interface ExpandedState {
  [key: number]: boolean;
}

/**
 * OrgChartContainer Component
 *
 * Main container for rendering the organizational chart tree structure.
 * Handles:
 * - Tree data transformation from API format to UI format
 * - Expand/collapse state management
 * - Search filtering and highlighting
 * - Auto-scroll to search results
 * - Recursive tree rendering
 */
export const OrgChartContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const treeData = useAppSelector((state) => state.orgChart.treeData);
  const searchQuery = useAppSelector((state) => state.orgChart.searchQuery);
  const searchResults = useAppSelector((state) => state.orgChart.searchResults);
  const highlightedEmployeeId = useAppSelector(
    (state) => state.orgChart.highlightedEmployeeId
  );
  const [expandedNodes, setExpandedNodes] = useState<ExpandedState>({});
  const nodeRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  /**
   * Transforms API tree data structure to EmployeeData format for UI rendering
   * Recursively processes the tree structure from the API
   */
  const rootEmployee = useMemo(() => {
    if (!treeData) return null;

    /**
     * Recursive function to transform TreeNode to EmployeeData
     * @param node - TreeNode from API response
     * @returns Transformed EmployeeData object
     */
    const transformNode = (node: any): EmployeeData => {
      const nameParts = node.target?.trim().split(" ") || [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      return {
        id: node.employee_id || node.id || 0,
        name: node.target || "",
        firstName,
        lastName,
        profilePic: node.pic,
        directReports: node.direct_reports,
        indirectReports: node.indirect_reports,
        children: node.children?.map(transformNode) || [],
      };
    };

    return transformNode(treeData);
  }, [treeData]);

  /**
   * Initialize all nodes as expanded by default
   * Recursively sets all tree nodes to expanded state
   */
  useEffect(() => {
    if (rootEmployee) {
      /**
       * Recursively initialize expanded state for all nodes
       * @param node - Employee node to process
       * @returns ExpandedState object with all nodes set to true
       */
      const initializeExpanded = (node: EmployeeData): ExpandedState => {
        const state: ExpandedState = { [node.id]: true };
        if (node.children) {
          node.children.forEach((child) => {
            Object.assign(state, initializeExpanded(child));
          });
        }
        return state;
      };
      setExpandedNodes(initializeExpanded(rootEmployee));
    }
  }, [rootEmployee]);

  // Filter tree based on search - expand path to search results
  useEffect(() => {
    if (searchQuery && searchResults.length > 0 && rootEmployee) {
      const expandPathToEmployee = (
        node: EmployeeData,
        targetId: number,
        path: number[] = []
      ): number[] | null => {
        const currentPath = [...path, node.id];
        if (node.id === targetId) {
          return currentPath;
        }
        if (node.children) {
          for (const child of node.children) {
            const result = expandPathToEmployee(child, targetId, currentPath);
            if (result) return result;
          }
        }
        return null;
      };

      // Expand path to first search result
      const firstResult = searchResults[0];
      if (firstResult) {
        const path = expandPathToEmployee(rootEmployee, firstResult.id);
        if (path) {
          const newExpanded: ExpandedState = {};
          path.forEach((id) => {
            newExpanded[id] = true;
          });
          setExpandedNodes((prev) => ({ ...prev, ...newExpanded }));
          dispatch(setHighlightedEmployee(firstResult.id));

          // Auto-scroll to highlighted node
          setTimeout(() => {
            const element = nodeRefs.current[firstResult.id];
            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
              });
            }
          }, 300);
        }
      }
    } else if (!searchQuery) {
      dispatch(setHighlightedEmployee(null));
    }
  }, [searchQuery, searchResults, rootEmployee, dispatch]);

  /**
   * Toggles the expanded state of a tree node
   * @param nodeId - The ID of the node to toggle
   */
  const toggleNode = (nodeId: number) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  /**
   * Filters the tree structure based on search query
   * Recursively filters nodes and their children, keeping only matching nodes
   * and their parent paths
   *
   * @param node - Current node to filter
   * @param query - Search query string
   * @returns Filtered EmployeeData node or null if no match
   */
  const filterTree = (
    node: EmployeeData,
    query: string
  ): EmployeeData | null => {
    if (!query.trim()) return node;

    const queryLower = query.toLowerCase();
    const matchesQuery =
      node.name.toLowerCase().includes(queryLower) ||
      node.firstName?.toLowerCase().includes(queryLower) ||
      node.lastName?.toLowerCase().includes(queryLower) ||
      node.position?.toLowerCase().includes(queryLower);

    const filteredChildren =
      node.children
        ?.map((child) => filterTree(child, query))
        .filter((child): child is EmployeeData => child !== null) || [];

    if (matchesQuery || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  };

  /**
   * Recursively renders a tree node and its children
   * Handles expand/collapse state, filtering, and highlighting
   *
   * @param employee - Employee data to render
   * @param level - Current depth level in the tree (0-based)
   * @param isLast - Whether this is the last child in its parent's children array
   * @returns React node representing the employee and its subtree
   */
  const renderNode = (
    employee: EmployeeData,
    level: number = 0,
    isLast: boolean = false
  ): React.ReactNode => {
    const hasChildren = employee.children && employee.children.length > 0;
    const isExpanded = expandedNodes[employee.id] !== false; // Default to true
    const isHighlighted = highlightedEmployeeId === employee.id;

    // Filter tree if search is active
    const displayEmployee = searchQuery
      ? filterTree(employee, searchQuery)
      : employee;

    if (!displayEmployee) return null;

    return (
      <li
        key={employee.id}
        ref={(el) => {
          if (el) nodeRefs.current[employee.id] = el;
        }}
        className="flex flex-col items-center"
        style={{ position: "relative" }}
        role="treeitem"
        aria-level={level + 1}
        aria-setsize={displayEmployee.children?.length || 1}
      >
        {/* Node */}
        <OrgChartNode
          employee={displayEmployee}
          level={level}
          isExpanded={isExpanded}
          onToggleExpand={() => toggleNode(employee.id)}
          hasChildren={hasChildren}
          isHighlighted={isHighlighted}
        />

        {/* Children Container with Animation */}
        {hasChildren && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {isExpanded && (
              <div className="mt-4">
                {/* Vertical Line from parent to children level */}
                <div className="h-6 w-0.5 bg-gray-300"></div>

                {/* Horizontal connector line and vertical drops */}
                {displayEmployee.children!.length > 0 && (
                  <div className="relative flex items-center justify-center">
                    {/* Horizontal line connecting all children */}
                    {displayEmployee.children!.length > 1 && (
                      <div
                        className="absolute h-0.5 bg-gray-300"
                        style={{
                          width: `${
                            (displayEmployee.children!.length - 1) * 256
                          }px`,
                        }}
                      ></div>
                    )}

                    {/* Children Nodes */}
                    <ul
                      className="relative flex items-start gap-8"
                      role="group"
                      aria-label={`Direct reports of ${displayEmployee.name}`}
                    >
                      {displayEmployee.children!.map((child, index) => (
                        <li
                          key={child.id}
                          className="flex flex-col items-center"
                          role="treeitem"
                          aria-level={level + 2}
                        >
                          {/* Vertical line from horizontal connector to child */}
                          <div className="h-6 w-0.5 bg-gray-300"></div>

                          {/* Recursive render of child */}
                          {renderNode(
                            child,
                            level + 1,
                            index === displayEmployee.children!.length - 1
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Collapsed Children Indicator */}
        {hasChildren && !isExpanded && (
          <div className="mt-4 animate-fade-in">
            <button
              onClick={() => toggleNode(employee.id)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label={`Expand to show ${
                employee.children?.length || 0
              } direct reports`}
              tabIndex={0}
            >
              <span>Contains {employee.children?.length || 0}</span>
              <svg
                className="h-4 w-4 transition-transform"
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
            </button>
          </div>
        )}
      </li>
    );
  };

  if (!rootEmployee) {
    return null;
  }

  return (
    <div
      className="flex h-full w-full items-start justify-center overflow-auto p-4 md:p-8"
      role="tree"
      aria-label="Organizational chart hierarchy"
      aria-live="polite"
      aria-atomic="false"
    >
      <ul
        className="flex flex-col items-center"
        role="group"
        aria-label="Root level employees"
      >
        {renderNode(rootEmployee, 0, true)}
      </ul>
    </div>
  );
};
