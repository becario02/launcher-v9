'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { useSyncModules } from '@/hooks/useSyncModules';

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [preselectedCompany, setPreselectedCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState(null);
  const syncingRef = useRef(false);
  const lastSyncedCompanyRef = useRef(null);
  const { syncModules, isLoading: syncingModules, error: syncError } = useSyncModules();

  const handleSyncModules = useCallback(async (company) => {
    if (!company || !company.urlErp || !company.idUserCompanyConnection) {
      return;
    }

    if (syncingRef.current) {
      return;
    }

    const companyKey = `${company.idUserCompanyConnection}-${company.name}`;
    if (lastSyncedCompanyRef.current === companyKey) {
      return;
    }

    try {
      syncingRef.current = true;
      lastSyncedCompanyRef.current = companyKey;
      
      const result = await syncModules(company);
      
      if (result && result.success && result.message) {
        setSyncSuccessMessage(result.message);
      }
    } catch (error) {
      setSyncSuccessMessage(null);
    } finally {
      syncingRef.current = false;
      setTimeout(() => {
        lastSyncedCompanyRef.current = null;
        setSyncSuccessMessage(null);
      }, 5000);
    }
  }, [syncModules]);

  useEffect(() => {
    setSyncSuccessMessage(null);
  }, [selectedCompany]);

  const saveCompanyData = useCallback((company) => {
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    
    if (company?.idCompany) {
      Cookies.set('idCompany', company.idCompany.toString());
    }
  }, []);

  const clearCompanyData = useCallback(() => {
    localStorage.removeItem('selectedCompany');
    Cookies.remove('idCompany');
  }, []);

  useEffect(() => {
    if (hasInitialized) return;

    setLoading(true);
    const userData = localStorage.getItem('userData');
    
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        
        if (parsedData.data && Array.isArray(parsedData.data)) {
          setCompanies(parsedData.data);

          const savedCompany = localStorage.getItem('selectedCompany');

          if (savedCompany) {
            const company = JSON.parse(savedCompany);
            setSelectedCompany(company);
            
            if (company?.idCompany) {
              Cookies.set('idCompany', company.idCompany.toString());
            }
            
          } else if (parsedData.data.length === 1) {
            const onlyCompany = parsedData.data[0];
            setSelectedCompany(onlyCompany);
            saveCompanyData(onlyCompany);
            
            setTimeout(() => {
              handleSyncModules(onlyCompany);
            }, 1000);
            
          } else if (parsedData.data.length > 1) {
            setShowCompanyModal(true);
          }
        }
      } catch (error) {
      }
    } else {
    }
    
    setLoading(false);
    setHasInitialized(true);
  }, [handleSyncModules, hasInitialized, saveCompanyData]);

  const selectCompany = useCallback((company) => {
    setSelectedCompany(company);
    setShowCompanyModal(false);
    setPreselectedCompany(null);
    saveCompanyData(company);
  }, [saveCompanyData]);

  const connectAndSync = useCallback((company) => {
    setSelectedCompany(company);
    setShowCompanyModal(false);
    setPreselectedCompany(null);
    saveCompanyData(company);
    
    setTimeout(() => {
      handleSyncModules(company);
    }, 500);
  }, [handleSyncModules, saveCompanyData]);

  const openCompanySelector = useCallback(() => {
    setShowCompanyModal(true);
  }, []);

  const manualSync = useCallback(() => {
    if (selectedCompany) {
      handleSyncModules(selectedCompany);
    } else {
    }
  }, [selectedCompany, handleSyncModules]);

  const clearCompany = useCallback(() => {
    setSelectedCompany(null);
    setPreselectedCompany(null);
    setShowCompanyModal(false);
    setSyncSuccessMessage(null);
    clearCompanyData();
  }, [clearCompanyData]);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        selectedCompany,
        preselectedCompany,
        setPreselectedCompany,
        
        showCompanyModal,
        setShowCompanyModal,
        
        selectCompany,
        connectAndSync,    
        openCompanySelector,
        manualSync,
        clearCompany,
        
        loading,
        syncingModules,
        syncError,
        syncSuccessMessage,
        isSyncing: syncingRef.current
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany debe usarse dentro de un CompanyProvider');
  }
  return context;
}