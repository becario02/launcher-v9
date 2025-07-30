// components/tableros/costos-mantenimiento/WorkshopTypeCostIndicator.jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Building2 } from 'lucide-react';
import { useTokenManager } from '@/hooks/useTokenManager';

const WorkshopTypeCostIndicator = ({ filteredData = null }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedData, setProcessedData] = useState({
    internalCards: [],
    externalCards: [],
    chartData: [],
    totalInternal: 0,
    totalExternal: 0,
    grandTotal: 0
  });

  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();

  // Colors for preventivo and correctivo only
  const maintenanceColors = {
    'PREVENTIVO': '#9CA3AF', // Gray
    'CORRECTIVO': '#06B6D4'  // Blue
  };

  // Colors for section backgrounds
  const sectionColors = {
    internal: '#06B6D4', // Blue for internal section
    external: '#9CA3AF'  // Gray for external section
  };

  const processWorkshopData = (rawData) => {
    if (!Array.isArray(rawData)) return {
      internalCards: [],
      externalCards: [],
      totalInternal: 0,
      totalExternal: 0,
      grandTotal: 0
    };

    // Process data and separate MIXTO values
    const result = {
      internal: { PREVENTIVO: 0, CORRECTIVO: 0 },
      external: { PREVENTIVO: 0, CORRECTIVO: 0 }
    };

    rawData.forEach(item => {
      const type = (item.tipoMantto || '').trim().toUpperCase();
      const internal = parseFloat(item.totalInterno || 0);
      const external = parseFloat(item.totalExterno || 0);

      if (type === 'PREVENTIVO') {
        result.internal.PREVENTIVO += internal;
        result.external.PREVENTIVO += external;
      } else if (type === 'CORRECTIVO') {
        result.internal.CORRECTIVO += internal;
        result.external.CORRECTIVO += external;
      } else if (type === 'MIXTO') {
        // Split MIXTO 50/50 between PREVENTIVO and CORRECTIVO
        result.internal.PREVENTIVO += internal * 0.5;
        result.internal.CORRECTIVO += internal * 0.5;
        result.external.PREVENTIVO += external * 0.5;
        result.external.CORRECTIVO += external * 0.5;
      }
      // Ignore all other types (RUTA, EXPRESS, OTRO, etc.)
    });

    // Calculate totals
    const totalInternal = result.internal.PREVENTIVO + result.internal.CORRECTIVO;
    const totalExternal = result.external.PREVENTIVO + result.external.CORRECTIVO;
    const grandTotal = totalInternal + totalExternal;

    // Create internal cards (only PREVENTIVO and CORRECTIVO)
    const internalCards = [];
    if (result.internal.PREVENTIVO > 0) {
      internalCards.push({
        type: 'PREVENTIVO',
        value: result.internal.PREVENTIVO,
        percentage: totalInternal > 0 ? Math.round((result.internal.PREVENTIVO / totalInternal) * 100) : 0,
        color: maintenanceColors.PREVENTIVO
      });
    }
    if (result.internal.CORRECTIVO > 0) {
      internalCards.push({
        type: 'CORRECTIVO',
        value: result.internal.CORRECTIVO,
        percentage: totalInternal > 0 ? Math.round((result.internal.CORRECTIVO / totalInternal) * 100) : 0,
        color: maintenanceColors.CORRECTIVO
      });
    }

    // Create external cards (only PREVENTIVO and CORRECTIVO)
    const externalCards = [];
    if (result.external.PREVENTIVO > 0) {
      externalCards.push({
        type: 'PREVENTIVO',
        value: result.external.PREVENTIVO,
        percentage: totalExternal > 0 ? Math.round((result.external.PREVENTIVO / totalExternal) * 100) : 0,
        color: maintenanceColors.PREVENTIVO
      });
    }
    if (result.external.CORRECTIVO > 0) {
      externalCards.push({
        type: 'CORRECTIVO',
        value: result.external.CORRECTIVO,
        percentage: totalExternal > 0 ? Math.round((result.external.CORRECTIVO / totalExternal) * 100) : 0,
        color: maintenanceColors.CORRECTIVO
      });
    }

    return {
      internalCards,
      externalCards,
      totalInternal,
      totalExternal,
      grandTotal
    };
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      clearTokenError();

      const result = await tokenizedRequest('/mserpservice/api/tableros/costos-tipo-taller', {
        method: 'GET'
      });
      
      if (result.statusCode === '200' && result.data) {
        const processed = processWorkshopData(result.data);
        setProcessedData(processed);
        setData(result.data);
        console.log('Workshop cost data loaded successfully');
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
      
    } catch (err) {
      console.error('Error fetching workshop cost data:', err);
      const errorMessage = tokenError || err.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filteredData) {
      // Use filtered data from parent
      const processed = processWorkshopData(filteredData);
      setProcessedData(processed);
      setIsLoading(false);
      setError(null);
    } else {
      // Fetch data if no filtered data provided
      fetchData();
    }
  }, [filteredData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {data.payload.type}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {data.payload.percentage}% del tipo
          </p>
        </div>
      );
    }
    return null;
  };

  const handleRetry = () => {
    setError(null);
    clearTokenError();
    fetchData();
  };

  if (isLoading || isProcessingTokens) {
    return (
      <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {isProcessingTokens ? 'Procesando tokens...' : 'Cargando costos por tipo de taller...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || tokenError) {
    return (
      <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Error al cargar los datos: {error || tokenError}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <Building2 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Costo de Mantenimiento por Tipo de Taller
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Interno vs Externo
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(processedData.grandTotal)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total acumulado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Internal and External cards */}
        <div className="space-y-4">
          {/* Internal Section */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: `${sectionColors.internal}20` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sectionColors.internal }}
                ></div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Interno
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(processedData.totalInternal)}
              </span>
            </div>
            
            <div className="space-y-2">
              {processedData.internalCards.length === 0 ? (
                // Skeleton for internal cards
                <>
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded animate-pulse">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                      </div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                    </div>
                  ))}
                </>
              ) : (
                processedData.internalCards.map((card) => (
                  <div key={`internal-${card.type}`} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: card.color }}
                      ></div>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {card.type}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(card.value)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* External Section */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: `${sectionColors.external}20` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sectionColors.external }}
                ></div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Externo
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(processedData.totalExternal)}
              </span>
            </div>
            
            <div className="space-y-2">
              {processedData.externalCards.length === 0 ? (
                // Skeleton for external cards
                <>
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded animate-pulse">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                      </div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                    </div>
                  ))}
                </>
              ) : (
                processedData.externalCards.map((card) => (
                  <div key={`external-${card.type}`} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: card.color }}
                      ></div>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {card.type}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(card.value)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right side - Concentric Donut charts */}
        <div className="flex items-center justify-center">
          {(processedData.internalCards.length === 0 && processedData.externalCards.length === 0) ? (
            // Skeleton for chart
            <div className="w-full h-64 flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full border-8 border-gray-200 dark:border-gray-700 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* Outer ring - External costs (PREVENTIVO blue, CORRECTIVO gray) */}
                  {processedData.externalCards.length > 0 && (
                    <Pie
                      data={processedData.externalCards}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#ffffff"
                    >
                      {processedData.externalCards.map((entry, index) => (
                        <Cell key={`external-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  )}
                  
                  {/* Inner ring - Internal costs (PREVENTIVO blue, CORRECTIVO gray) */}
                  {processedData.internalCards.length > 0 && (
                    <Pie
                      data={processedData.internalCards}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#ffffff"
                    >
                      {processedData.internalCards.map((entry, index) => (
                        <Cell key={`internal-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  )}
                  
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend overlay */}
              <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-200 dark:border-gray-600">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: maintenanceColors.PREVENTIVO }}></div>
                    <span className="text-gray-700 dark:text-gray-300">Preventivo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: maintenanceColors.CORRECTIVO }}></div>
                    <span className="text-gray-700 dark:text-gray-300">Correctivo</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkshopTypeCostIndicator;