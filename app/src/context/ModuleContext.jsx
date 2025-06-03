"use client";

import { createContext, useContext, useState } from "react";

const ModuleContext = createContext();

export function ModuleProvider({ children }) {
  const [currentModule, setCurrentModule] = useState(null);

  const setModuleData = (moduleData) => {
    setCurrentModule(moduleData);
  };

  const clearModuleData = () => {
    setCurrentModule(null);
  };

  const value = {
    currentModule,
    setModuleData,
    clearModuleData,
  };

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModule() {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModule must be used within a ModuleProvider");
  }
  return context;
}