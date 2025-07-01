'use client';

import React, { useState, useEffect, useRef } from 'react';
import FleetHeader from '@/components/tableros/flotillas/FleetHeader';
import FleetSidebar from '@/components/tableros/flotillas/FleetSidebar';
import FleetMap from '@/components/tableros/flotillas/FleetMap';
import SettingsModal from '@/components/tableros/flotillas/SettingsModal';
import { useTokenManager } from '@/hooks/useTokenManager';
import { useDashboardReload } from '@/hooks/useDashboardReload';

const FleetLocationPage = () => {
  // Main states
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updateInterval, setUpdateInterval] = useState(30);
  const [showSettings, setShowSettings] = useState(false);
  
  // API states
  const [fleetData, setFleetData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Ref for map methods access and interval
  const mapMethodsRef = useRef(null);
  const intervalRef = useRef(null);

  // Token manager hook
  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();
  
  // Dashboard reload hook
  const { getReloadTime, currentDashboardId } = useDashboardReload();

  // Transform API data to match component structure
  const transformApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map(unit => ({
      NumEco: unit.numEco?.trim() || '',
      StatusMantto: unit.statusMantto || '',
      Kilometrosporvencerovencido: unit.kilometrosPorVencerOVencido?.toString() || '0',
      FechaEstimadaLlegada: unit.fechaEstimadaLlegada,
      TerminalDestino: unit.terminalDestino || '',
      latitud: parseFloat(unit.latitud) || 0,
      Longitud: parseFloat(unit.longitud) || 0,
      Posicion: unit.posicion || ''
    }));
  };

  // Fetch fleet data from API
  const fetchFleetData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      clearTokenError();

      const result = await tokenizedRequest('/mserpservice/api/tableros/flotilla', {
        method: 'GET'
      });
      
      if (result.statusCode === '200' && result.data) {
        const transformedData = transformApiData(result.data);
        setFleetData(transformedData);
        setLastUpdate(new Date());
        console.log(`Fleet data updated: ${transformedData.length} units loaded`);
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching fleet data:', err);
      const errorMessage = tokenError || err.message;
      setError(errorMessage);
      
      // Fallback to static data in case of error
      if (fleetData.length === 0) {
        const fallbackData = [
          {
            NumEco: 'DEMO001',
            StatusMantto: 'Vencido',
            Kilometrosporvencerovencido: '1000',
            FechaEstimadaLlegada: null,
            TerminalDestino: 'MEX',
            latitud: 19.4326,
            Longitud: -99.1332,
            Posicion: 'DEMO - Error de conexión'
          }
        ];
        setFleetData(fallbackData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the separate loadReloadTimeConfig function since it's now inline

  // Setup auto-refresh interval
  const setupAutoRefresh = React.useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      console.log(`Auto-refreshing fleet data every ${updateInterval} minutes...`);
      fetchFleetData();
    }, updateInterval * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateInterval]);

  // Filter data based on search and status filter
  const filteredData = React.useMemo(() => {
    return fleetData.filter(unit => {
      const matchesSearch = unit.NumEco.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || unit.StatusMantto === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [fleetData, searchTerm, statusFilter]);

  // Handle unit selection from sidebar
  const handleUnitSelect = React.useCallback((unit) => {
    setSelectedUnit(unit);
    if (mapMethodsRef.current && mapMethodsRef.current.centerOnUnit) {
      mapMethodsRef.current.centerOnUnit(unit);
    }
  }, []);

  // Handle unit selection from map
  const handleMapUnitSelect = React.useCallback((unit) => {
    setSelectedUnit(unit);
  }, []);

  // Handle map ready
  const handleMapReady = React.useCallback((mapMethods) => {
    mapMethodsRef.current = mapMethods;
  }, []);

  // Handle settings modal
  const handleSettingsClick = React.useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleSettingsClose = React.useCallback(() => {
    setShowSettings(false);
  }, []);

  // Handle error retry
  const handleRetry = React.useCallback(() => {
    setError(null);
    clearTokenError();
    fetchFleetData();
  }, [clearTokenError]);

  // Load initial data and configuration
  useEffect(() => {
    const initializeData = async () => {
      try {
        // First load reload time config if dashboard is available
        if (currentDashboardId) {
          const reloadTime = await getReloadTime();
          setUpdateInterval(reloadTime);
          console.log(`Reload time configuration loaded: ${reloadTime} minutes`);
        }
        
        // Then fetch fleet data once
        await fetchFleetData();
      } catch (err) {
        console.error('Error during initialization:', err);
      }
    };
    
    // Only initialize once when dashboard ID is available and we haven't loaded data yet
    if (currentDashboardId && fleetData.length === 0) {
      initializeData();
    }
  }, [currentDashboardId]); // Remove getReloadTime dependency to avoid re-runs

  // Setup auto-refresh when updateInterval changes (but not on initial load)
  useEffect(() => {
    // Don't setup auto-refresh if we don't have data yet or if it's the initial default value
    if (fleetData.length === 0 || updateInterval === 30) return;
    
    const cleanup = setupAutoRefresh();
    return cleanup;
  }, [setupAutoRefresh, fleetData.length]);

  // Show loading state
  if ((isLoading || isProcessingTokens) && fleetData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isProcessingTokens ? 'Procesando tokens...' : 'Cargando datos de flotilla...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <FleetHeader />

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

      {/* Content Area */}
      <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <FleetSidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          filteredData={filteredData}
          selectedUnit={selectedUnit}
          onUnitSelect={handleUnitSelect}
          onSettingsClick={handleSettingsClick}
          isLoading={isLoading || isProcessingTokens}
        />

        {/* Map */}
        <FleetMap
          fleetData={fleetData}
          filteredData={filteredData}
          onUnitSelect={handleMapUnitSelect}
          onMapReady={handleMapReady}
          isLoading={isLoading || isProcessingTokens}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={handleSettingsClose}
        updateInterval={updateInterval}
        setUpdateInterval={setUpdateInterval}
        lastUpdate={lastUpdate}
      />
    </>
  );
};

export default FleetLocationPage;