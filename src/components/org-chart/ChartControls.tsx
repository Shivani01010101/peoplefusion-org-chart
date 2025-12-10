"use client";

import React, { useState, useEffect, useRef } from "react";

/**
 * ChartControls Component
 *
 * Floating control panel for the organizational chart.
 * Provides:
 * - Zoom controls (in/out/reset)
 * - Download/export functionality
 * - Visibility toggle (eye icon) to show/hide view mode dropdown
 * - View mode selection (Manager, Matrix, HRBP, etc.)
 *
 * Positioned as a floating panel on the right side of the chart area
 */
export const ChartControls: React.FC = () => {
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState("Manager");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const viewOptions = ["Manager", "Matrix", "HRBP", "Second Manager", "Title"];

  /**
   * Handle zoom in - increase zoom by 10% up to 200%
   */
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  /**
   * Handle zoom out - decrease zoom by 10% down to 50%
   */
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  /**
   * Toggle dropdown visibility on eye icon click
   */
  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  /**
   * Apply zoom to the chart container
   * The zoom is applied via CSS transform scale
   * Adjusts the wrapper to ensure all content is visible, especially left cards
   */
  useEffect(() => {
    const chartContainer = document.querySelector(
      '[data-chart-container="true"]'
    ) as HTMLElement;
    const chartWrapper = document.querySelector(
      '[data-chart-wrapper="true"]'
    ) as HTMLElement;

    if (chartContainer && chartWrapper) {
      const scale = zoom / 100;

      // Use a timeout to ensure DOM is ready
      setTimeout(() => {
        // Get natural dimensions by temporarily removing transform
        const hadTransform = chartContainer.style.transform !== "";
        chartContainer.style.transform = "none";
        const naturalWidth =
          chartContainer.offsetWidth || chartContainer.scrollWidth;
        const naturalHeight =
          chartContainer.offsetHeight || chartContainer.scrollHeight;

        // Apply zoom transform
        chartContainer.style.transform = `scale(${scale})`;
        chartContainer.style.transformOrigin = "top center";
        chartContainer.style.transition = "transform 0.2s ease-in-out";

        // Calculate scaled dimensions
        const scaledWidth = naturalWidth * scale;
        const scaledHeight = naturalHeight * scale;

        // Add generous padding to ensure left/right cards are never cut off
        const horizontalPadding = Math.max(300, naturalWidth * 0.15); // At least 300px or 15% padding
        const verticalPadding = 100;

        // Set wrapper dimensions to accommodate scaled content
        chartWrapper.style.minWidth = `${
          scaledWidth + horizontalPadding * 2
        }px`;
        chartWrapper.style.minHeight = `${scaledHeight + verticalPadding}px`;

        // Ensure content is centered horizontally
        chartWrapper.style.display = "flex";
        chartWrapper.style.justifyContent = "center";
        chartWrapper.style.alignItems = "flex-start";
        chartWrapper.style.paddingLeft = `${horizontalPadding}px`;
        chartWrapper.style.paddingRight = `${horizontalPadding}px`;
      }, 0);
    }
  }, [zoom]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-2 top-2 md:right-4 md:top-4 z-10 rounded-lg border border-gray-200 bg-white/95 p-2 md:p-4 shadow-lg backdrop-blur-sm max-w-[200px] md:max-w-none"
    >
      {/* Zoom Controls */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Zoom out"
          disabled={zoom <= 50}
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
              d="M20 12H4"
            />
          </svg>
        </button>
        <span className="min-w-12 text-center text-sm font-medium text-gray-700">
          {zoom}%
        </span>
        <button
          onClick={handleZoomIn}
          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Zoom in"
          disabled={zoom >= 200}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button
          className="ml-2 rounded p-1.5 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Download"
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
        <button
          onClick={handleToggleDropdown}
          className={`rounded p-1.5 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            isDropdownOpen ? "bg-gray-100" : ""
          }`}
          aria-label="Toggle view mode options"
          aria-expanded={isDropdownOpen}
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      </div>

      {/* View Mode Options Dropdown - Only visible when eye icon is clicked */}
      {isDropdownOpen && (
        <div className="space-y-2 animate-fade-in">
          {viewOptions.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="viewMode"
                value={option}
                checked={viewMode === option}
                onChange={(e) => setViewMode(e.target.value)}
                className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
