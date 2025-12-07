"use client";

import React, { useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  closeSidebar,
  setSidebarEmployee,
  EmployeeData,
} from "@/store/slices/orgChartSlice";
import { Avatar } from "@/components/common/Avatar";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.orgChart.isSidebarOpen);
  const employee = useAppSelector((state) => state.orgChart.sidebarEmployee);
  const treeData = useAppSelector((state) => state.orgChart.treeData);
  const sidebarRef = useFocusTrap(isOpen);

  const handleClose = () => {
    dispatch(closeSidebar());
  };

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Find manager and direct reports from tree
  const { manager, directReports } = useMemo(() => {
    if (!employee || !treeData) return { manager: null, directReports: [] };

    const findInTree = (
      node: any,
      targetId: number,
      parent: any = null
    ): { found: any; parent: any } | null => {
      if ((node.employee_id || node.id) === targetId) {
        return { found: node, parent };
      }

      if (node.children) {
        for (const child of node.children) {
          const result = findInTree(child, targetId, node);
          if (result) return result;
        }
      }

      return null;
    };

    const result = findInTree(treeData, employee.id);
    if (!result) return { manager: null, directReports: [] };

    // Manager is the parent
    const managerNode = result.parent;
    const managerData: EmployeeData | null = managerNode
      ? {
          id: managerNode.employee_id || managerNode.id || 0,
          name: managerNode.target || "",
          profilePic: managerNode.pic,
          position: managerNode.relationship_id,
        }
      : null;

    // Direct reports are the children
    const directReportsData: EmployeeData[] = (result.found.children || []).map(
      (child: any) => ({
        id: child.employee_id || child.id || 0,
        name: child.target || "",
        profilePic: child.pic,
        position: child.relationship_id,
        directReports: child.direct_reports,
        indirectReports: child.indirect_reports,
      })
    );

    return { manager: managerData, directReports: directReportsData };
  }, [employee, treeData]);

  /**
   * Handles click on manager or direct report
   * Opens the sidebar with the clicked employee's details
   * @param emp - Employee data to display
   */
  const handleEmployeeClick = (emp: EmployeeData) => {
    dispatch(setSidebarEmployee(emp));
  };

  if (!isOpen || !employee) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 ease-in-out md:max-w-md ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
        aria-describedby="sidebar-description"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2
              id="sidebar-title"
              className="text-lg font-semibold text-gray-900"
            >
              Employee Details
            </h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Close employee details sidebar"
              aria-describedby="sidebar-description"
            >
              <svg
                className="h-6 w-6"
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
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div id="sidebar-description" className="sr-only">
              Employee details for {employee.name}
              {employee.position && `, ${employee.position}`}
            </div>
            <div className="flex flex-col gap-6">
              {/* Profile Picture */}
              <div
                className="flex justify-center"
                role="img"
                aria-label={`Profile picture of ${employee.name}`}
              >
                <Avatar
                  src={employee.profilePic}
                  alt={employee.name || "Employee"}
                  size="xl"
                  className="border-4 border-gray-100"
                />
              </div>

              {/* Name and Title */}
              <div className="text-center">
                <h3
                  className="text-2xl font-bold text-gray-900"
                  id="employee-name"
                >
                  {employee.name}
                </h3>
                {employee.position && (
                  <p
                    className="mt-1 text-lg text-gray-600"
                    id="employee-position"
                  >
                    {employee.position}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                {/* Email */}
                {employee.email && (
                  <div className="border-b border-gray-100 pb-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-base text-gray-900">
                      <a
                        href={`mailto:${employee.email}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {employee.email}
                      </a>
                    </p>
                  </div>
                )}

                {/* Manager */}
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-sm font-medium text-gray-500">Manager</p>
                  {manager ? (
                    <button
                      onClick={() => handleEmployeeClick(manager)}
                      className="mt-2 flex w-full items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                      aria-label={`View details for manager ${manager.name}`}
                    >
                      <Avatar
                        src={manager.profilePic}
                        alt={manager.name || "Manager"}
                        size="md"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {manager.name}
                        </p>
                        {manager.position && (
                          <p className="text-xs text-gray-500">
                            {manager.position}
                          </p>
                        )}
                      </div>
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400 italic">
                      No manager assigned
                    </p>
                  )}
                </div>

                {/* Direct Reports */}
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-sm font-medium text-gray-500">
                    Direct Reports{" "}
                    {directReports.length > 0 && `(${directReports.length})`}
                  </p>
                  {directReports.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {directReports.map((report, index) => (
                        <button
                          key={report.id}
                          onClick={() => handleEmployeeClick(report)}
                          className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                          aria-label={`View details for direct report ${
                            index + 1
                          }: ${report.name}${
                            report.position ? `, ${report.position}` : ""
                          }`}
                        >
                          <Avatar
                            src={report.profilePic}
                            alt={report.name || "Employee"}
                            size="md"
                          />
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">
                              {report.name}
                            </p>
                            {report.position && (
                              <p className="text-xs text-gray-500">
                                {report.position}
                              </p>
                            )}
                            {(report.directReports !== undefined ||
                              report.indirectReports !== undefined) && (
                              <p className="text-xs text-gray-400">
                                {report.directReports || 0} direct,{" "}
                                {report.indirectReports || 0} indirect
                              </p>
                            )}
                          </div>
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400 italic">
                      No direct reports
                    </p>
                  )}
                </div>

                {/* Additional Details */}
                {employee.department && (
                  <div className="border-b border-gray-100 pb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Department
                    </p>
                    <p className="mt-1 text-base text-gray-900">
                      {employee.department}
                    </p>
                  </div>
                )}

                {employee.phone && (
                  <div className="border-b border-gray-100 pb-4">
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="mt-1 text-base text-gray-900">
                      <a
                        href={`tel:${employee.phone}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {employee.phone}
                      </a>
                    </p>
                  </div>
                )}

                {employee.directReports !== undefined && (
                  <div className="border-b border-gray-100 pb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Direct Reports
                    </p>
                    <p className="mt-1 text-base text-gray-900">
                      {employee.directReports}
                    </p>
                  </div>
                )}

                {employee.indirectReports !== undefined && (
                  <div className="border-b border-gray-100 pb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Indirect Reports
                    </p>
                    <p className="mt-1 text-base text-gray-900">
                      {employee.indirectReports}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
