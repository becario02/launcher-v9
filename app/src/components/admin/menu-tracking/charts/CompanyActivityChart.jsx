import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

// Importar Highcharts dinámicamente para evitar problemas de SSR
const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

const CompanyActivityChart = ({ isLoading = false }) => {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados para Highcharts
  const [Highcharts, setHighcharts] = useState(null);
  const [chartReady, setChartReady] = useState(false);
  
  // Estado para alternar entre menús y opciones
  const [viewType, setViewType] = useState('menu'); // 'menu' | 'option'
  
  // Estado para navegación por páginas de clientes
  const [clientPage, setClientPage] = useState(0); // Página actual (0-based)
  
  // Estados para datos de la API
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar Highcharts cuando el componente se monte
  useEffect(() => {
    const loadHighcharts = async () => {
      if (typeof window !== 'undefined') {
        try {
          const HighchartsModule = await import('highcharts');
          setHighcharts(HighchartsModule.default);
          setChartReady(true);
        } catch (error) {
          console.error('Error loading Highcharts:', error);
        }
      }
    };

    loadHighcharts();
  }, []);

  // Fetch datos cuando cambia el viewType
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/menu-tracking/activity-by-company?type=${viewType}`);
        const result = await response.json();
        
        if (result.statusCode === "200") {
          setData(result.data || []);
        } else {
          setError(result.message);
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching company activity:', err);
        setError('Error al cargar los datos');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (chartReady) {
      fetchData();
    }
  }, [viewType, chartReady]);

  // Reset página cuando cambia el tipo de vista
  useEffect(() => {
    setClientPage(0);
  }, [viewType]);

  // Procesar datos para la gráfica stack
  const processDataForChart = () => {
    if (!data || data.length === 0) return { categories: [], series: [], totalPages: 0, currentPage: 0 };

    // Los datos ya vienen ordenados por totalClicks desde la API
    const companiesWithTotals = data.map(company => ({
      company: company.companyName,
      totalClicks: company.totalClicks,
      items: company.items.reduce((acc, item) => {
        acc[item.name] = item.clicks;
        return acc;
      }, {})
    }));

    // Paginación: 5 compañías por página
    const pageSize = 5;
    const totalPages = Math.ceil(companiesWithTotals.length / pageSize);
    const startIndex = clientPage * pageSize;
    const currentPageCompanies = companiesWithTotals.slice(startIndex, startIndex + pageSize);

    // Si no hay compañías en la página actual, resetear a página 0
    if (currentPageCompanies.length === 0 && clientPage > 0) {
      setClientPage(0);
      return { categories: [], series: [], totalPages, currentPage: 0 };
    }

    // Obtener todas las opciones/menús únicos de las compañías actuales
    const allItems = new Set();
    currentPageCompanies.forEach(({ items }) => {
      Object.keys(items).forEach(item => allItems.add(item));
    });

    const categories = currentPageCompanies.map(({ company }) => company);
    const itemsArray = Array.from(allItems).slice(0, 8); // Top 8 items

    // Colores para las series
    const colors = [
      primaryColor,
      '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#F97316', '#84CC16'
    ];

    // Crear series para la gráfica stack
    const series = itemsArray.map((item, index) => ({
      name: item,
      data: categories.map(company => {
        const companyItems = currentPageCompanies.find(c => c.company === company)?.items || {};
        return companyItems[item] || 0;
      }),
      color: colors[index % colors.length]
    }));

    return { categories, series, totalPages, currentPage: clientPage };
  };

  // Configuración de la gráfica
  const getChartOptions = () => {
    const { categories, series } = processDataForChart();
    
    return {
      chart: {
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'Poppins, sans-serif'
        },
        height: 240,
        spacing: [10, 10, 10, 10],
        type: 'bar',
        marginTop: 20,
        marginBottom: 30,
        marginLeft: 100
      },
      title: {
        text: null
      },
      xAxis: {
        categories: categories,
        labels: {
          style: {
            color: isDark ? '#92929d' : '#696974',
            fontSize: '10px'
          }
        }
      },
      yAxis: {
        title: {
          text: 'Clics',
          style: {
            color: isDark ? '#92929d' : '#696974',
            fontSize: '11px'
          }
        },
        labels: {
          style: {
            color: isDark ? '#92929d' : '#696974',
            fontSize: '10px'
          }
        },
        gridLineColor: isDark ? '#2C2C38' : '#E5E5E5',
        stackLabels: {
          enabled: true,
          style: {
            color: isDark ? '#e2e2ea' : '#44444f',
            fontSize: '9px',
            fontWeight: 'normal'
          }
        }
      },
      plotOptions: {
        bar: {
          stacking: 'normal',
          dataLabels: {
            enabled: false // Deshabilitado para stack bars
          }
        }
      },
      series: series,
      tooltip: {
        backgroundColor: isDark ? '#2C2C38' : '#FFFFFF',
        style: {
          color: isDark ? '#e2e2ea' : '#44444f',
          fontSize: '11px'
        },
        borderColor: isDark ? '#2C2C38' : '#E5E5E5',
        formatter: function() {
          return `<b>${this.x}</b><br/>
                  <span style="color:${this.color}">${this.series.name}</span>: <b>${this.y}</b> clics<br/>
                  Total: <b>${this.point.stackTotal}</b> clics`;
        }
      },
      legend: {
        enabled: false // Deshabilitado para ahorrar espacio
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      }
    };
  };

  // Funciones de navegación
  const goToPreviousPage = () => {
    setClientPage(prev => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    const { totalPages } = processDataForChart();
    setClientPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // Componente de contenedor
  const ChartContainer = ({ children, isLoading }) => {
    const { totalPages, currentPage } = processDataForChart();
    
    return (
      <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" style={{ color: primaryColor }} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Actividad por Cliente
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Navegación de páginas */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  className={`p-1 rounded border transition-all ${
                    currentPage === 0
                      ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-300'
                  }`}
                  title="Clientes anteriores"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[40px] text-center">
                  {currentPage + 1}/{totalPages}
                </span>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className={`p-1 rounded border transition-all ${
                    currentPage >= totalPages - 1
                      ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-300'
                  }`}
                  title="Siguientes clientes"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Toggle buttons */}
            <div className="flex bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-1 gap-1">
              <button
                onClick={() => setViewType('menu')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
                  viewType === 'menu'
                    ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white shadow-sm'
                    : 'bg-transparent border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                Menús
              </button>
              <button
                onClick={() => setViewType('option')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
                  viewType === 'option'
                    ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white shadow-sm'
                    : 'bg-transparent border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                Opciones
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="h-60 bg-gray-100 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
            <div className="text-gray-400 dark:text-gray-500">Cargando gráfica...</div>
          </div>
        ) : (
          <div className="h-60 w-full overflow-hidden">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Componente de gráfica
  const Chart = () => {
    if (!Highcharts || !chartReady) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500">Cargando Highcharts...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full flex flex-col items-center justify-center">
          <div className="text-red-500 dark:text-red-400 text-sm mb-2">Error al cargar datos</div>
          <div className="text-gray-400 dark:text-gray-500 text-xs">{error}</div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            No hay datos de actividad para {viewType === 'menu' ? 'menús' : 'opciones'}
          </div>
        </div>
      );
    }

    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={getChartOptions()}
      />
    );
  };

  const isLoadingState = isLoading || !chartReady || loading;

  return (
    <ChartContainer isLoading={isLoadingState}>
      <Chart />
    </ChartContainer>
  );
};

export default CompanyActivityChart;