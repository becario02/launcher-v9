// app/tableros/costos-mantenimiento/page.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calculator, TrendingUp, BarChart3, PieChart, Settings } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import MaintenanceCostTypeIndicator from '@/components/tableros/costos-mantenimiento/MaintenanceCostTypeIndicator';
import DateFilter from '@/components/tableros/costos-mantenimiento/DateFilter';
import SettingsModal from '@/components/tableros/flotillas/SettingsModal';
import { useDashboardReload } from '@/hooks/useDashboardReload';
import { useTokenManager } from '@/hooks/useTokenManager';
import Cookies from 'js-cookie';

const CostosMantenimientoPage = () => {
  const { primaryColor } = usePrimaryColor();
  
  // Date filter states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  
  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(30);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [intervalChangeTime, setIntervalChangeTime] = useState(null);

  // Ref for auto-refresh interval
  const intervalRef = useRef(null);

  // Dashboard reload hook
  const { getReloadTime, currentDashboardId } = useDashboardReload();
  
  // Token manager hook
  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();

  // Get profile name from cookies to check user type
  const profileName = Cookies.get('profileName');
  const canAccessSettings = profileName !== 'USERCUSTOMER';

  // Fetch all maintenance cost data
  const fetchAllData = async () => {
    try {
      setIsLoadingData(true);
      setDataError(null);
      clearTokenError();

      const result = await tokenizedRequest('/mserpservice/api/tableros/costos-tipo-mantto', {
        method: 'GET'
      });
      
      if (result.statusCode === '200' && result.data) {
        // Parse dates and store all data
        const dataWithDates = result.data.map(item => ({
          ...item,
          fechaParsed: new Date(item.fecha)
        }));
        
        setAllData(dataWithDates);
        setLastUpdate(new Date());
        
        // Clear intervalChangeTime when new data is fetched
        setIntervalChangeTime(null);
        
        console.log('All maintenance cost data loaded successfully');
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
      
    } catch (err) {
      console.error('Error fetching all maintenance cost data:', err);
      const errorMessage = tokenError || err.message;
      setDataError(errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Filter data based on date range
  const applyDateFilter = () => {
    if (!allData.length) {
      setFilteredData([]);
      return;
    }

    let filtered = allData;

    if (startDate || endDate) {
      filtered = allData.filter(item => {
        const itemDate = item.fechaParsed;
        
        if (startDate && endDate) {
          return itemDate >= startDate && itemDate <= endDate;
        } else if (startDate) {
          return itemDate >= startDate;
        } else if (endDate) {
          return itemDate <= endDate;
        }
        
        return true;
      });
    }

    setFilteredData(filtered);
  };

  // Setup auto-refresh interval
  const setupAutoRefresh = React.useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      console.log(`Auto-refreshing maintenance cost data every ${updateInterval} minutes...`);
      fetchAllData();
    }, updateInterval * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateInterval]);

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
        
        // Then fetch data once
        await fetchAllData();
      } catch (err) {
        console.error('Error during initialization:', err);
      }
    };
    
    // Only initialize once when dashboard ID is available and we haven't loaded data yet
    if (currentDashboardId && !allData.length) {
      initializeData();
    }
  }, [currentDashboardId]);

  // Setup auto-refresh when updateInterval changes (but not on initial load)
  useEffect(() => {
    // Don't setup auto-refresh if we don't have data yet or if it's the initial default value
    if (!allData.length || updateInterval === 30) return;
    
    const cleanup = setupAutoRefresh();
    return cleanup;
  }, [setupAutoRefresh, allData.length]);

  // Apply filters when data or date range changes
  useEffect(() => {
    applyDateFilter();
  }, [allData, startDate, endDate]);

  // Handle settings modal
  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  const handleIntervalChange = (changeTime) => {
    setIntervalChangeTime(changeTime);
  };

  // Handle data retry
  const handleRetry = () => {
    setDataError(null);
    clearTokenError();
    fetchAllData();
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-6 h-6" style={{ color: primaryColor }} />
              <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                Costos de Mantenimiento
              </h1>
            </div>
            {canAccessSettings && (
              <button
                onClick={handleSettingsClick}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Configuración de actualización"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}
          </div>
          <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
            Visualización consolidada y detallada de los costos asociados a las actividades de mantenimiento.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {(dataError || tokenError) && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span>Error al cargar datos: {dataError || tokenError}</span>
              {lastUpdate && (
                <span className="text-xs mt-1 opacity-75">
                  Última actualización: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
            <button
              onClick={handleRetry}
              disabled={isLoadingData || isProcessingTokens}
              className="text-sm bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isLoadingData || isProcessingTokens) ? 'Cargando...' : 'Reintentar'}
            </button>
          </div>
        </div>
      )}

      {/* Token Processing Banner */}
      {isProcessingTokens && (
        <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Procesando tokens de acceso...</span>
          </div>
        </div>
      )}

      {/* Date Filter */}
      <DateFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Indicator 1: Cost by Type */}
        <div className="xl:col-span-1">
          <MaintenanceCostTypeIndicator 
            filteredData={filteredData}
          />
        </div>

        {/* Placeholder for Indicator 2: Internal vs External Costs */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-6 h-full">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Costos Internos vs Externos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Próximamente disponible
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for Indicator 3: Monthly Cost Trend */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-6 h-full">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Costo Mensual por Tipo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Próximamente disponible
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for Indicator 4: Cost Breakdown by Components */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-6 h-full">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Desglose por Componentes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Próximamente disponible
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={handleSettingsClose}
        updateInterval={updateInterval}
        setUpdateInterval={setUpdateInterval}
        lastUpdate={lastUpdate}
        intervalChangeTime={intervalChangeTime}
        onIntervalChange={handleIntervalChange}
      />
    </>
  );
};

export default CostosMantenimientoPage;