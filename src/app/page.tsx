"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrgChart } from "@/store/slices/orgChartSlice";
import { Header } from "@/components/org-chart/Header";
import { OrgChartTabs } from "@/components/org-chart/OrgChartTabs";
import { ChartSearchBar } from "@/components/org-chart/ChartSearchBar";
import { Sidebar } from "@/components/org-chart/Sidebar";
import { ChartContainer } from "@/components/org-chart/ChartContainer";
import { OrgChartContainer } from "@/components/org-chart/OrgChartContainer";
import { ChartControls } from "@/components/org-chart/ChartControls";
import { ToastContainer } from "@/components/common/Toast";
import { useToast } from "@/hooks/useToast";

/**
 * OrgChartPage Component
 *
 * Main page component for the organizational chart feature.
 *
 * Layout structure:
 * - Header: Breadcrumbs, global search, and action buttons
 * - Main content: Title, description, tabs, search bar, and chart
 * - Sidebar: Employee details panel (slides in from right)
 * - Toast notifications: Error and success messages
 *
 * Features:
 * - Auto-fetches org chart data on mount
 * - Error handling with toast notifications and retry
 * - Responsive design for all screen sizes
 * - WCAG 2.1 AA compliant
 */
export default function OrgChartPage() {
  const dispatch = useAppDispatch();
  const treeData = useAppSelector((state) => state.orgChart.treeData);
  const loading = useAppSelector((state) => state.orgChart.loading);
  const error = useAppSelector((state) => state.orgChart.error);
  const { toasts, showError, removeToast } = useToast();

  // Default employee ID to load on initial render
  const defaultEmployeeId = 21;

  const handleRetry = () => {
    dispatch(fetchOrgChart(defaultEmployeeId));
  };

  useEffect(() => {
    // Fetch org chart data on mount
    if (!treeData && !loading) {
      dispatch(fetchOrgChart(defaultEmployeeId));
    }
  }, [dispatch, treeData, loading]);

  // Show error toast when API fails
  useEffect(() => {
    if (error) {
      const errorMessage =
        error.includes("401") || error.includes("Unauthorized")
          ? "Authentication failed. Please check your credentials."
          : error.includes("404") || error.includes("Not Found")
          ? "Employee not found. Please try a different employee ID."
          : error.includes("500") || error.includes("Internal Server Error")
          ? "Server error. Please try again later."
          : error.includes("Network") || error.includes("timeout")
          ? "Network error. Please check your connection and try again."
          : error;

      showError(errorMessage, {
        showRetry: true,
        onRetry: handleRetry,
      });
    }
  }, [error, showError]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Top Header with Breadcrumbs and Global Search */}
      <Header />

      {/* Main Content Area */}
      <main
        id="main-content"
        className="flex flex-1 flex-col overflow-hidden"
        role="main"
      >
        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Page Title and Description */}
          <div className="border-b border-gray-200 bg-white px-6 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Org Chart</h1>
            <p className="mt-2 text-base text-gray-600">
              This is a collection of all hierarchy in the system, you can view,
              modify existing datasets or create new ones based on your
              preferences.
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white px-6">
            <OrgChartTabs />
          </div>

          {/* Search Bar */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <ChartSearchBar />
          </div>

          {/* Chart Container */}
          <div
            className="relative flex-1 bg-gray-50 overflow-auto"
            style={{ overflowX: "auto", overflowY: "auto" }}
          >
            <ChartContainer>
              <OrgChartContainer />
            </ChartContainer>

            {/* Chart Controls (Zoom, View Options) */}
            <ChartControls />
          </div>
        </div>
      </main>

      {/* Right Sidebar - Employee Details */}
      <Sidebar />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
