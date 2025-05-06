// components/ProfileSkeletonLoader.jsx
'use client';

import React from 'react';

const ProfileSkeletonLoader = () => {
  return (
    <div className="space-y-4">
      {/* BLOQUE DE PERFIL */}
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-60 pt-2">
          {/* Skeleton for section title */}
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
          {/* Skeleton for section description */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mt-2 animate-pulse"></div>
          {/* Skeleton for edit button */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-28 mt-3 animate-pulse"></div>
        </div>
        <div className="flex-1">
          <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm space-y-6">
            {/* Avatar skeleton */}
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-16 mb-1 animate-pulse"></div>
              <div className="w-[70px] h-[70px] rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </div>

            {/* Nombre skeleton */}
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-16 mb-1 animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-40 animate-pulse"></div>
            </div>

            {/* Correo skeleton */}
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-16 mb-1 animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE EMPRESA */}
      <div className="flex flex-col md:flex-row gap-10 mt-8">
        <div className="w-full md:w-60 pt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mt-2 animate-pulse"></div>
        </div>
        <div className="flex-1">
          <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm space-y-6">
            {/* Empresa skeleton */}
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-16 mb-1 animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-40 animate-pulse"></div>
            </div>

            {/* Perfil de usuario skeleton */}
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-28 mb-1 animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-36 animate-pulse"></div>
            </div>

            {/* Miembro desde skeleton */}
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-28 mb-1 animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-40 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE SESIONES */}
      <div className="flex flex-col md:flex-row gap-10 mt-8">
        <div className="w-full md:w-60 pt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mt-2 animate-pulse"></div>
        </div>
        <div className="flex-1">
          <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-24 mb-2 animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse"></div>
              <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 ml-3 animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeletonLoader;