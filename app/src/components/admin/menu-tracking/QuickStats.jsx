import React from 'react';
import { User, MousePointer, Activity, Clock } from 'lucide-react';

const QuickStats = ({ isLoading = false }) => {
  // Datos ficticios para las estadísticas
  const statsData = [
    {
      id: 'active-users',
      title: 'Usuarios Activos',
      value: '24',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'total-clicks',
      title: 'Clics Totales',
      value: '1,247',
      icon: MousePointer,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'most-used-menus',
      title: 'Menús Más Usados',
      value: '18',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      id: 'last-access',
      title: 'Último Acceso',
      value: '2m',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {isLoading ? (
        // Mostrar skeletons mientras carga
        Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))
      ) : (
        // Mostrar estadísticas reales
        statsData.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))
      )}
    </div>
  );
};

export default QuickStats;