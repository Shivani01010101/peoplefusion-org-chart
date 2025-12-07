"use client";

import React from "react";

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = "Organizational Chart" }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Additional header actions can go here */}
        </div>
      </div>
    </header>
  );
};

