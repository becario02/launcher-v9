import React, { useState, useEffect } from 'react';
import { User, MousePointer, Menu, Activity } from 'lucide-react';

const QuickStats = ({ isLoading = false }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch de las estadísticas desde la API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/menu-tracking/quick-stats');
        const result = await response.json();
        
        if (result.statusCode === "200") {
          setStats(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error('Error fetching quick stats:', err);
        setError('Error al cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Configuración de las estadísticas basada en los datos de la API
  const getStatsConfig = (statsData) => {
    if (!statsData) return [];

    return [
      {
        id: 'active-users',
        title: 'Usuarios Activos',
        value: statsData.activeUsers?.toLocaleString() || '0',
        icon: User,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      },
      {
        id: 'total-clicks',
        title: 'Clics Totales',
        value: statsData.totalClicks?.toLocaleString() || '0',
        icon: Activity,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20'
      },
      {
        id: 'total-clicks-menu',
        title: 'Clics en Menús',
        value: statsData.totalClicksMenu?.toLocaleString() || '0',
        icon: Menu,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      },
      {
        id: 'total-clicks-option',
        title: 'Clics en Opciones',
        value: statsData.totalClicksOption?.toLocaleString() || '0',
        icon: MousePointer,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
      }
    ];
  };

  // Componente de skeleton para loading
  const StatCardSkeleton = () => (
    <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-6 animate-pulse">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="ml-4 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );

  // Componente de tarjeta de estadística
  const StatCard = ({ stat }) => {
    const IconComponent = stat.icon;
    
    return (
      <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-2 rounded-lg ${stat.bgColor}`}>
            <IconComponent className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.title}
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
              {stat.value}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Componente de error
  const ErrorCard = () => (
    <div className="col-span-full">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Activity className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error al cargar estadísticas
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const statsConfig = getStatsConfig(stats);
  const isLoadingState = isLoading || loading;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {error ? (
        <ErrorCard />
      ) : isLoadingState ? (
        // Mostrar skeletons mientras carga
        Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))
      ) : (
        // Mostrar estadísticas reales
        statsConfig.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))
      )}
    </div>
  );
};

export default QuickStats;