"use client";

import React from "react";

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="flex h-full w-full items-start justify-center overflow-auto p-8">
      <div className="flex flex-col items-center gap-8">
        {/* Root Node Skeleton */}
        <div className="flex flex-col items-center">
          <div className="h-32 w-56 animate-pulse rounded-lg bg-gray-200"></div>
          <div className="mt-4 h-4 w-0.5 bg-gray-300"></div>
        </div>

        {/* Children Nodes Skeleton */}
        <div className="flex items-start gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-4 w-0.5 bg-gray-300"></div>
              <div className="mt-4 h-28 w-48 animate-pulse rounded-lg bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const NodeSkeleton: React.FC = () => {
  return (
    <div className="flex min-w-[220px] max-w-[240px] animate-pulse flex-col rounded-lg border-2 border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="h-3 w-32 rounded bg-gray-200"></div>
          <div className="h-3 w-16 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
};
