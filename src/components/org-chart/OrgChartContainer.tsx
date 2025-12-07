"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  EmployeeData,
  PositionData,
  OrganizationData,
  setHighlightedEmployee,
  transformToPositionView,
  transformToOrganizationView,
} from "@/store/slices/orgChartSlice";
import { OrgChartNode } from "./OrgChartNode";
import { PositionNode } from "./PositionNode";
import { OrganizationNode } from "./OrganizationNode";

/**
 * Expanded state mapping for tree nodes
 * Maps node ID (number or string) to boolean indicating if node is expanded
 */
interface ExpandedState {
  [key: number | string]: boolean;
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
  const activeTab = useAppSelector((state) => state.orgChart.activeTab);
  const searchQuery = useAppSelector((state) => state.orgChart.searchQuery);
  const searchResults = useAppSelector((state) => state.orgChart.searchResults);
  const highlightedEmployeeId = useAppSelector(
    (state) => state.orgChart.highlightedEmployeeId
  );
  const [expandedNodes, setExpandedNodes] = useState<ExpandedState>({});
  const nodeRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  /**
   * Transforms API tree data structure based on active tab view
   * - People: EmployeeData format (default)
   * - Position: PositionData format (grouped by position)
   * - Organization: OrganizationData format (grouped by department)
   */
  const rootData = useMemo(() => {
    if (!treeData) return null;

    if (activeTab === "Position") {
      return transformToPositionView(treeData);
    } else if (activeTab === "Organization") {
      return transformToOrganizationView(treeData);
    } else {
      // People view (default)
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
          position: node.relationship_id,
          department: node.department,
          directReports: node.direct_reports,
          indirectReports: node.indirect_reports,
          children: node.children?.map(transformNode) || [],
        };
      };

      return transformNode(treeData);
    }
  }, [treeData, activeTab]);

  /**
   * Initialize all nodes as expanded by default
   * Recursively sets all tree nodes to expanded state
   */
  useEffect(() => {
    if (rootData) {
      const initializeExpanded = (
        node: any,
        idKey: string = "id"
      ): ExpandedState => {
        const nodeId = node[idKey] || node.id;
        const state: ExpandedState = { [nodeId]: true };
        if (node.children) {
          node.children.forEach((child: any) => {
            Object.assign(state, initializeExpanded(child, idKey));
          });
        }
        return state;
      };

      // Use appropriate ID key based on view type
      const idKey =
        activeTab === "Position" || activeTab === "Organization" ? "id" : "id";
      setExpandedNodes(initializeExpanded(rootData, idKey));
    }
  }, [rootData, activeTab]);

  // Filter tree based on search - expand path to search results (only for People view)
  useEffect(() => {
    if (
      searchQuery &&
      searchResults.length > 0 &&
      rootData &&
      activeTab === "People"
    ) {
      const rootEmployee = rootData as EmployeeData;
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
  }, [searchQuery, searchResults, rootData, activeTab, dispatch]);

  /**
   * Toggles the expanded state of a tree node
   * @param nodeId - The ID of the node to toggle (can be number or string)
   */
  const toggleNode = (nodeId: number | string) => {
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
            className={`duration-300 ease-in-out ${
              isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {isExpanded && (
              <div className="mt-2 sm:mt-3 md:mt-4">
                {/* Vertical Line from parent to children level */}
                <div className="relative flex flex-col items-center">
                  <div className="h-4 sm:h-5 md:h-6 w-0.5 bg-gray-300"></div>
                  {/* Single arrow at the bottom of vertical line */}
                  <div className="absolute top-4 sm:top-5 md:top-6 -translate-y-1/2">
                    <svg
                      className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 8 6"
                    >
                      <path d="M4 6L0 0h8z" />
                    </svg>
                  </div>
                </div>

                {/* Horizontal connector line and vertical drops */}
                {displayEmployee.children!.length > 0 && (
                  <div className="relative flex items-center justify-center w-full">
                    {/* Children Nodes */}
                    <ul
                      className="relative flex items-start gap-4 sm:gap-6 md:gap-8 flex-wrap justify-center"
                      role="group"
                      aria-label={`Direct reports of ${displayEmployee.name}`}
                      id={`children-list-${displayEmployee.id}`}
                    >
                      {displayEmployee.children!.map((child, index) => (
                        <li
                          key={child.id}
                          className="flex flex-col items-center relative"
                          role="treeitem"
                          aria-level={level + 2}
                        >
                          {/* Horizontal line connecting all children - when 2 or more children, only on first child */}
                          {displayEmployee.children!.length >= 2 &&
                            index === 0 && (
                              <>
                                {/* Mobile: smaller width */}
                                <div
                                  className="absolute h-0.5 bg-gray-300 sm:hidden"
                                  style={{
                                    left: "50%",
                                    width: `calc(${
                                      displayEmployee.children!.length - 1
                                    } * (160px + 1rem))`,
                                    top: "0px",
                                  }}
                                ></div>
                                {/* Tablet: medium width */}
                                <div
                                  className="absolute h-0.5 bg-gray-300 hidden sm:block md:hidden"
                                  style={{
                                    left: "50%",
                                    width: `calc(${
                                      displayEmployee.children!.length - 1
                                    } * (180px + 1.5rem))`,
                                    top: "0px",
                                  }}
                                ></div>
                                {/* Desktop: full width */}
                                <div
                                  className="absolute h-0.5 bg-gray-300 hidden md:block"
                                  style={{
                                    left: "50%",
                                    width: `calc(${
                                      displayEmployee.children!.length - 1
                                    } * (220px + 2rem))`,
                                    top: "0px",
                                  }}
                                ></div>
                              </>
                            )}

                          {/* Vertical line from horizontal connector to child - when 2 or more children */}
                          {displayEmployee.children!.length >= 2 && (
                            <div className="h-4 sm:h-5 md:h-6 w-0.5 bg-gray-300"></div>
                          )}

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
          <div className="mt-2 sm:mt-3 md:mt-4 animate-fade-in">
            <button
              onClick={() => toggleNode(employee.id)}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 bg-gray-50 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label={`Expand to show ${
                employee.children?.length || 0
              } direct reports`}
              tabIndex={0}
            >
              <span className="whitespace-nowrap">
                Contains {employee.children?.length || 0}
              </span>
              <svg
                className="h-3 w-3 sm:h-4 sm:w-4 transition-transform shrink-0"
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

  /**
   * Render Position view
   */
  const renderPositionNode = (
    position: PositionData,
    level: number = 0,
    parent?: PositionData
  ): React.ReactNode => {
    const hasChildren = position.children && position.children.length > 0;
    const nodeId = position.id;
    const isExpanded = expandedNodes[nodeId] !== false;

    // Check if this is a leaf node (no children or children are collapsed)
    const isLeafNode = !hasChildren || !isExpanded;

    return (
      <li
        key={position.id}
        className={`flex flex-col items-center ${
          isLeafNode ? "pb-4 sm:pb-6 md:pb-8" : ""
        }`}
        style={{ position: "relative" }}
        role="treeitem"
        aria-level={level + 1}
      >
        <PositionNode
          position={position}
          level={level}
          isExpanded={isExpanded}
          onToggleExpand={() => toggleNode(nodeId)}
          hasParent={level > 0}
          onNavigateUp={() => {
            // Navigate to parent if exists
            if (parent) {
              const parentId = parent.id;
              setExpandedNodes((prev) => ({ ...prev, [parentId]: true }));
              // Scroll to parent node if possible
            }
          }}
        />

        {hasChildren && isExpanded && (
          <div className="mt-2 sm:mt-3 md:mt-4">
            {/* Vertical Line from parent to children level */}
            <div className="relative flex flex-col items-center">
              <div className="h-4 sm:h-5 md:h-6 w-0.5 bg-gray-300"></div>
              {/* Single arrow at the bottom of vertical line */}
              <div className="absolute top-4 sm:top-5 md:top-6 -translate-y-1/2">
                <svg
                  className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 8 6"
                >
                  <path d="M4 6L0 0h8z" />
                </svg>
              </div>
            </div>

            {/* Horizontal connector line and vertical drops */}
            {position.children!.length > 0 && (
              <div className="relative flex items-center justify-center w-full">
                {/* Children Nodes */}
                <ul
                  className="relative flex items-start gap-4 sm:gap-6 md:gap-8 flex-wrap justify-center"
                  role="group"
                  aria-label={`Sub-positions of ${position.name}`}
                >
                  {position.children!.map((child, index) => (
                    <li
                      key={child.id}
                      className="flex flex-col items-center relative"
                      role="treeitem"
                      aria-level={level + 2}
                    >
                      {/* Horizontal line connecting all children - when 2 or more children, only on first child */}
                      {position.children!.length >= 2 && index === 0 && (
                        <>
                          {/* Mobile: smaller width */}
                          <div
                            className="absolute h-0.5 bg-gray-300 sm:hidden"
                            style={{
                              left: "50%",
                              width: `calc(${
                                position.children!.length - 1
                              } * (160px + 1rem))`,
                              top: "0px",
                            }}
                          ></div>
                          {/* Tablet: medium width */}
                          <div
                            className="absolute h-0.5 bg-gray-300 hidden sm:block md:hidden"
                            style={{
                              left: "50%",
                              width: `calc(${
                                position.children!.length - 1
                              } * (180px + 1.5rem))`,
                              top: "0px",
                            }}
                          ></div>
                          {/* Desktop: full width */}
                          <div
                            className="absolute h-0.5 bg-gray-300 hidden md:block"
                            style={{
                              left: "50%",
                              width: `calc(${
                                position.children!.length - 1
                              } * (220px + 2rem))`,
                              top: "0px",
                            }}
                          ></div>
                        </>
                      )}

                      {/* Vertical line from horizontal connector to child - when 2 or more children */}
                      {position.children!.length >= 2 && (
                        <div className="h-4 sm:h-5 md:h-6 w-0.5 bg-gray-300"></div>
                      )}

                      {/* Recursive render of child */}
                      <div
                        className={
                          !child.children || child.children.length === 0
                            ? "pb-6 sm:pb-8 md:pb-10"
                            : ""
                        }
                      >
                        {renderPositionNode(child, level + 1, position)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </li>
    );
  };

  /**
   * Render Organization view
   */
  const renderOrganizationNode = (
    organization: OrganizationData,
    level: number = 0
  ): React.ReactNode => {
    const hasChildren =
      organization.children && organization.children.length > 0;
    const nodeId = organization.id;
    const isExpanded = expandedNodes[nodeId] !== false;

    return (
      <li
        key={organization.id}
        className="flex flex-col items-center"
        style={{ position: "relative" }}
        role="treeitem"
        aria-level={level + 1}
      >
        <OrganizationNode
          organization={organization}
          level={level}
          isExpanded={isExpanded}
          onToggleExpand={() => toggleNode(nodeId)}
        />

        {hasChildren && isExpanded && (
          <div className="mt-4">
            <div className="h-6 w-0.5 bg-gray-300"></div>
            {organization.children!.length > 0 && (
              <div className="relative flex items-center justify-center">
                {organization.children!.length > 1 && (
                  <div
                    className="absolute h-0.5 bg-gray-300"
                    style={{
                      width: `${(organization.children!.length - 1) * 256}px`,
                    }}
                  ></div>
                )}
                <ul className="relative flex items-start gap-8">
                  {organization.children!.map((child, index) => (
                    <li key={child.id} className="flex flex-col items-center">
                      <div className="h-6 w-0.5 bg-gray-300"></div>
                      {renderOrganizationNode(child, level + 1)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </li>
    );
  };

  if (!rootData) {
    return null;
  }

  return (
    <div
      data-chart-container="true"
      className="flex items-start justify-center p-2 sm:p-4 md:p-6 lg:p-8 w-full"
      style={{
        width: "fit-content",
        minWidth: "100%",
        margin: "0 auto",
      }}
      role="tree"
      aria-label={`${activeTab} organizational chart hierarchy`}
      aria-live="polite"
      aria-atomic="false"
    >
      <ul className="flex flex-col items-center">
        {activeTab === "Position" &&
          rootData &&
          renderPositionNode(rootData as PositionData, 0, undefined)}
        {activeTab === "Organization" &&
          rootData &&
          renderOrganizationNode(rootData as OrganizationData, 0)}
        {(activeTab === "People" || activeTab === "Others") &&
          rootData &&
          renderNode(rootData as EmployeeData, 0, true)}
      </ul>
    </div>
  );
};
