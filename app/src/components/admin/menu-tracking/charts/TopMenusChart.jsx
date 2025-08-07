import React, { useState, useEffect } from 'react';
import { PieChart } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

// Importar Highcharts dinámicamente para evitar problemas de SSR
const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

const TopMenusChart = ({ isLoading = false }) => {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados para Highcharts
  const [Highcharts, setHighcharts] = useState(null);
  const [chartReady, setChartReady] = useState(false);
  
  // Estado para alternar entre menús y opciones
  const [viewType, setViewType] = useState('menu'); // 'menu' | 'option'
  
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
        
        const response = await fetch(`/api/menu-tracking/top?type=${viewType}`);
        const result = await response.json();
        
        if (result.statusCode === "200") {
          setData(result.data || []);
        } else {
          setError(result.message);
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching top data:', err);
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

  // Procesar datos para la gráfica
  const processDataForChart = () => {
    if (!data || data.length === 0) return [];

    // Convertir los datos de la API al formato esperado por Highcharts
    return data.map(item => ({
      name: item.name,
      y: item.clicks
    }));
  };

  // Configuración de la gráfica
  const getChartOptions = () => {
    const chartData = processDataForChart();
    
    return {
      chart: {
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'Poppins, sans-serif'
        },
        height: 240,
        spacing: [10, 10, 10, 10],
        type: 'pie',
        marginTop: 10,
        marginBottom: 10
      },
      title: {
        text: null
      },
      series: [{
        name: 'Clics',
        data: chartData,
        innerSize: '40%',
        size: '85%'
      }],
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
            style: {
              color: isDark ? '#e2e2ea' : '#44444f',
              fontSize: '9px'
            },
            distance: 15
          },
          showInLegend: false
        }
      },
      colors: [
        primaryColor,
        '#10B981',
        '#F59E0B',
        '#EF4444',
        '#8B5CF6',
        '#06B6D4',
        '#F97316',
        '#84CC16'
      ],
      tooltip: {
        backgroundColor: isDark ? '#2C2C38' : '#FFFFFF',
        style: {
          color: isDark ? '#e2e2ea' : '#44444f',
          fontSize: '11px'
        },
        borderColor: isDark ? '#2C2C38' : '#E5E5E5',
        pointFormat: '<b>{point.name}</b><br/>Clics: <b>{point.y}</b><br/>Porcentaje: <b>{point.percentage:.1f}%</b>'
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      }
    };
  };

  // Componente de contenedor
  const ChartContainer = ({ children, isLoading }) => (
    <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5" style={{ color: primaryColor }} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top {viewType === 'menu' ? 'Menús' : 'Opciones'}
          </h3>
        </div>
        
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
            No hay datos disponibles para {viewType === 'menu' ? 'menús' : 'opciones'}
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

export default TopMenusChart;