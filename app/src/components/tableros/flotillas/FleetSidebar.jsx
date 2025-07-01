import React from 'react';
import { Search, Settings, MapPin, Truck, RefreshCw } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import Cookies from 'js-cookie';

const FleetSidebar = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  filteredData,
  selectedUnit,
  onUnitSelect,
  onSettingsClick,
  isLoading = false
}) => {
  const { primaryColor } = usePrimaryColor();

  // Get profile name from cookies to check user type
  const profileName = Cookies.get('profileName');
  
  // Check if user can access settings (exclude USERCUSTOMER only)
  const canAccessSettings = profileName !== 'USERCUSTOMER';

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Vencido': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Por Vencer': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Realizado': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'No Requiere': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  return (
    <div className="w-full lg:w-80 bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg lg:mr-6 mb-6 lg:mb-0 flex flex-col h-96 lg:h-full">
      {/* Controls Section */}
      <div className="p-4 border-b border-gray-200 dark:border-[#2C2C38]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
            {isLoading && (
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            )}
          </div>
          {canAccessSettings && (
            <button
              onClick={onSettingsClick}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Configuración de actualización"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar por número económico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary dark:focus:border-primary"
              style={{ '--tw-ring-color': primaryColor }}
              disabled={isLoading}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary dark:focus:border-primary"
            style={{ '--tw-ring-color': primaryColor }}
            disabled={isLoading}
          >
            <option value="ALL">Todos los estados</option>
            <option value="Vencido">Vencido</option>
            <option value="Por Vencer">Por Vencer</option>
            <option value="Realizado">Realizado</option>
            <option value="No Requiere">No Requiere</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="p-3 border-b border-gray-200 dark:border-[#2C2C38] bg-gray-50 dark:bg-[#2C2C38]">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {isLoading ? '...' : filteredData.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total unidades</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600 dark:text-red-400">
              {isLoading ? '...' : filteredData.filter(u => u.StatusMantto === 'Vencido').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Vencidas</div>
          </div>
        </div>
      </div>

      {/* Unit Cards */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {isLoading && filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Cargando unidades...</p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-600 dark:text-gray-400">No se encontraron unidades</p>
          </div>
        ) : (
          filteredData.map((unit) => (
            <div
              key={unit.NumEco}
              onClick={() => !isLoading && onUnitSelect(unit)}
              className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
                selectedUnit?.NumEco === unit.NumEco
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-200 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">{unit.NumEco}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(unit.StatusMantto)}`}>
                  {unit.StatusMantto}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <span className="font-medium text-gray-900 dark:text-white">TRACTOR</span>
                </div>
                <div className="flex justify-between">
                  <span>Destino:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{unit.TerminalDestino}</span>
                </div>
                <div className="flex justify-between">
                  <span>Km por vencer:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{unit.Kilometrosporvencerovencido}</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{unit.Posicion}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FleetSidebar;