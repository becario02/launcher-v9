// components/tableros/costos-mantenimiento/MaintenanceCostTypeIndicator.jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign } from 'lucide-react';
import { useTokenManager } from '@/hooks/useTokenManager';

const MaintenanceCostTypeIndicator = ({ filteredData = null }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedData, setProcessedData] = useState({
    cards: [],
    chartData: [],
    total: 0
  });

  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();

  // Color mapping for maintenance types
  const colorMap = {
    'PREVENTIVO': '#22C55E',
    'CORRECTIVO': '#F97316', 
    'MIXTO': '#8B5CF6',
    'RUTA': '#3B82F6',
    'OTRO': '#6B7280',
    'EXPRESS': '#EF4444'
  };

  const processMaintenanceData = (rawData) => {
    if (!Array.isArray(rawData)) return { cards: [], chartData: [], total: 0 };

    // Group by maintenance type and sum totals
    const grouped = rawData.reduce((acc, item) => {
      const type = (item.tipoMantto || 'OTRO').trim().toUpperCase();
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += parseFloat(item.totalMantto || 0);
      return acc;
    }, {});

    // Calculate total
    const total = Object.values(grouped).reduce((sum, value) => sum + value, 0);

    // Create cards data
    const cards = Object.entries(grouped)
      .filter(([_, value]) => value > 0) // Only show types with costs
      .sort(([, a], [, b]) => b - a) // Sort by value descending
      .map(([type, value]) => ({
        type,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: colorMap[type] || '#6B7280'
      }));

    // Create chart data
    const chartData = cards.map(card => ({
      name: card.type,
      value: card.value,
      color: card.color,
      percentage: card.percentage
    }));

    return { cards, chartData, total };
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      clearTokenError();

      const result = await tokenizedRequest('/mserpservice/api/tableros/costos-tipo-mantto', {
        method: 'GET'
      });
      
      if (result.statusCode === '200' && result.data) {
        const processed = processMaintenanceData(result.data);
        setProcessedData(processed);
        setData(result.data);
        console.log('Maintenance cost data loaded successfully');
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
      
    } catch (err) {
      console.error('Error fetching maintenance cost data:', err);
      const errorMessage = tokenError || err.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filteredData) {
      // Use filtered data from parent
      const processed = processMaintenanceData(filteredData);
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
            {data.payload.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {data.payload.percentage}% del total
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
              {isProcessingTokens ? 'Procesando tokens...' : 'Cargando costos de mantenimiento...'}
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
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Costo Total de Mantenimiento
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Costo acumulado desglosado por tipo
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(processedData.total)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total acumulado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Type cards */}
        <div className="space-y-3">
          {processedData.cards.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No hay datos disponibles
            </div>
          ) : (
            processedData.cards.map((card, index) => (
              <div
                key={card.type}
                className="p-4 border border-gray-200 dark:border-[#2C2C38] rounded-lg bg-gray-50 dark:bg-[#13131a]/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: card.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {card.type}
                    </span>
                  </div>
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: card.color }}
                  >
                    {card.percentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {formatCurrency(card.value)}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-right">
                    Monto acumulado
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right side - Donut chart */}
        <div className="flex items-center justify-center">
          {processedData.chartData.length === 0 ? (
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
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedData.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {processedData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default MaintenanceCostTypeIndicator;