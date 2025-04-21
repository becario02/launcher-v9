'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [preselectedCompany, setPreselectedCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar las empresas y la selección del localStorage al iniciar
  useEffect(() => {
    setLoading(true);
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData.data && Array.isArray(parsedData.data)) {
          setCompanies(parsedData.data);

          const savedCompany = localStorage.getItem('selectedCompany');

          if (savedCompany) {
            // Si ya hay una empresa seleccionada, usarla
            setSelectedCompany(JSON.parse(savedCompany));
          } else if (parsedData.data.length === 1) {
            // Si solo hay una empresa, seleccionarla automáticamente
            const onlyCompany = parsedData.data[0];
            setSelectedCompany(onlyCompany);
            localStorage.setItem('selectedCompany', JSON.stringify(onlyCompany));
          } else if (parsedData.data.length > 1) {
            // Si hay más de una empresa, abrir el modal
            setShowCompanyModal(true);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Función para seleccionar una empresa
  const selectCompany = (company) => {
    setSelectedCompany(company);
    setShowCompanyModal(false);
    setPreselectedCompany(null);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
  };

  // Función para abrir el selector de empresas
  const openCompanySelector = () => {
    setShowCompanyModal(true);
  };

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
        openCompanySelector,
        loading
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