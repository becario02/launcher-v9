'use client';

import React from 'react';

const NotificationsSkeletonLoader = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Columna izquierda (solo visible en lg) */}
        <div className="w-full md:hidden lg:block md:w-60 pt-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full animate-pulse"></div>
        </div>
        
        {/* Columna principal (contenido) */}
        <div className="flex-1">
          <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl shadow-sm overflow-hidden p-0 md:p-0">
            {/* Renderizar 5 filas de skeleton */}
            {[...Array(5)].map((_, index) => (
              <div 
                key={index}
                className={`relative p-4 md:p-5 lg:p-6 animate-pulse ${
                  index !== 4 ? "border-b border-gray-100 dark:border-[#2C2C38]" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icono */}
                  <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                  
                  <div className="flex-1">
                    {/* Título y fecha */}
                    <div className="mb-1 flex flex-col">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-1"></div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
                    </div>
                    
                    {/* Descripción */}
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                  
                  {/* Badge - Solo para algunos items */}
                  {index % 2 === 0 && (
                    <div className="ml-2 shrink-0">
                      <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSkeletonLoader;