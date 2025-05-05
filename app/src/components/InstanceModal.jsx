// components/InstanceModal.jsx
'use client';

import { Layers, X, ChevronDown } from 'lucide-react';

export default function InstanceModal({
  isOpen,
  onClose,
  instances,
  division,
  moduleParam,
  primaryColor,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#1C1C24] rounded-lg w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <Layers className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Instancias abiertas
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto space-y-3">
          {/* Instancia actual (ejemplo dinámico) */}
          {instances.map((instancia, index) => (
            <div
              key={instancia.id}
              className="cursor-pointer bg-gray-50 dark:bg-[#252530] rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm"
            >
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {division.charAt(0).toUpperCase() + division.slice(1)}
                    </span>
                    <span className="mx-2 text-gray-400 dark:text-gray-600">›</span>
                    <span className="text-sm text-gray-800 dark:text-white">
                      {moduleParam.charAt(0).toUpperCase() + moduleParam.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span
                      className="flex items-center justify-center w-5 h-5 text-xs text-white rounded-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {instances.length}
                    </span>
                    <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                      Instancias abiertas
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}