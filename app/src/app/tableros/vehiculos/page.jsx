'use client';

import React, { useState, useEffect, useRef } from 'react';
import VehicleHeader from '@/components/tableros/vehiculos/VehicleHeader';
import VehicleFilters from '@/components/tableros/vehiculos/VehicleFilters';
import VehicleTable from '@/components/tableros/vehiculos/VehicleTable';
import SettingsModal from '@/components/tableros/flotillas/SettingsModal';
import { useTokenManager } from '@/hooks/useTokenManager';
import { useDashboardReload } from '@/hooks/useDashboardReload';

const VehicleDashboardPage = () => {
  // Main states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    lineaNegocio: '',
    circuito: '',
    cliente: '',
    terminalOrigen: '',
    terminalDestino: '',
    status: ''
  });
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [updateInterval, setUpdateInterval] = useState(60); // Keep in seconds for this dashboard
  const [showSettings, setShowSettings] = useState(false);
  
  // API states
  const [vehiclesData, setVehiclesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [intervalChangeTime, setIntervalChangeTime] = useState(null);
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    lineasNegocio: [],
    circuitos: [],
    clientes: [],
    terminalesOrigen: [],
    terminalesDestino: [],
    statuses: []
  });
  
  // Interval ref
  const intervalRef = useRef(null);

  // Token manager hook
  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();
  
  // Dashboard reload hook
  const { getReloadTime, currentDashboardId } = useDashboardReload();

  // Transform API data to match component structure
  const transformApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map(vehicle => ({
      tractoNumEco: vehicle.tractoNumEco?.trim() || '',
      ignicion: vehicle.ignicion || 0,
      semaforoAntena: vehicle.semaforoAntena || 0,
      remNe1: vehicle.remNe1?.trim() || null,
      remNe2: vehicle.remNe2?.trim() || null,
      posicion: vehicle.posicion || '',
      fechaPosicion: vehicle.fechaPosicion ? new Date(vehicle.fechaPosicion) : null,
      statusDescrip: vehicle.statusDescrip || '',
      diasStatus: vehicle.diasStatus?.trim() || '',
      terminalDespacho: vehicle.terminalDespacho?.trim() || '',
      terminalDestino: vehicle.terminalDestino?.trim() || '',
      operadorNombre: vehicle.operadorNombre?.trim() || null,
      clienteNombre: vehicle.clienteNombre?.trim() || null,
      negocioClave: vehicle.negocioClave?.trim() || null,
      circuitoClave: vehicle.circuitoClave?.trim() || null,
      servicio: vehicle.servicio?.trim() || null,
      bitacora: vehicle.bitacora?.trim() || null
    }));
  };

  // Extract filter options from data
  const extractFilterOptions = (data) => {
    const options = {
      lineasNegocio: [...new Set(data.map(v => v.negocioClave).filter(Boolean))],
      circuitos: [...new Set(data.map(v => v.circuitoClave).filter(Boolean))],
      clientes: [...new Set(data.map(v => v.clienteNombre).filter(Boolean))],
      terminalesOrigen: [...new Set(data.map(v => v.terminalDespacho).filter(Boolean))],
      terminalesDestino: [...new Set(data.map(v => v.terminalDestino).filter(Boolean))],
      statuses: [...new Set(data.map(v => v.statusDescrip).filter(Boolean))]
    };
    
    // Sort all options
    Object.keys(options).forEach(key => {
      options[key].sort();
    });
    
    setFilterOptions(options);
  };

  // Fetch vehicles data from API
  const fetchVehiclesData = async (preservePage = false) => {
    try {
      setIsLoading(true);
      setError(null);
      clearTokenError();

      const result = await tokenizedRequest('/mserpservice/api/tableros/vehiculos', {
        method: 'GET'
      });
      
      // Log the complete API response for debugging
      console.log('=== API Response ===');
      console.log('Status Code:', result.statusCode);
      console.log('Message:', result.message);
      console.log('Data Length:', result.data ? result.data.length : 'No data');
      console.log('Preserve Page:', preservePage);
      console.log('==================');
      
      if (result.statusCode === '200' && result.data) {
        const transformedData = transformApiData(result.data);
        setVehiclesData(transformedData);
        setLastUpdate(new Date());
        extractFilterOptions(transformedData);
        
        // Clear intervalChangeTime when new data is fetched
        setIntervalChangeTime(null);
        
        console.log(`✅ Vehicles data updated: ${transformedData.length} vehicles loaded`);
        console.log('📊 Transformed Data Sample:', transformedData.slice(0, 2)); // Show first 2 records
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching vehicles data:', err);
      const errorMessage = tokenError || err.message;
      setError(errorMessage);
      
      // Fallback to static data in case of error
      if (vehiclesData.length === 0) {
        const fallbackData = [
          {
            tractoNumEco: 'DEMO001',
            ignicion: 1,
            semaforoAntena: 1,
            remNe1: 'R001',
            remNe2: null,
            posicion: 'DEMO - Error de conexión',
            fechaPosicion: new Date(),
            statusDescrip: 'DISPONIBLE',
            diasStatus: '0000d 00h 00min',
            terminalDespacho: 'MEX',
            terminalDestino: 'MTY',
            operadorNombre: 'DEMO OPERATOR',
            clienteNombre: 'DEMO CLIENT',
            negocioClave: 'FULL',
            circuitoClave: 'FORANEO',
            servicio: 'DEMO',
            bitacora: null
          }
        ];
        setVehiclesData(fallbackData);
        extractFilterOptions(fallbackData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Setup auto-refresh interval
  const setupAutoRefresh = React.useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      console.log(`Auto-refreshing vehicles data every ${updateInterval} seconds...`);
      fetchVehiclesData(true); // Pass true to preserve current page
    }, updateInterval * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateInterval]);

  // Filter data based on search and filters
  const filteredData = React.useMemo(() => {
    return vehiclesData.filter(vehicle => {
      const matchesSearch = vehicle.tractoNumEco.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (vehicle.operadorNombre && vehicle.operadorNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (vehicle.clienteNombre && vehicle.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilters = (
        (!filters.lineaNegocio || vehicle.negocioClave === filters.lineaNegocio) &&
        (!filters.circuito || vehicle.circuitoClave === filters.circuito) &&
        (!filters.cliente || vehicle.clienteNombre === filters.cliente) &&
        (!filters.terminalOrigen || vehicle.terminalDespacho === filters.terminalOrigen) &&
        (!filters.terminalDestino || vehicle.terminalDestino === filters.terminalDestino) &&
        (!filters.status || vehicle.statusDescrip === filters.status)
      );
      
      return matchesSearch && matchesFilters;
    });
  }, [vehiclesData, searchTerm, filters]);

  // Reset page when filters change (but not when data auto-refreshes)
  const [previousFilterString, setPreviousFilterString] = useState('');
  React.useEffect(() => {
    const currentFilterString = JSON.stringify({ searchTerm, filters });
    if (previousFilterString !== '' && previousFilterString !== currentFilterString) {
      // Filters changed, reset to page 1
      console.log('Filters changed, resetting to page 1');
      // We'll pass this to the VehicleTable component
    }
    setPreviousFilterString(currentFilterString);
  }, [searchTerm, filters, previousFilterString]);

  // Handle settings modal
  const handleSettingsClick = React.useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleSettingsClose = React.useCallback(() => {
    setShowSettings(false);
  }, []);

  // Handle interval change from settings modal
  const handleIntervalChange = React.useCallback((changeTime) => {
    setIntervalChangeTime(changeTime);
  }, []);

  // Handle error retry
  const handleRetry = React.useCallback(() => {
    setError(null);
    clearTokenError();
    fetchVehiclesData(false); // Manual retry, can reset page
  }, [clearTokenError]);

  // Load initial data and configuration
  useEffect(() => {
    const initializeData = async () => {
      try {
        // First load reload time config if dashboard is available
        if (currentDashboardId) {
          const reloadTimeMinutes = await getReloadTime();
          // Convert minutes to seconds for this dashboard
          const reloadTimeSeconds = reloadTimeMinutes * 60;
          setUpdateInterval(reloadTimeSeconds);
          console.log(`Reload time configuration loaded: ${reloadTimeMinutes} minutes (${reloadTimeSeconds} seconds)`);
        }
        
        // Then fetch vehicles data once
        await fetchVehiclesData(false); // Initial load, can reset page
      } catch (err) {
        console.error('Error during initialization:', err);
      }
    };
    
    // Only initialize once when dashboard ID is available and we haven't loaded data yet
    if (currentDashboardId && vehiclesData.length === 0) {
      initializeData();
    }
  }, [currentDashboardId]);

  // Setup auto-refresh when updateInterval changes (but not on initial load)
  useEffect(() => {
    // Don't setup auto-refresh if we don't have data yet
    if (vehiclesData.length === 0) return;
    
    console.log(`Setting up auto-refresh every ${updateInterval} seconds...`);
    const cleanup = setupAutoRefresh();
    return cleanup;
  }, [setupAutoRefresh, vehiclesData.length, updateInterval]); // Add updateInterval to dependencies

  // Show loading state
  if ((isLoading || isProcessingTokens) && vehiclesData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isProcessingTokens ? 'Procesando tokens...' : 'Cargando datos de vehículos...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <VehicleHeader />

      {/* Error Banner */}
      {(error || tokenError) && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span>Error al cargar datos: {error || tokenError}</span>
              {(error || tokenError)?.includes('localStorage') && (
                <span className="text-xs mt-1 opacity-75">
                  Verifique que haya una empresa seleccionada
                </span>
              )}
              {(error || tokenError)?.includes('autenticación') && (
                <span className="text-xs mt-1 opacity-75">
                  Verifique las credenciales en variables de entorno
                </span>
              )}
              {lastUpdate && (
                <span className="text-xs mt-1 opacity-75">
                  Última actualización: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
            <button
              onClick={handleRetry}
              disabled={isLoading || isProcessingTokens}
              className="text-sm bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isLoading || isProcessingTokens) ? 'Cargando...' : 'Reintentar'}
            </button>
          </div>
        </div>
      )}

      {/* Token Processing Banner */}
      {isProcessingTokens && (
        <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Procesando tokens de acceso...</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <VehicleFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        onSettingsClick={handleSettingsClick}
        isLoading={isLoading || isProcessingTokens}
        totalVehicles={filteredData.length}
      />

      {/* Content Area */}
      <div className="flex-1">
        <VehicleTable
          vehiclesData={filteredData}
          itemsPerPage={itemsPerPage}
          isLoading={isLoading || isProcessingTokens}
          resetPageTrigger={JSON.stringify({ searchTerm, filters })} // Trigger page reset on filter changes
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={handleSettingsClose}
        updateInterval={Math.round(updateInterval / 60)} // Convert seconds to minutes for modal
        setUpdateInterval={(minutes) => {
          const seconds = minutes * 60;
          console.log(`Setting new update interval: ${minutes} minutes (${seconds} seconds)`);
          setUpdateInterval(seconds);
        }} // Convert minutes to seconds
        lastUpdate={lastUpdate}
        intervalChangeTime={intervalChangeTime}
        onIntervalChange={handleIntervalChange}
      />
    </>
  );
};

export default VehicleDashboardPage;