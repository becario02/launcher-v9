// components/SkeletonLoader.jsx
'use client';

import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-60 pt-2">
          {/* Skeleton for section title */}
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
          {/* Skeleton for section description */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mt-2 animate-pulse"></div>
        </div>
        <div className="flex-1">
          <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm space-y-5">
            {/* Avatar skeleton */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse"></div>
            </div>

            {/* Form fields skeleton */}
            <div className="space-y-4 text-sm">
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-24 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-16 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-20 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full animate-pulse"></div>
                <div className="mt-2 flex justify-end">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-36 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme color skeleton */}
      <div className="flex flex-col md:flex-row gap-10 mt-8">
        <div className="w-full md:w-60 pt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-28 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mt-2 animate-pulse"></div>
        </div>
        <div className="flex-1">
          <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-4 shadow-sm">
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Theme mode skeleton */}
      <div className="flex flex-col md:flex-row gap-10 mt-8">
        <div className="w-full md:w-60 pt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-28 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mt-2 animate-pulse"></div>
        </div>
        <div className="flex-1">
          <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-4 shadow-sm">
            <div className="flex gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="w-14 h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save button skeleton */}
      <div className="flex justify-end mt-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;