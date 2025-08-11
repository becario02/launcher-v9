'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Save, RefreshCw, Users, AlertCircle } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTokenManager } from '@/hooks/useTokenManager';

const DiotCatalogoProveedores = () => {
  const { primaryColor } = usePrimaryColor();
  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();

  // States
  const [proveedores, setProveedores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipoOperacion, setFilterTipoOperacion] = useState('Todos');
  const [filterTipoProveedor, setFilterTipoProveedor] = useState('Todos');
  const [filterActividadIva, setFilterActividadIva] = useState('Todos');
  const [editingRows, setEditingRows] = useState(new Set());
  const [savingRows, setSavingRows] = useState(new Set());

  // Hardcoded data for selects (as requested)
  const tiposOperacion = [
    { id: 1, clave: '03', descripcion: 'Prestador de servicios profesional' },
    { id: 2, clave: '06', descripcion: 'Arrendamiento' },
    { id: 3, clave: '85', descripcion: 'Otros' },
    { id: 4, clave: '08', descripcion: 'Importación por transferencia virtual' },
    { id: 5, clave: '02', descripcion: 'Enajenación de bienes' },
    { id: 6, clave: '07', descripcion: 'Importación de bienes o servicios' },
    { id: 7, clave: '87', descripcion: 'Operaciones globales' }
  ];

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

  // Load data on mount
  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  // Filter data
  const filteredData = React.useMemo(() => {
    return proveedores.filter(proveedor => {
      const matchesSearch = 
        proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.clave.toString().includes(searchTerm);

      const matchesTipoOperacion = filterTipoOperacion === 'Todos' || 
        proveedor.tipoOperacion === parseInt(filterTipoOperacion);

      const matchesTipoProveedor = filterTipoProveedor === 'Todos' ||
        proveedor.tipoProveedor === parseInt(filterTipoProveedor);

      const matchesActividadIva = filterActividadIva === 'Todos' ||
        proveedor.actividadIva === parseInt(filterActividadIva);

      return matchesSearch && matchesTipoOperacion && matchesTipoProveedor && matchesActividadIva;
    });
  }, [proveedores, searchTerm, filterTipoOperacion, filterTipoProveedor, filterActividadIva]);

  // Get description by ID
  const getTipoOperacionDesc = (id) => {
    const tipo = tiposOperacion.find(t => t.id === id);
    return tipo ? `${tipo.clave} - ${tipo.descripcion}` : '';
  };

  const getTipoProveedorDesc = (id) => {
    const tipo = tiposProveedor.find(t => t.id === id);
    return tipo ? `${tipo.clave} - ${tipo.descripcion}` : '';
  };

  const getActividadIvaDesc = (id) => {
    const actividad = actividadesIva.find(a => a.id === id);
    return actividad ? actividad.descripcion : '';
  };

  // Handle field change
  const handleFieldChange = (clave, field, value) => {
    setProveedores(prev => 
      prev.map(p => 
        p.clave === clave ? { ...p, [field]: value } : p
      )
    );
    setEditingRows(prev => new Set(prev).add(clave));
  };

  // Handle save
  const handleSave = async (proveedor) => {
    setSavingRows(prev => new Set(prev).add(proveedor.clave));
    
    try {
      // Simulate API call - replace with actual save logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(proveedor.clave);
        return newSet;
      });
      
      console.log('Proveedor guardado:', proveedor);
    } catch (err) {
      console.error('Error saving proveedor:', err);
    } finally {
      setSavingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(proveedor.clave);
        return newSet;
      });
    }
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    clearTokenError();
    fetchProveedores();
  };

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

      {/* Error Banner */}
      {(error || tokenError) && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Error al cargar datos: {error || tokenError}</span>
            </div>
            <button
              onClick={handleRetry}
              disabled={isLoading || isProcessingTokens}
              className="text-sm bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 px-3 py-1 rounded transition-colors disabled:opacity-50"
            >
              {(isLoading || isProcessingTokens) ? 'Cargando...' : 'Reintentar'}
            </button>
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
            {tiposOperacion.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.clave} - {tipo.descripcion}
              </option>
            ))}
          </select>

          {/* Tipo Proveedor Filter */}
          <select
            value={filterTipoProveedor}
            onChange={(e) => setFilterTipoProveedor(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1"
            style={{ '--tw-ring-color': primaryColor }}
          >
            <option value="Todos">Tipo Proveedor - Todos</option>
            {tiposProveedor.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.clave} - {tipo.descripcion}
              </option>
            ))}
          </select>

          {/* Actividad IVA Filter */}
          <select
            value={filterActividadIva}
            onChange={(e) => setFilterActividadIva(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1"
            style={{ '--tw-ring-color': primaryColor }}
          >
            <option value="Todos">Acto/Actividad IVA - Todos</option>
            {actividadesIva.map(actividad => (
              <option key={actividad.id} value={actividad.id}>
                {actividad.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Mostrando {filteredData.length} de {proveedores.length} proveedores
          </span>
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

      {/* Table */}
      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#2C2C38]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Clave
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  RFC
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Domicilio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Colonia
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Localidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo Operación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo Proveedor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acto/Actividad IVA
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Activo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1C1C24] divide-y divide-gray-200 dark:divide-[#2C2C38]">
              {filteredData.map((proveedor) => {
                const isEditing = editingRows.has(proveedor.clave);
                const isSaving = savingRows.has(proveedor.clave);

                return (
                  <tr key={proveedor.clave} className={isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {proveedor.clave}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {proveedor.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {proveedor.rfc}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {proveedor.domicilio}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {proveedor.cp}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {proveedor.colonia}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {proveedor.estado}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {proveedor.localidad}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={proveedor.tipoOperacion || ''}
                        onChange={(e) => handleFieldChange(proveedor.clave, 'tipoOperacion', parseInt(e.target.value))}
                        className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-[#2C2C38] rounded bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1"
                        style={{ '--tw-ring-color': primaryColor }}
                      >
                        <option value="">Seleccionar...</option>
                        {tiposOperacion.map(tipo => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.clave} - {tipo.descripcion}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={proveedor.tipoProveedor || ''}
                        onChange={(e) => handleFieldChange(proveedor.clave, 'tipoProveedor', parseInt(e.target.value))}
                        className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-[#2C2C38] rounded bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1"
                        style={{ '--tw-ring-color': primaryColor }}
                      >
                        <option value="">Seleccionar...</option>
                        {tiposProveedor.map(tipo => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.clave} - {tipo.descripcion}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={proveedor.actividadIva || ''}
                        onChange={(e) => handleFieldChange(proveedor.clave, 'actividadIva', parseInt(e.target.value))}
                        className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-[#2C2C38] rounded bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1"
                        style={{ '--tw-ring-color': primaryColor }}
                      >
                        <option value="">Seleccionar...</option>
                        {actividadesIva.map(actividad => (
                          <option key={actividad.id} value={actividad.id}>
                            {actividad.descripcion}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        proveedor.activo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {proveedor.activo ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing && (
                        <button
                          onClick={() => handleSave(proveedor)}
                          disabled={isSaving}
                          className="flex items-center space-x-1 px-3 py-1 text-xs text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {isSaving ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                          <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No se encontraron proveedores con los filtros aplicados
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiotCatalogoProveedores;