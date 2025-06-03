// context/CompanyContext.js
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSyncModules } from '@/hooks/useSyncModules';

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [preselectedCompany, setPreselectedCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // REF PARA CONTROLAR SINCRONIZACIONES
  const syncingRef = useRef(false);
  const lastSyncedCompanyRef = useRef(null);

  // Hook para sincronización de módulos
  const { syncModules, isLoading: syncingModules, error: syncError } = useSyncModules();

  // FUNCIÓN PARA SINCRONIZAR
  const handleSyncModules = useCallback(async (company) => {
    if (!company || !company.urlErp || !company.idUserCompanyConnection) {
      console.warn('⚠️ Datos de empresa incompletos para sincronización');
      return;
    }

    if (syncingRef.current) {
      console.log('⏳ Sincronización ya en curso, omitiendo...');
      return;
    }

    const companyKey = `${company.idUserCompanyConnection}-${company.name}`;
    if (lastSyncedCompanyRef.current === companyKey) {
      console.log('⏭️ Empresa ya sincronizada recientemente, omitiendo...');
      return;
    }

    try {
      syncingRef.current = true;
      lastSyncedCompanyRef.current = companyKey;
      
      console.log('🔄 Iniciando sincronización para:', company.name);
      await syncModules(company);
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
    } finally {
      syncingRef.current = false;
      setTimeout(() => {
        lastSyncedCompanyRef.current = null;
      }, 5000);
    }
  }, [syncModules]);

  // ✅ USEEFFECT SIN SINCRONIZACIÓN AL RELOAD
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
            // ✅ CASO 1: EMPRESA YA GUARDADA (RELOAD) - NO SINCRONIZAR
            const company = JSON.parse(savedCompany);
            setSelectedCompany(company);
            console.log('🏢 Empresa cargada desde localStorage (NO se sincroniza automáticamente):', company.name);
            
          } else if (parsedData.data.length === 1) {
            // ✅ CASO 2: SOLO UNA EMPRESA - AUTO-CONECTAR Y SINCRONIZAR
            const onlyCompany = parsedData.data[0];
            setSelectedCompany(onlyCompany);
            localStorage.setItem('selectedCompany', JSON.stringify(onlyCompany));
            console.log('🏢 Auto-conectando única empresa con sincronización:', onlyCompany.name);
            
            // SINCRONIZAR porque es la primera vez que se auto-conecta
            setTimeout(() => {
              handleSyncModules(onlyCompany);
            }, 1000);
            
          } else if (parsedData.data.length > 1) {
            // ✅ CASO 3: MÚLTIPLES EMPRESAS - MOSTRAR MODAL
            setShowCompanyModal(true);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos de empresas:', error);
      }
    } else {
      console.warn('No se encontraron datos de usuario en localStorage');
    }
    
    setLoading(false);
    setHasInitialized(true);
  }, [handleSyncModules]);

  // FUNCIÓN PARA SELECCIONAR EMPRESA (sin sincronización)
  const selectCompany = useCallback((company) => {
    console.log('🏢 Seleccionando empresa (sin sincronización):', company.name);
    
    setSelectedCompany(company);
    setShowCompanyModal(false);
    setPreselectedCompany(null);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
  }, []);

  // ✅ FUNCIÓN PARA CONECTAR DESDE MODAL (CON SINCRONIZACIÓN)
  const connectAndSync = useCallback((company) => {
    console.log('🔗 Conectando desde modal CON sincronización:', company.name);
    
    setSelectedCompany(company);
    setShowCompanyModal(false);
    setPreselectedCompany(null);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    
    // SINCRONIZAR porque el usuario hizo clic en "Conectar"
    setTimeout(() => {
      handleSyncModules(company);
    }, 500);
  }, [handleSyncModules]);

  // Función para abrir el selector de empresas
  const openCompanySelector = useCallback(() => {
    setShowCompanyModal(true);
  }, []);

  // FUNCIÓN PARA SINCRONIZACIÓN MANUAL
  const manualSync = useCallback(() => {
    if (selectedCompany) {
      console.log('🔄 Sincronización manual solicitada');
      handleSyncModules(selectedCompany);
    } else {
      console.warn('No hay empresa seleccionada para sincronizar');
    }
  }, [selectedCompany, handleSyncModules]);

  return (
    <CompanyContext.Provider
      value={{
        // Estados de empresas
        companies,
        selectedCompany,
        preselectedCompany,
        setPreselectedCompany,
        
        // Control del modal
        showCompanyModal,
        setShowCompanyModal,
        
        // Funciones principales
        selectCompany,        // Solo seleccionar, sin sincronizar
        connectAndSync,       // ✅ Conectar CON sincronización (para modal)
        openCompanySelector,
        manualSync,          // Sincronización manual
        
        // Estados de carga y sincronización
        loading,
        syncingModules,
        syncError,
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