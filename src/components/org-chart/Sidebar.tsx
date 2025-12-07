"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeSidebar } from "@/store/slices/orgChartSlice";

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.orgChart.isSidebarOpen);
  const employee = useAppSelector((state) => state.orgChart.sidebarEmployee);

  const handleClose = () => {
    dispatch(closeSidebar());
  };

  if (!isOpen || !employee) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Employee Details
            </h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close sidebar"
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
            <div className="flex flex-col items-center gap-6">
              {/* Profile Picture */}
              {employee.profilePic && (
                <div className="relative">
                  <img
                    src={employee.profilePic}
                    alt={employee.name}
                    className="h-32 w-32 rounded-full object-cover border-4 border-gray-100"
                  />
                </div>
              )}

              {/* Name */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {employee.name}
                </h3>
                {employee.position && (
                  <p className="mt-1 text-lg text-gray-600">{employee.position}</p>
                )}
              </div>

              {/* Details */}
              <div className="w-full space-y-4">
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

                {employee.email && (
                  <div className="border-b border-gray-100 pb-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-base text-gray-900">
                      {employee.email}
                    </p>
                  </div>
                )}

                {employee.phone && (
                  <div className="border-b border-gray-100 pb-4">
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="mt-1 text-base text-gray-900">
                      {employee.phone}
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

