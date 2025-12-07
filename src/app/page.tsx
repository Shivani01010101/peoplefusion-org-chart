"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrgChart } from "@/store/slices/orgChartSlice";
import { Header } from "@/components/org-chart/Header";
import { SearchBar } from "@/components/org-chart/SearchBar";
import { Sidebar } from "@/components/org-chart/Sidebar";
import { ChartContainer } from "@/components/org-chart/ChartContainer";

export default function OrgChartPage() {
  const dispatch = useAppDispatch();
  const treeData = useAppSelector((state) => state.orgChart.treeData);
  const loading = useAppSelector((state) => state.orgChart.loading);

  // Default employee ID to load on initial render
  const defaultEmployeeId = 18;

  useEffect(() => {
    // Fetch org chart data on mount
    if (!treeData && !loading) {
      dispatch(fetchOrgChart(defaultEmployeeId));
    }
  }, [dispatch, treeData, loading]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Search */}
        <div className="w-80 border-r border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Search Employees
            </h2>
            <SearchBar />
          </div>
        </div>

        {/* Center - Chart Container */}
        <div className="flex-1 overflow-hidden">
          <ChartContainer>
            {/* Chart visualization will go here */}
            <div className="flex h-full w-full items-center justify-center p-8">
              <p className="text-gray-500">
                Chart visualization component will be rendered here
              </p>
            </div>
          </ChartContainer>
        </div>
      </div>

      {/* Right Sidebar - Employee Details */}
      <Sidebar />
    </div>
  );
}
