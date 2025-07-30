// components/tableros/costos-mantenimiento/MonthlyCostTrendIndicator.jsx
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';
import { useTokenManager } from '@/hooks/useTokenManager';

const MonthlyCostTrendIndicator = ({ filteredData = null }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();

  // Color mapping for maintenance types
  const colorMap = {
    'PREVENTIVO': '#22C55E', // Green
    'CORRECTIVO': '#F97316', // Orange  
    'RUTA': '#3B82F6',       // Blue
    'MIXTO': '#8B5CF6',      // Purple
    'OTRO': '#6B7280',       // Gray
    'EXPRESS': '#EF4444'     // Red
  };

  // Month names in Spanish
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const processMonthlyData = (rawData) => {
    if (!Array.isArray(rawData)) return [];

    // Group data by year-month and maintenance type
    const monthlyGroups = {};

    rawData.forEach(item => {
      const date = new Date(item.fecha);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-based
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      const type = (item.tipoMantto || 'OTRO').trim().toUpperCase();
      const value = parseFloat(item.totalMantto || 0);

      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {
          year,
          month,
          monthName: monthNames[month],
          yearMonth: `${monthNames[month]} ${year}`,
          PREVENTIVO: 0,
          CORRECTIVO: 0,
          RUTA: 0,
          MIXTO: 0,
          OTRO: 0,
          EXPRESS: 0
        };
      }

      if (monthlyGroups[monthKey][type] !== undefined) {
        monthlyGroups[monthKey][type] += value;
      } else {
        monthlyGroups[monthKey]['OTRO'] += value;
      }
    });

    // Convert to array and sort by date
    const chartData = Object.keys(monthlyGroups)
      .sort()
      .map(key => monthlyGroups[key]);

    return chartData;
  };

  const createChart = (data) => {
    if (!chartRef.current || !window.Highcharts) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const categories = data.map(item => item.yearMonth);
    const series = [];

    // Create series for each maintenance type
    Object.keys(colorMap).forEach(type => {
      const seriesData = data.map(item => item[type] || 0);
      const hasData = seriesData.some(value => value > 0);
      
      if (hasData) {
        series.push({
          name: type.charAt(0) + type.slice(1).toLowerCase(),
          data: seriesData,
          color: colorMap[type],
          stack: 'maintenance'
        });
      }
    });

    const options = {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'inherit'
        }
      },
      title: {
        text: null
      },
      xAxis: {
        categories: categories,
        labels: {
          style: {
            color: '#6b7280',
            fontSize: '12px'
          }
        },
        lineColor: '#e5e7eb',
        tickColor: '#e5e7eb'
      },
      yAxis: {
        title: {
          text: 'Costo (MXN)',
          style: {
            color: '#6b7280',
            fontSize: '12px'
          }
        },
        labels: {
          style: {
            color: '#6b7280',
            fontSize: '12px'
          },
          formatter: function() {
            return new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(this.value);
          }
        },
        gridLineColor: '#e5e7eb'
      },
      tooltip: {
        shared: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderRadius: 8,
        shadow: true,
        useHTML: true,
        formatter: function() {
          // Use the category directly from the chart data
          const categoryIndex = this.points[0].point.index;
          const monthYear = categories[categoryIndex];
          
          let tooltip = `<div style="padding: 8px;"><strong>${monthYear}</strong><br/>`;
          let total = 0;
          
          this.points.forEach(point => {
            if (point.y > 0) {
              total += point.y;
              tooltip += `<div style="display: flex; align-items: center; margin: 4px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${point.color}; margin-right: 8px; border-radius: 2px;"></span>
                <span style="margin-right: 16px;">${point.series.name}:</span>
                <strong>${new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(point.y)}</strong>
              </div>`;
            }
          });
          
          tooltip += `<hr style="margin: 8px 0; border: none; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between;">
              <strong>Total:</strong>
              <strong>${new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(total)}</strong>
            </div></div>`;
          
          return tooltip;
        }
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          borderWidth: 0,
          pointPadding: 0.1,
          groupPadding: 0.1
        }
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        itemStyle: {
          color: '#6b7280',
          fontSize: '12px'
        },
        itemHoverStyle: {
          color: '#374151'
        },
        symbolRadius: 2,
        symbolHeight: 12,
        symbolWidth: 12
      },
      series: series,
      credits: {
        enabled: false
      },
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      }
    };

    chartInstance.current = window.Highcharts.chart(chartRef.current, options);
  };

  const loadHighcharts = () => {
    if (window.Highcharts) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://code.highcharts.com/highcharts.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
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
        const processedData = processMonthlyData(result.data);
        setChartData(processedData);
        setData(result.data);
        console.log('Monthly cost trend data loaded successfully');
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
      
    } catch (err) {
      console.error('Error fetching monthly cost trend data:', err);
      const errorMessage = tokenError || err.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHighcharts().then(() => {
      if (filteredData) {
        // Use filtered data from parent
        const processedData = processMonthlyData(filteredData);
        setChartData(processedData);
        setIsLoading(false);
        setError(null);
      } else {
        // Fetch data if no filtered data provided
        fetchData();
      }
    }).catch(err => {
      console.error('Error loading Highcharts:', err);
      setError('Error al cargar la librería de gráficos');
      setIsLoading(false);
    });
  }, [filteredData]);

  useEffect(() => {
    if (chartData.length > 0 && !isLoading && window.Highcharts) {
      createChart(chartData);
    } else if (chartData.length === 0 && chartInstance.current) {
      // Destroy chart when no data to show only skeleton
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  }, [chartData, isLoading]);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

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
              {isProcessingTokens ? 'Procesando tokens...' : 'Cargando evolución mensual...'}
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
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Costo Mensual por Tipo de Mantenimiento
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Evolución mensual desglosada por tipo
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {chartData.length === 0 ? (
          // Simple skeleton for chart
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Cargando gráfico...</p>
              </div>
            </div>
          </div>
        ) : (
          <div ref={chartRef} className="w-full h-full"></div>
        )}
      </div>
    </div>
  );
};

export default MonthlyCostTrendIndicator;