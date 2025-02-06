'use client';

import { useTabs } from '@/context/tabs';

export const useModuleRequest = () => {
  const { addTab } = useTabs();

  const handleModuleClick = (moduleId, moduleName) => {
    try {
      addTab(moduleId, moduleName);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    handleModuleClick
  };
};