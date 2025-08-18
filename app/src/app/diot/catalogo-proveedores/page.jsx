'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Save, RefreshCw, Users, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTokenManager } from '@/hooks/useTokenManager';
import Toast from '@/components/Toast';

const DiotCatalogoProveedores = () => {
  const { primaryColor } = usePrimaryColor();
  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();

  // States
  const [proveedores, setProveedores] = useState([]);
  const [originalProveedores, setOriginalProveedores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipoOperacion, setFilterTipoOperacion] = useState('Todos');
  const [filterTipoProveedor, setFilterTipoProveedor] = useState('Todos');
  const [filterActividadIva, setFilterActividadIva] = useState('Todos');
  const [savingRows, setSavingRows] = useState(new Set());
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Toast states
  const [toasts, setToasts] = useState([]);

  // Hardcoded data for selects
  const tiposOperacion = {
    nacional: [
      { id: 1, clave: '03', descripcion: 'Prestador de servicios profesional' },
      { id: 2, clave: '06', descripcion: 'Arrendamiento' },
      { id: 3, clave: '85', descripcion: 'Otros' },
      { id: 4, clave: '08', descripcion: 'Importación por transferencia virtual' },
      { id: 5, clave: '02', descripcion: 'Enajenación de bienes' }
    ],
    extranjero: [
      { id: 5, clave: '02', descripcion: 'Enajenación de bienes' },
      { id: 1, clave: '03', descripcion: 'Prestador de servicios profesional' },
      { id: 6, clave: '07', descripcion: 'Importación de bienes o servicios' }
    ],
    global: [
      { id: 7, clave: '87', descripcion: 'Operaciones globales' }
    ]
  };

  const tiposProveedor = [
    { id: 1, clave: '04', descripcion: 'Nacional' },
    { id: 2, clave: '05', descripcion: 'Extranjero' },
    { id: 3, clave: '15', descripcion: 'Global' }
  ];

  const actividadesIva = [
    { id: 1, clave: '1', descripcion: 'Actividades Zona Norte' },
    { id: 2, clave: '2', descripcion: 'Actividades Zona Sur' },
    { id: 3, clave: '3', descripcion: 'General 16%' },
    { id: 4, clave: '4', descripcion: 'Importación tangibles' },
    { id: 5, clave: '5', descripcion: 'Importación intangibles' }
  ];

  // Helper functions
  const getProviderType = (rfc) => {
    if (!rfc) return 'nacional';
    const upperRfc = rfc.toUpperCase();
    if (upperRfc === 'XAXX010101000') return 'global';
    if (upperRfc === 'XEXX010101000') return 'extranjero';
    return 'nacional';
  };

  const getAvailableOperations = (rfc) => {
    const providerType = getProviderType(rfc);
    return tiposOperacion[providerType] || tiposOperacion.nacional;
  };

  const getAllTiposOperacion = () => {
    return [
      ...tiposOperacion.nacional,
      ...tiposOperacion.extranjero,
      ...tiposOperacion.global
    ].filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
  };

  // Toast functions
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  // Check if a row has changes and all required fields are filled
  const hasRowChanges = useCallback((clave) => {
    const currentRow = proveedores.find(p => p.clave === clave);
    const originalRow = originalProveedores.find(p => p.clave === clave);
    
    if (!currentRow || !originalRow) return false;
    
    return (
      currentRow.tipoOperacion !== originalRow.tipoOperacion ||
      currentRow.tipoProveedor !== originalRow.tipoProveedor ||
      currentRow.actividadIva !== originalRow.actividadIva
    );
  }, [proveedores, originalProveedores]);

  // Check if all required fields are filled for a row
  const isRowValid = useCallback((proveedor) => {
    return (
      proveedor.tipoOperacion && 
      proveedor.tipoProveedor && 
      proveedor.actividadIva
    );
  }, []);

  // Check if row can be saved (has changes AND all fields are filled)
  const canSaveRow = useCallback((clave) => {
    const proveedor = proveedores.find(p => p.clave === clave);
    if (!proveedor) return false;
    
    return hasRowChanges(clave) && isRowValid(proveedor);
  }, [proveedores, hasRowChanges, isRowValid]);

  // Transform API data
  const transformApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map(item => ({
      clave: item.clienteClave,
      nombre: item.clienteNombre,
      rfc: item.clienteRfc,
      domicilio: item.domicilio,
      cp: item.clienteCp,
      colonia: item.colonia,
      estado: item.estadoDes,
      localidad: item.localidadDes,
      tipoOperacion: item.pTipoOperacion,
      tipoProveedor: item.pTipoProveedor,
      actividadIva: item.pActoActividadIva,
      activo: item.activo === 'S'
    }));
  };

  // Fetch proveedores
  const fetchProveedores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      clearTokenError();

      const result = await tokenizedRequest('/mserpservice/api/diot/v1/getVendors', {
        method: 'GET'
      });

      if (result.statusCode === '200' && result.data) {
        const transformedData = transformApiData(result.data);
        setProveedores(transformedData);
        setOriginalProveedores(JSON.parse(JSON.stringify(transformedData)));
        console.log(`Proveedores cargados: ${transformedData.length}`);
      } else {
        throw new Error(result.message || 'Error al cargar proveedores');
      }
    } catch (err) {
      console.error('Error fetching proveedores:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [tokenizedRequest, clearTokenError]);

  // Handle field change
  const handleFieldChange = (clave, field, value) => {
    setProveedores(prev => 
      prev.map(p => {
        if (p.clave === clave) {
          let updatedProveedor = { ...p };
          
          // Prevent changing from valid value to empty ("Sin config.")
          if (!value || value === '') {
            // If the field already has a valid value, don't change it
            if (p[field]) {
              console.log(`Prevented clearing ${field} for provider ${clave} - keeping existing value: ${p[field]}`);
              return p; // Return unchanged
            }
          }
          
          // Update the field with the new value
          updatedProveedor[field] = value;
          
          // Special validation for tipoOperacion
          if (field === 'tipoOperacion' && value) {
            const availableOps = getAvailableOperations(p.rfc);
            const isValidOperation = availableOps.some(op => op.id === parseInt(value));
            
            if (!isValidOperation) {
              // Reset to first available operation if current selection is invalid
              updatedProveedor.tipoOperacion = availableOps[0]?.id || null;
            }
          }
          
          return updatedProveedor;
        }
        return p;
      })
    );
  };

  // Handle save
  const handleSave = async (proveedor) => {
    setSavingRows(prev => new Set(prev).add(proveedor.clave));
    
    try {
      // Prepare the payload for the API
      const payload = {
        ClienteClave: proveedor.clave,
        PTipoProveedor: proveedor.tipoProveedor || null,
        PTipoOperacion: proveedor.tipoOperacion || null,
        PActoActividadIva: proveedor.actividadIva ? proveedor.actividadIva.toString() : null
      };

      console.log('Enviando datos para actualizar:', payload);

      const result = await tokenizedRequest('/mserpservice/api/diot/v1/updateVendor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (result.statusCode === '200') {
        // Update original data to reflect saved state
        setOriginalProveedores(prev => 
          prev.map(p => 
            p.clave === proveedor.clave 
              ? { 
                  ...p, 
                  tipoOperacion: proveedor.tipoOperacion,
                  tipoProveedor: proveedor.tipoProveedor,
                  actividadIva: proveedor.actividadIva
                }
              : p
          )
        );
        
        console.log('Proveedor actualizado exitosamente:', result.message);
        
        // Show success toast
        addToast(`Proveedor "${proveedor.nombre}" actualizado correctamente`, 'success');
        
      } else {
        throw new Error(result.message || 'Error al actualizar el proveedor');
      }
      
    } catch (err) {
      console.error('Error saving proveedor:', err);
      
      // Show error toast
      addToast(`Error al actualizar "${proveedor.nombre}": ${err.message}`, 'error');
      
      // You could also set a local error state here to show in the UI
      setError(`Error al actualizar proveedor ${proveedor.clave}: ${err.message}`);
      
    } finally {
      setSavingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(proveedor.clave);
        return newSet;
      });
    }
  };

  // Filter data
  const filteredData = React.useMemo(() => {
    return proveedores.filter(proveedor => {
      const matchesSearch = 
        proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.clave.toString().includes(searchTerm);

      let matchesTipoOperacion = false;
      if (filterTipoOperacion === 'Todos') {
        matchesTipoOperacion = true;
      } else if (filterTipoOperacion === 'Vacio') {
        matchesTipoOperacion = !proveedor.tipoOperacion || proveedor.tipoOperacion === null;
      } else {
        matchesTipoOperacion = proveedor.tipoOperacion === parseInt(filterTipoOperacion);
      }

      let matchesTipoProveedor = false;
      if (filterTipoProveedor === 'Todos') {
        matchesTipoProveedor = true;
      } else if (filterTipoProveedor === 'Vacio') {
        matchesTipoProveedor = !proveedor.tipoProveedor || proveedor.tipoProveedor === null;
      } else {
        matchesTipoProveedor = proveedor.tipoProveedor === parseInt(filterTipoProveedor);
      }

      let matchesActividadIva = false;
      if (filterActividadIva === 'Todos') {
        matchesActividadIva = true;
      } else if (filterActividadIva === 'Vacio') {
        matchesActividadIva = !proveedor.actividadIva || proveedor.actividadIva === null;
      } else {
        matchesActividadIva = proveedor.actividadIva === parseInt(filterActividadIva);
      }

      return matchesSearch && matchesTipoOperacion && matchesTipoProveedor && matchesActividadIva;
    });
  }, [proveedores, searchTerm, filterTipoOperacion, filterTipoProveedor, filterActividadIva]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTipoOperacion, filterTipoProveedor, filterActividadIva]);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    clearTokenError();
    fetchProveedores();
  };

  // Load data on mount
  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  if (isLoading && proveedores.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" style={{ color: primaryColor }} />
          <p className="text-gray-600 dark:text-gray-400">Cargando catálogo de proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" style={{ color: primaryColor }} />
          <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
            Listado de Proveedores
          </h1>
        </div>
        <p className="text-sm text-[#696974] dark:text-[#92929d] ml-8">
          Gestión del catálogo de proveedores para la generación de DIOT 2025.
        </p>
      </div>

      {/* Success Banner - Show when update is successful */}
      {/* You can add this if you want to show success messages */}
      
      {/* Error Banner */}
      {(error || tokenError) && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error || tokenError}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Cerrar
              </button>
              <button
                onClick={handleRetry}
                disabled={isLoading || isProcessingTokens}
                className="text-sm bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 px-3 py-1 rounded transition-colors disabled:opacity-50"
              >
                {(isLoading || isProcessingTokens) ? 'Cargando...' : 'Reintentar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, RFC o clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1"
              style={{ '--tw-ring-color': primaryColor }}
            />
          </div>

          {/* Tipo Operación Filter */}
          <select
            value={filterTipoOperacion}
            onChange={(e) => setFilterTipoOperacion(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1"
            style={{ '--tw-ring-color': primaryColor }}
          >
            <option value="Todos">Tipo Operación - Todos</option>
            <option value="Vacio" className="text-orange-600 dark:text-orange-400">
              📋 Sin configurar
            </option>
            <optgroup label="Configurados:">
              {getAllTiposOperacion().map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.clave} - {tipo.descripcion}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Tipo Proveedor Filter */}
          <select
            value={filterTipoProveedor}
            onChange={(e) => setFilterTipoProveedor(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1"
            style={{ '--tw-ring-color': primaryColor }}
          >
            <option value="Todos">Tipo Proveedor - Todos</option>
            <option value="Vacio" className="text-orange-600 dark:text-orange-400">
              👤 Sin configurar
            </option>
            <optgroup label="Configurados:">
              {tiposProveedor.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.clave} - {tipo.descripcion}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Actividad IVA Filter */}
          <select
            value={filterActividadIva}
            onChange={(e) => setFilterActividadIva(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1"
            style={{ '--tw-ring-color': primaryColor }}
          >
            <option value="Todos">Acto/Actividad IVA - Todos</option>
            <option value="Vacio" className="text-orange-600 dark:text-orange-400">
              💼 Sin configurar
            </option>
            <optgroup label="Configurados:">
              {actividadesIva.map(actividad => (
                <option key={actividad.id} value={actividad.id}>
                  {actividad.descripcion}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length} proveedores
            </span>
            {(filterTipoOperacion !== 'Todos' || filterTipoProveedor !== 'Todos' || filterActividadIva !== 'Todos') && (
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-500">Filtros activos:</span>
                {filterTipoOperacion === 'Vacio' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    📋 Sin tipo operación
                  </span>
                )}
                {filterTipoProveedor === 'Vacio' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    👤 Sin tipo proveedor
                  </span>
                )}
                {filterActividadIva === 'Vacio' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    💼 Sin actividad IVA
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs">Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                className="px-2 py-1 text-xs border border-gray-300 dark:border-[#2C2C38] rounded bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1"
                style={{ '--tw-ring-color': primaryColor }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <button
              onClick={fetchProveedores}
              disabled={isLoading}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#2C2C38]">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Clave
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  RFC
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Domicilio
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CP
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Col.
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Localidad
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo Op.
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo Prov.
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Act. IVA
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Activo
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1C1C24] divide-y divide-gray-200 dark:divide-[#2C2C38]">
              {paginatedData.map((proveedor) => {
                const rowHasChanges = hasRowChanges(proveedor.clave);
                const rowIsValid = isRowValid(proveedor);
                const canSave = canSaveRow(proveedor.clave);
                const isSaving = savingRows.has(proveedor.clave);
                const availableOperations = getAvailableOperations(proveedor.rfc);
                const providerType = getProviderType(proveedor.rfc);
                const isValidSelection = availableOperations.some(op => op.id === proveedor.tipoOperacion);

                return (
                  <tr key={proveedor.clave} className={rowHasChanges ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                    <td className="px-2 py-2 text-xs text-gray-900 dark:text-white font-medium">
                      {proveedor.clave}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 dark:text-white max-w-[120px] truncate" title={proveedor.nombre}>
                      {proveedor.nombre}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 dark:text-white font-mono">
                      {proveedor.rfc}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 dark:text-white max-w-[100px] truncate" title={proveedor.domicilio}>
                      {proveedor.domicilio}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 dark:text-white">
                      {proveedor.cp}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 dark:text-white max-w-[80px] truncate" title={proveedor.colonia}>
                      {proveedor.colonia}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 dark:text-white max-w-[80px] truncate" title={proveedor.estado}>
                      {proveedor.estado}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 dark:text-white max-w-[80px] truncate" title={proveedor.localidad}>
                      {proveedor.localidad}
                    </td>
                    <td className="px-2 py-2">
                      <div className="w-[140px]">
                        <select
                          value={proveedor.tipoOperacion || ''}
                          onChange={(e) => handleFieldChange(proveedor.clave, 'tipoOperacion', parseInt(e.target.value))}
                          className={`w-full text-xs px-1 py-1 border rounded bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1 ${
                            !proveedor.tipoOperacion
                              ? 'border-red-300 dark:border-red-600' 
                              : !isValidSelection && proveedor.tipoOperacion
                              ? 'border-red-300 dark:border-red-600'
                              : 'border-gray-300 dark:border-[#2C2C38]'
                          }`}
                          style={{ '--tw-ring-color': primaryColor }}
                        >
                          <option value="">Sin config.</option>
                          {availableOperations.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.clave}-{tipo.descripcion.substring(0, 15)}...
                            </option>
                          ))}
                        </select>
                        {!proveedor.tipoOperacion && rowHasChanges && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            Requerido
                          </div>
                        )}
                        {!isValidSelection && proveedor.tipoOperacion && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            No válida
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={proveedor.tipoProveedor || ''}
                        onChange={(e) => handleFieldChange(proveedor.clave, 'tipoProveedor', parseInt(e.target.value))}
                        className={`w-[100px] text-xs px-1 py-1 border rounded bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1 ${
                          !proveedor.tipoProveedor
                            ? 'border-red-300 dark:border-red-600' 
                            : 'border-gray-300 dark:border-[#2C2C38]'
                        }`}
                        style={{ '--tw-ring-color': primaryColor }}
                      >
                        <option value="">Sin config.</option>
                        {tiposProveedor.map(tipo => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.clave}-{tipo.descripcion.substring(0, 8)}
                          </option>
                        ))}
                      </select>
                      {!proveedor.tipoProveedor && rowHasChanges && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          Requerido
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={proveedor.actividadIva || ''}
                        onChange={(e) => handleFieldChange(proveedor.clave, 'actividadIva', parseInt(e.target.value))}
                        className={`w-[110px] text-xs px-1 py-1 border rounded bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1 ${
                          !proveedor.actividadIva
                            ? 'border-red-300 dark:border-red-600' 
                            : 'border-gray-300 dark:border-[#2C2C38]'
                        }`}
                        style={{ '--tw-ring-color': primaryColor }}
                      >
                        <option value="">Sin config.</option>
                        {actividadesIva.map(actividad => (
                          <option key={actividad.id} value={actividad.id}>
                            {actividad.descripcion.substring(0, 12)}...
                          </option>
                        ))}
                      </select>
                      {!proveedor.actividadIva && rowHasChanges && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          Requerido
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${
                        proveedor.activo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {proveedor.activo ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      {canSave ? (
                        <button
                          onClick={() => handleSave(proveedor)}
                          disabled={isSaving}
                          className="flex items-center space-x-1 px-2 py-1 text-xs text-white rounded hover:opacity-90 transition-colors disabled:opacity-50"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {isSaving ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                          <span className="hidden sm:inline">{isSaving ? 'Guard...' : 'Guardar'}</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 rounded cursor-not-allowed"
                          title={
                            !rowHasChanges 
                              ? "No hay cambios para guardar" 
                              : !rowIsValid 
                              ? "Complete todos los campos requeridos" 
                              : "Botón deshabilitado"
                          }
                        >
                          <Save className="h-3 w-3" />
                          <span className="hidden sm:inline">Guardar</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginatedData.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No se encontraron proveedores con los filtros aplicados
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Página {currentPage} de {totalPages}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({filteredData.length} total)
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Previous button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  // First page + ellipsis
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => goToPage(1)}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-[#2C2C38] rounded bg-white dark:bg-[#1C1C24] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis-start" className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                  }

                  // Visible page range
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`px-3 py-1 text-sm border rounded transition-colors ${
                          i === currentPage
                            ? 'text-white border-transparent'
                            : 'border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        style={i === currentPage ? { backgroundColor: primaryColor } : {}}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Ellipsis + last page
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis-end" className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => goToPage(totalPages)}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-[#2C2C38] rounded bg-white dark:bg-[#1C1C24] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}
              </div>

              {/* Next button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default DiotCatalogoProveedores;