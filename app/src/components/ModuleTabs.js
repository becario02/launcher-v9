'use client';

import { X } from 'lucide-react';
import { useTabs } from '@/context/tabs';

const ModuleTabs = () => {
  const { tabs, activeTabId, removeTab, switchTab } = useTabs();

  if (tabs.length === 0) return null;

  return (
    <div className="w-full border-t border-gray-200 mt-2">
      <div className="w-full flex flex-wrap items-center">
        {tabs.map((tab) => (
          <div
            key={tab.uniqueId}
            className={`group relative flex items-center min-w-[120px] px-4 py-2 border-b-2 cursor-pointer
              ${activeTabId === tab.uniqueId 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => switchTab(tab.uniqueId)}
          >
            <span className="truncate">{tab.displayName || tab.name}</span>
            <button
              className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 p-1 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.uniqueId);
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleTabs;