'use client';

import { useState, useEffect } from 'react';
import { X, Building, Search, XCircle } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import clsx from 'clsx';
import axios from 'axios';

export default function IntegratorCompaniesModal({ 
  isOpen, 
  onClose, 
  integrator,
  onSuccess
}) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    companyIds: []
  });
  
  // Estados para el buscador de compañías
  const [companySearch, setCompanySearch] = useState('');
  const [allCompanies, setAllCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [integratorCompanies, setIntegratorCompanies] = useState([]);
  const [initialCompanyIds, setInitialCompanyIds] = useState([]);

  // Estados para el envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar todas las compañías al abrir el modal
  const fetchAllCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const response = await axios.get('/api/companies', {
        headers: {
          'accept': '*/*'
        }
      });
      
      if (response.data && response.data.statusCode === "200" && response.data.data) {
        setAllCompanies(response.data.data);
        setFilteredCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar compañías:', error);
      setAllCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  // Cargar compañías del integrador
  const fetchIntegratorCompanies = async () => {
    if (!integrator?.idIntegrator) return;
    
    try {
      const response = await axios.get('/api/integrator/companies', {
        params: { idIntegrator: integrator.idIntegrator },
        headers: {
          'accept': '*/*'
        }
      });
      
      if (response.data && response.data.statusCode === "200" && response.data.data) {
        // Usar la nueva estructura: extraer los idCompany de las compañías asignadas
        const assignedCompanyIds = response.data.data.map(c => c.idCompany);
        setIntegratorCompanies(response.data.data);
        setInitialCompanyIds(assignedCompanyIds);
        setFormData({ companyIds: assignedCompanyIds });
      }
    } catch (error) {
      console.error('Error al cargar compañías del integrador:', error);
      setIntegratorCompanies([]);
      setInitialCompanyIds([]);
      setFormData({ companyIds: [] });
    }
  };

  // Inicialización del modal
  useEffect(() => {
    if (isOpen && integrator) {
      setCompanySearch('');
      fetchAllCompanies();
      fetchIntegratorCompanies();
    }
  }, [isOpen, integrator]);

  // Función para buscar compañías
  const searchCompanies = async (query) => {
    setIsLoadingCompanies(true);
    try {
      const response = await axios.get('/api/companies', {
        params: { search: query },
        headers: {
          'accept': '*/*'
        }
      });
      
      if (response.data && response.data.statusCode === "200" && response.data.data) {
        const orderedCompanies = getSortedCompanies(response.data.data, initialCompanyIds);
        setFilteredCompanies(orderedCompanies);
      }
    } catch (error) {
      console.error('Error al buscar compañías:', error);
      setFilteredCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  };
  
  // Ordenar las compañías para mostrar primero las asignadas
  const getSortedCompanies = (companies, selectedIds) => {
    if (!companies || companies.length === 0) return [];
    
    return [...companies].sort((a, b) => {
      // Usar idCompany para la comparación en la lista general de compañías
      const aIsSelected = selectedIds.includes(a.idCompany);
      const bIsSelected = selectedIds.includes(b.idCompany);
      
      if (aIsSelected && !bIsSelected) return -1;
      if (!aIsSelected && bIsSelected) return 1;
      
      return a.name.localeCompare(b.name);
    });
  };
  
  // Seleccionar o deseleccionar todas las compañías
  const toggleSelectAllCompanies = (selectAll) => {
    // Solo trabajar con compañías que no estaban inicialmente asignadas
    const availableCompanies = filteredCompanies.filter(company => 
      !initialCompanyIds.includes(company.idCompany)
    );
    
    if (selectAll) {
      const availableIds = availableCompanies.map(company => company.idCompany);
      setFormData(prev => ({
        ...prev,
        companyIds: [...new Set([...prev.companyIds, ...availableIds])]
      }));
    } else {
      const availableIds = availableCompanies.map(company => company.idCompany);
      setFormData(prev => ({
        ...prev,
        companyIds: prev.companyIds.filter(id => !availableIds.includes(id))
      }));
    }
  };

  // Efecto para buscar compañías cuando cambia el término de búsqueda
  useEffect(() => {
    if (!companySearch.trim()) {
      const orderedCompanies = getSortedCompanies(allCompanies, initialCompanyIds);
      setFilteredCompanies(orderedCompanies);
      return;
    }
    
    const delayDebounce = setTimeout(() => {
      searchCompanies(companySearch);
    }, 300);
    
    return () => clearTimeout(delayDebounce);
  }, [companySearch, allCompanies, initialCompanyIds]);

  const handleCompanyChange = (e) => {
    const { value, checked } = e.target;
    const companyId = parseInt(value);
    
    // No permitir desmarcar compañías que estaban inicialmente asignadas
    if (!checked && initialCompanyIds.includes(companyId)) {
      return;
    }
    
    setFormData(prev => {
      const updatedCompanyIds = checked
        ? [...prev.companyIds, companyId]
        : prev.companyIds.filter(id => id !== companyId);
      
      return { ...prev, companyIds: updatedCompanyIds };
    });
  };

  // Manejar cambio en el input de búsqueda
  const handleCompanySearchChange = (e) => {
    setCompanySearch(e.target.value);
  };

  // Limpiar la búsqueda
  const clearCompanySearch = () => {
    setCompanySearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!integrator?.idIntegrator) {
      console.error('No hay integrador seleccionado');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/integrator/assign-companies', {
        idIntegrator: integrator.idIntegrator,
        companyIds: formData.companyIds
      }, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.statusCode === "200") {
        if (onSuccess) {
          onSuccess({
            type: 'success',
            message: `Compañías actualizadas para ${integrator.name}`
          });
        }
        
        handleClose();
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al asignar compañías:', error);
      
      if (onSuccess) {
        onSuccess({
          type: 'error',
          message: 'Error al actualizar las compañías del integrador'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ companyIds: [] });
    setCompanySearch('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Gestionar Compañías - {integrator?.name}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-4">
            {/* Información del integrador */}
            <div className="bg-gray-50 dark:bg-[#262631] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {integrator?.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {integrator?.description}
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Tipos de archivo: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">{integrator?.uploadFileTypes}</span>
              </div>
            </div>

            {/* Selección de compañías */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Compañías Asignadas
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.companyIds.length} seleccionadas
                </span>
              </div>
              
              {/* Buscador de compañías */}
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                
                <input
                  type="text"
                  placeholder="Buscar compañía por nombre..."
                  value={companySearch}
                  onChange={handleCompanySearchChange}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 py-2 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:border-[#4a4c57] dark:bg-[#262631] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ '--tw-ring-color': primaryColor }}
                />
                
                {companySearch && (
                  <button
                    type="button"
                    onClick={clearCompanySearch}
                    disabled={isSubmitting}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                  </button>
                )}
              </div>
              
              {/* Lista de compañías */}
              <div className="border border-gray-200 dark:border-[#4a4c57] rounded-md bg-gray-50 dark:bg-[#262631] max-h-96 overflow-hidden flex flex-col">
                {isLoadingCompanies ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : filteredCompanies.length === 0 ? (
                  <div className="flex justify-center items-center py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      {companySearch 
                        ? 'No se encontraron compañías con ese nombre' 
                        : 'No hay compañías disponibles'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Opción para seleccionar/deseleccionar todas */}
                    <div className="sticky top-0 p-3 bg-gray-50 dark:bg-[#262631] border-b border-gray-200 dark:border-gray-700 z-10">
                      <div 
                        className={clsx(
                          "flex items-center p-2 rounded-md transition-colors",
                          filteredCompanies.length > 0 && filteredCompanies.every(c => formData.companyIds.includes(c.idCompany)) 
                            ? "bg-primary/15 dark:bg-primary/25 border border-primary/20 dark:border-[#4a4c57]" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent"
                        )}
                      >
                        <input
                          type="checkbox"
                          id="select-all-companies"
                          checked={
                            filteredCompanies.length > 0 && 
                            filteredCompanies
                              .filter(c => !initialCompanyIds.includes(c.idCompany))
                              .every(c => formData.companyIds.includes(c.idCompany))
                          }
                          onChange={(e) => toggleSelectAllCompanies(e.target.checked)}
                          disabled={isSubmitting || filteredCompanies.filter(c => !initialCompanyIds.includes(c.idCompany)).length === 0}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary dark:border-gray-600 dark:focus:ring-primary disabled:opacity-50"
                        />
                        <label
                          htmlFor="select-all-companies"
                          className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer w-full"
                        >
                          {filteredCompanies.length > 0 && 
                           filteredCompanies
                             .filter(c => !initialCompanyIds.includes(c.idCompany))
                             .every(c => formData.companyIds.includes(c.idCompany))
                            ? 'Deseleccionar nuevas'
                            : 'Seleccionar todas disponibles'}
                        </label>
                      </div>
                    </div>
                    
                    {/* Lista de compañías con scroll */}
                    <div className="p-3 overflow-y-auto custom-scrollbar flex-1">
                      <div className="space-y-2">
                        {filteredCompanies.map(company => (
                          <div 
                            key={company.idCompany} 
                            className={clsx(
                              "flex items-start p-2 rounded-md transition-colors",
                              formData.companyIds.includes(company.idCompany) 
                                ? "bg-primary/15 dark:bg-primary/25 border border-primary/20 dark:border-[#4a4c57]" 
                                : "hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent"
                            )}
                          >
                            <input
                              type="checkbox"
                              id={`company-${company.idCompany}`}
                              value={company.idCompany}
                              checked={formData.companyIds.includes(company.idCompany)}
                              onChange={handleCompanyChange}
                              disabled={isSubmitting || initialCompanyIds.includes(company.idCompany)}
                              className="h-4 w-4 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary dark:border-gray-600 dark:focus:ring-primary disabled:opacity-50"
                            />
                            <label
                              htmlFor={`company-${company.idCompany}`}
                              className={`ml-2 w-full ${initialCompanyIds.includes(company.idCompany) ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              <div className="flex items-center gap-1">
                                <Building className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className={clsx(
                                  "text-sm",
                                  formData.companyIds.includes(company.idCompany) 
                                    ? "text-primary-600 dark:text-primary-400 font-medium" 
                                    : "text-gray-800 dark:text-gray-200",
                                  initialCompanyIds.includes(company.idCompany) && "opacity-75"
                                )}>
                                  {company.name}
                                  {initialCompanyIds.includes(company.idCompany) && (
                                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(Asignada)</span>
                                  )}
                                </span>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C38] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Procesando...' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isSubmitting ? 'Actualizando Compañías...' : 'Actualizar Compañías'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}