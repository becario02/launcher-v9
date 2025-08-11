import React, { useState } from 'react';
import { Search, Filter, Settings, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import Cookies from 'js-cookie';

const VehicleFilters = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  filterOptions,
  itemsPerPage,
  setItemsPerPage,
  onSettingsClick,
  isLoading = false,
  totalVehicles = 0
}) => {
  const { primaryColor } = usePrimaryColor();
  const [showFilters, setShowFilters] = useState(false);

  // Get profile name from cookies to check user type
  const profileName = Cookies.get('profileName');
  // Check if user can access settings (exclude USERCUSTOMER only)
  const canAccessSettings = profileName !== 'USERCUSTOMER';

  const itemsPerPageOptions = [10, 20, 30, 50, 100];

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      lineaNegocio: '',
      circuito: '',
      cliente: '',
      terminalOrigen: '',
      terminalDestino: '',
      status: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchTerm !== '';

  return (
    <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg p-4 mb-6">
      {/* Top Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* Left Side - Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar por unidad, operador o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary dark:focus:border-primary"
              style={{ '--tw-ring-color': primaryColor }}
              disabled={isLoading}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm border transition-colors ${
              showFilters
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-[#2C2C38] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            disabled={isLoading}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Side - Results, Items per page, Settings */}
        <div className="flex items-center gap-4">
          {/* Results Counter */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            {isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin" />
            )}
            <span>
              <span className="font-medium text-gray-900 dark:text-white">
                {isLoading ? '...' : totalVehicles}
              </span> vehículos
            </span>
          </div>

          {/* Items per page */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 rounded border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ '--tw-ring-color': primaryColor }}
              disabled={isLoading}
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Settings */}
          {canAccessSettings && (
            <button
              onClick={onSettingsClick}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Configuración de actualización"
              disabled={isLoading}
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="border-t border-gray-200 dark:border-[#2C2C38] pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-2 py-2 text-sm rounded border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ '--tw-ring-color': primaryColor }}
                disabled={isLoading}
              >
                <option value="">Todos</option>
                {filterOptions.statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Business Line Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Línea de Negocio
              </label>
              <select
                value={filters.lineaNegocio}
                onChange={(e) => handleFilterChange('lineaNegocio', e.target.value)}
                className="w-full px-2 py-2 text-sm rounded border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ '--tw-ring-color': primaryColor }}
                disabled={isLoading}
              >
                <option value="">Todas</option>
                {filterOptions.lineasNegocio.map(linea => (
                  <option key={linea} value={linea}>{linea}</option>
                ))}
              </select>
            </div>

            {/* Circuit Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Circuito
              </label>
              <select
                value={filters.circuito}
                onChange={(e) => handleFilterChange('circuito', e.target.value)}
                className="w-full px-2 py-2 text-sm rounded border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ '--tw-ring-color': primaryColor }}
                disabled={isLoading}
              >
                <option value="">Todos</option>
                {filterOptions.circuitos.map(circuito => (
                  <option key={circuito} value={circuito}>{circuito}</option>
                ))}
              </select>
            </div>

            {/* Client Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cliente
              </label>
              <select
                value={filters.cliente}
                onChange={(e) => handleFilterChange('cliente', e.target.value)}
                className="w-full px-2 py-2 text-sm rounded border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ '--tw-ring-color': primaryColor }}
                disabled={isLoading}
              >
                <option value="">Todos</option>
                {filterOptions.clientes.map(cliente => (
                  <option key={cliente} value={cliente}>{cliente}</option>
                ))}
              </select>
            </div>

            {/* Origin Terminal Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Terminal Origen
              </label>
              <select
                value={filters.terminalOrigen}
                onChange={(e) => handleFilterChange('terminalOrigen', e.target.value)}
                className="w-full px-2 py-2 text-sm rounded border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ '--tw-ring-color': primaryColor }}
                disabled={isLoading}
              >
                <option value="">Todas</option>
                {filterOptions.terminalesOrigen.map(terminal => (
                  <option key={terminal} value={terminal}>{terminal}</option>
                ))}
              </select>
            </div>

            {/* Destination Terminal Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Terminal Destino
              </label>
              <select
                value={filters.terminalDestino}
                onChange={(e) => handleFilterChange('terminalDestino', e.target.value)}
                className="w-full px-2 py-2 text-sm rounded border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ '--tw-ring-color': primaryColor }}
                disabled={isLoading}
              >
                <option value="">Todas</option>
                {filterOptions.terminalesDestino.map(terminal => (
                  <option key={terminal} value={terminal}>{terminal}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end mt-4">
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
                disabled={isLoading}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleFilters;