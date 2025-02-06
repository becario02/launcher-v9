'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

const TabsContext = createContext({});

export function TabsProvider({ children }) {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [tabCounter, setTabCounter] = useState(1);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedTabs = Cookies.get('tabs');
    const savedActiveTab = Cookies.get('activeTabId');
    const savedCounter = Cookies.get('tabCounter');

    if (savedTabs) {
      setTabs(JSON.parse(savedTabs));
    }
    if (savedActiveTab) {
      setActiveTabId(savedActiveTab);
    }
    if (savedCounter) {
      setTabCounter(parseInt(savedCounter));
    }
  }, []);

  useEffect(() => {
    Cookies.set('tabs', JSON.stringify(tabs), { expires: 7 });
    Cookies.set('tabCounter', tabCounter.toString(), { expires: 7 });
    if (activeTabId) {
      Cookies.set('activeTabId', activeTabId, { expires: 7 });
    } else {
      Cookies.remove('activeTabId');
    }
  }, [tabs, activeTabId, tabCounter]);

  const formatUrlName = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/\./g, '')
      .replace(/\s+/g, '-');
  };

  useEffect(() => {
    if (pathname === '/') {
      setActiveTabId(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (tabs.length === 0) {
      router.push('/');
    } else if (activeTabId) {
      const activeTab = tabs.find(tab => tab.uniqueId === activeTabId);
      if (activeTab) {
        router.push(activeTab.path);
      }
    }
  }, [activeTabId, tabs, router]);

  const addTab = (moduleId, moduleName) => {
    const urlPath = formatUrlName(moduleName);
    const uniqueId = `${moduleId}-${tabCounter}`;
    
    const newTab = {
      id: moduleId,
      uniqueId,
      name: moduleName,
      path: `/modulos/${urlPath}`,
      displayName: `${moduleName}${getInstanceNumber(moduleName)}`
    };

    setTabs(prev => [...prev, newTab]);
    setTabCounter(prev => prev + 1);
    setActiveTabId(uniqueId);
  };

  const getInstanceNumber = (moduleName) => {
    const instances = tabs.filter(tab => tab.name === moduleName).length;
    return instances > 0 ? ` (${instances + 1})` : '';
  };

  const removeTab = (uniqueId) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.uniqueId !== uniqueId);
      
      if (activeTabId === uniqueId && newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        setActiveTabId(lastTab.uniqueId);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }
      
      return newTabs;
    });
  };

  const switchTab = (uniqueId) => {
    setActiveTabId(uniqueId);
  };

  return (
    <TabsContext.Provider value={{ 
      tabs, 
      activeTabId, 
      addTab, 
      removeTab, 
      switchTab 
    }}>
      {children}
    </TabsContext.Provider>
  );
}

export const useTabs = () => useContext(TabsContext);