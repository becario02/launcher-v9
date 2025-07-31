// components/tableros/costos-mantenimiento/CostCategoryBreakdownIndicator.jsx
import React, { useState, useEffect, useRef } from 'react';
import { BarChart3 } from 'lucide-react';
import { useTokenManager } from '@/hooks/useTokenManager';

const CostCategoryBreakdownIndicator = ({ filteredData = null }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();

  // Color mapping for cost categories
  const categoryColors = {
    'Mano de obra': '#3B82F6',  // Blue
    'Insumos': '#F97316',      // Orange
    'Otros': '#22C55E'         // Green
  };

  // Color mapping for maintenance types (for grouping)
  const maintenanceColors = {
    'PREVENTIVO': '#22C55E', // Green
    'CORRECTIVO': '#F97316', // Orange  
    'RUTA': '#3B82F6',       // Blue
    'MIXTO': '#8B5CF6',      // Purple
    'OTRO': '#6B7280',       // Gray
    'EXPRESS': '#EF4444'     // Red
  };

  const processCategoryData = (rawData) => {
    if (!Array.isArray(rawData)) return [];

    // Group data by maintenance type and sum categories
    const grouped = {};

    rawData.forEach(item => {
      const type = (item.tipoMantto || 'OTRO').trim().toUpperCase();
      const manoObra = parseFloat(item.totalManoObra || 0);
      const insumos = parseFloat(item.totalInsumos || 0);
      const otros = parseFloat(item.totalOtros || 0);

      if (!grouped[type]) {
        grouped[type] = {
          type,
          manoObra: 0,
          insumos: 0,
          otros: 0
        };
      }

      grouped[type].manoObra += manoObra;
      grouped[type].insumos += insumos;
      grouped[type].otros += otros;
    });

    // Convert to array and filter out types with no costs
    const chartData = Object.values(grouped)
      .filter(item => item.manoObra > 0 || item.insumos > 0 || item.otros > 0)
      .sort((a, b) => {
        const totalA = a.manoObra + a.insumos + a.otros;
        const totalB = b.manoObra + b.insumos + b.otros;
        return totalB - totalA; // Sort by total descending
      });

    return chartData;
  };

  const createChart = (data) => {
    if (!chartRef.current || !window.Highcharts || data.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare categories (cost types)
    const categories = ['Costo otros', 'Costo mano de obra', 'Costo insumos'];

    // Prepare series data - each series represents a maintenance type
    const series = [];
    
    // Get all maintenance types that have data
    const maintenanceTypes = [...new Set(data.map(item => item.type))];
    
    maintenanceTypes.forEach(type => {
      const item = data.find(d => d.type === type);
      if (item) {
        series.push({
          name: type.charAt(0) + type.slice(1).toLowerCase(),
          data: [item.otros, item.manoObra, item.insumos], // Order: otros, mano de obra, insumos
          color: maintenanceColors[type] || '#6B7280'
        });
      }
    });

    const options = {
      chart: {
        type: 'bar',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'inherit'
        },
        options3d: {
          enabled: true,
          alpha: 15, // Rotation around x-axis
          beta: 15,  // Rotation around y-axis
          depth: 50, // Depth of the 3D chart
          viewDistance: 25
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
          rotation: 0, // Horizontal labels
          formatter: function() {
            const value = this.value;
            if (value >= 1000000) {
              const millions = value / 1000000;
              // Show decimal if needed to avoid duplicates
              if (millions % 1 === 0) {
                return millions.toFixed(0) + 'M';
              } else if (millions >= 10) {
                return millions.toFixed(1) + 'M';
              } else {
                return millions.toFixed(1) + 'M';
              }
            } else if (value >= 1000) {
              const thousands = value / 1000;
              if (thousands % 1 === 0) {
                return thousands.toFixed(0) + 'K';
              } else {
                return thousands.toFixed(1) + 'K';
              }
            }
            return new Intl.NumberFormat('es-MX', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        },
        gridLineColor: '#e5e7eb'
      },
      tooltip: {
        shared: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderRadius: 8,
        shadow: true,
        useHTML: true,
        formatter: function() {
          const categoryIndex = this.point.index;
          const seriesName = this.series.name;
          const value = this.y;
          
          // Get the actual category name from the categories array
          const categories = ['Costo otros', 'Costo mano de obra', 'Costo insumos'];
          const categoryName = categories[categoryIndex];
          
          // Map category names to more descriptive names
          const categoryMap = {
            'Costo otros': 'Otros gastos',
            'Costo mano de obra': 'Mano de obra',
            'Costo insumos': 'Insumos y materiales'
          };
          
          const displayCategory = categoryMap[categoryName] || categoryName;
          
          let tooltip = `<div style="padding: 8px;">
            <strong>${displayCategory}</strong><br/>
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${this.color}; margin-right: 8px; border-radius: 2px;"></span>
              <span style="margin-right: 16px;">${seriesName}:</span>
              <strong>${new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value)}</strong>
            </div>
          </div>`;
          
          return tooltip;
        }
      },
      plotOptions: {
        bar: {
          grouping: true, // Enable grouping instead of stacking
          borderWidth: 0,
          pointPadding: 0.05, // Reduced from 0.1 to make bars wider
          groupPadding: 0.15, // Reduced from 0.2 to make bars wider
          depth: 25, // 3D depth for bars
          dataLabels: {
            enabled: true,
            inside: false,
            align: 'right',
            style: {
              color: '#374151',
              fontSize: '10px',
              fontWeight: 'bold'
            },
            formatter: function() {
              if (this.y === 0) return '';
              return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(this.y);
            }
          }
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
    if (window.Highcharts && window.Highcharts.chart) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Load main Highcharts library
      const mainScript = document.createElement('script');
      mainScript.src = 'https://code.highcharts.com/highcharts.js';
      mainScript.onload = () => {
        // Load 3D module
        const threeDScript = document.createElement('script');
        threeDScript.src = 'https://code.highcharts.com/highcharts-3d.js';
        threeDScript.onload = resolve;
        threeDScript.onerror = reject;
        document.head.appendChild(threeDScript);
      };
      mainScript.onerror = reject;
      document.head.appendChild(mainScript);
    });
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      clearTokenError();

      const result = await tokenizedRequest('/mserpservice/api/tableros/costos-mobra-insumos-otros', {
        method: 'GET'
      });
      
      if (result.statusCode === '200' && result.data) {
        const processedData = processCategoryData(result.data);
        setChartData(processedData);
        setData(result.data);
        console.log('Cost category breakdown data loaded successfully');
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
      
    } catch (err) {
      console.error('Error fetching cost category breakdown data:', err);
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
        const processedData = processCategoryData(filteredData);
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
              {isProcessingTokens ? 'Procesando tokens...' : 'Cargando desglose por categorías...'}
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
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Tipo de Costo por Categoría de Mantenimiento
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Desglose por mano de obra, insumos y otros
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
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
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

export default CostCategoryBreakdownIndicator;