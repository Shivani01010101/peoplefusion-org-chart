"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearchQuery, clearSearch } from "@/store/slices/orgChartSlice";

/**
 * ChartSearchBar Component
 *
 * Search input for filtering employees in the organizational chart.
 * Features:
 * - Real-time search as user types
 * - Filter tags for active search terms
 * - Clear individual filters or all filters
 * - Keyboard accessible (Enter to add filter)
 * - Screen reader support with ARIA labels
 */
export const ChartSearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.orgChart.searchQuery);
  const [filters, setFilters] = useState<string[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(setSearchQuery(value));
  };

  const handleRemoveFilter = (filter: string) => {
    setFilters(filters.filter((f) => f !== filter));
  };

  const handleAddFilter = (filter: string) => {
    if (searchQuery && !filters.includes(searchQuery)) {
      setFilters([...filters, searchQuery]);
      dispatch(clearSearch());
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
        {/* Search Icon */}
        <div className="shrink-0">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter Tags */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <span
                key={filter}
                className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
              >
                {filter}
                <button
                  onClick={() => handleRemoveFilter(filter)}
                  className="hover:text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                  aria-label={`Remove ${filter} filter`}
                  tabIndex={0}
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search Input */}
        <input
          type="search"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchQuery) {
              handleAddFilter(searchQuery);
            }
          }}
          placeholder={filters.length === 0 ? "Search employees..." : ""}
          className="flex-1 border-0 bg-transparent py-1 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
          aria-label="Search employees in organizational chart"
          aria-describedby={filters.length > 0 ? "active-filters" : undefined}
        />
        {filters.length > 0 && (
          <div id="active-filters" className="sr-only">
            {filters.length} active filter{filters.length > 1 ? "s" : ""}:{" "}
            {filters.join(", ")}
          </div>
        )}

        {/* Edit Icon for filters */}
        {filters.length > 0 && (
          <button
            className="shrink-0 text-purple-600 hover:text-purple-700"
            aria-label="Edit filters"
          >
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
