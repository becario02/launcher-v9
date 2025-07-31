// app/tableros/costos-mantenimiento/page.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calculator, TrendingUp, BarChart3, PieChart, Settings } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import MaintenanceCostTypeIndicator from '@/components/tableros/costos-mantenimiento/MaintenanceCostTypeIndicator';
import WorkshopTypeCostIndicator from '@/components/tableros/costos-mantenimiento/WorkshopTypeCostIndicator';
import MonthlyCostTrendIndicator from '@/components/tableros/costos-mantenimiento/MonthlyCostTrendIndicator';
import CostCategoryBreakdownIndicator from '@/components/tableros/costos-mantenimiento/CostCategoryBreakdownIndicator';
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
  const [allMaintenanceData, setAllMaintenanceData] = useState([]);
  const [allWorkshopData, setAllWorkshopData] = useState([]);
  const [allCategoryData, setAllCategoryData] = useState([]);
  const [filteredMaintenanceData, setFilteredMaintenanceData] = useState([]);
  const [filteredWorkshopData, setFilteredWorkshopData] = useState([]);
  const [filteredCategoryData, setFilteredCategoryData] = useState([]);
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

      // Fetch all endpoints in parallel
      const [maintenanceResult, workshopResult, categoryResult] = await Promise.all([
        tokenizedRequest('/mserpservice/api/tableros/costos-tipo-mantto', { method: 'GET' }),
        tokenizedRequest('/mserpservice/api/tableros/costos-tipo-taller', { method: 'GET' }),
        tokenizedRequest('/mserpservice/api/tableros/costos-mobra-insumos-otros', { method: 'GET' })
      ]);
      
      // Process maintenance data
      if (maintenanceResult.statusCode === '200' && maintenanceResult.data) {
        const maintenanceDataWithDates = maintenanceResult.data.map(item => ({
          ...item,
          fechaParsed: new Date(item.fecha)
        }));
        setAllMaintenanceData(maintenanceDataWithDates);
      } else {
        console.warn('Failed to load maintenance data:', maintenanceResult.message);
      }

      // Process workshop data
      if (workshopResult.statusCode === '200' && workshopResult.data) {
        const workshopDataWithDates = workshopResult.data.map(item => ({
          ...item,
          fechaParsed: new Date(item.fecha)
        }));
        setAllWorkshopData(workshopDataWithDates);
      } else {
        console.warn('Failed to load workshop data:', workshopResult.message);
      }

      // Process category data
      if (categoryResult.statusCode === '200' && categoryResult.data) {
        const categoryDataWithDates = categoryResult.data.map(item => ({
          ...item,
          fechaParsed: new Date(item.fecha)
        }));
        setAllCategoryData(categoryDataWithDates);
      } else {
        console.warn('Failed to load category data:', categoryResult.message);
      }
      
      setLastUpdate(new Date());
      
      // Clear intervalChangeTime when new data is fetched
      setIntervalChangeTime(null);
      
      console.log('All maintenance, workshop and category cost data loaded successfully');
      
    } catch (err) {
      console.error('Error fetching all cost data:', err);
      const errorMessage = tokenError || err.message;
      setDataError(errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Filter data based on date range
  const applyDateFilter = () => {
    // Filter maintenance data
    if (!allMaintenanceData.length) {
      setFilteredMaintenanceData([]);
    } else {
      let filteredMaintenance = allMaintenanceData;

      if (startDate || endDate) {
        filteredMaintenance = allMaintenanceData.filter(item => {
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

      setFilteredMaintenanceData(filteredMaintenance);
    }

    // Filter workshop data
    if (!allWorkshopData.length) {
      setFilteredWorkshopData([]);
    } else {
      let filteredWorkshop = allWorkshopData;

      if (startDate || endDate) {
        filteredWorkshop = allWorkshopData.filter(item => {
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

      setFilteredWorkshopData(filteredWorkshop);
    }

    // Filter category data
    if (!allCategoryData.length) {
      setFilteredCategoryData([]);
    } else {
      let filteredCategory = allCategoryData;

      if (startDate || endDate) {
        filteredCategory = allCategoryData.filter(item => {
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

      setFilteredCategoryData(filteredCategory);
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
    if (currentDashboardId && !allMaintenanceData.length && !allWorkshopData.length && !allCategoryData.length) {
      initializeData();
    }
  }, [currentDashboardId]);

  // Setup auto-refresh when updateInterval changes (but not on initial load)
  useEffect(() => {
    // Don't setup auto-refresh if we don't have data yet or if it's the initial default value
    if ((!allMaintenanceData.length && !allWorkshopData.length && !allCategoryData.length) || updateInterval === 30) return;
    
    const cleanup = setupAutoRefresh();
    return cleanup;
  }, [setupAutoRefresh, allMaintenanceData.length, allWorkshopData.length, allCategoryData.length]);

  // Apply filters when data or date range changes
  useEffect(() => {
    applyDateFilter();
  }, [allMaintenanceData, allWorkshopData, allCategoryData, startDate, endDate]);

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
            filteredData={filteredMaintenanceData}
          />
        </div>

        {/* Indicator 2: Internal vs External Costs */}
        <div className="xl:col-span-1">
          <WorkshopTypeCostIndicator 
            filteredData={filteredWorkshopData}
          />
        </div>

        {/* Indicator 3: Monthly Cost Trend */}
        <div className="xl:col-span-1">
          <MonthlyCostTrendIndicator 
            filteredData={filteredMaintenanceData}
          />
        </div>

        {/* Indicator 4: Cost Breakdown by Components */}
        <div className="xl:col-span-1">
          <CostCategoryBreakdownIndicator 
            filteredData={filteredCategoryData}
          />
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