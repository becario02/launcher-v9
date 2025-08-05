import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

// Importar Highcharts dinámicamente para evitar problemas de SSR
const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

const UserActivityChart = ({ data = [], isLoading = false }) => {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados para Highcharts
  const [Highcharts, setHighcharts] = useState(null);
  const [chartReady, setChartReady] = useState(false);

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

  // Configuración de la gráfica
  const getChartOptions = () => ({
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
      marginLeft: 80
    },
    title: {
      text: null
    },
    xAxis: {
      type: 'category',
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
      gridLineColor: isDark ? '#2C2C38' : '#E5E5E5'
    },
    series: [{
      name: 'Clics',
      data: data.slice(0, 5), // Mostrar solo top 5 usuarios
      color: primaryColor
    }],
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          style: {
            color: isDark ? '#e2e2ea' : '#44444f',
            fontSize: '10px',
            fontWeight: 'normal'
          }
        }
      }
    },
    tooltip: {
      backgroundColor: isDark ? '#2C2C38' : '#FFFFFF',
      style: {
        color: isDark ? '#e2e2ea' : '#44444f',
        fontSize: '11px'
      },
      borderColor: isDark ? '#2C2C38' : '#E5E5E5',
      pointFormat: '<b>{point.name}</b><br/>Total de clics: <b>{point.y}</b>'
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    }
  });

  // Componente de contenedor
  const ChartContainer = ({ children, isLoading }) => (
    <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5" style={{ color: primaryColor }} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad por Usuario</h3>
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

    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={getChartOptions()}
      />
    );
  };

  return (
    <ChartContainer isLoading={isLoading || !chartReady}>
      <Chart />
    </ChartContainer>
  );
};

export default UserActivityChart;