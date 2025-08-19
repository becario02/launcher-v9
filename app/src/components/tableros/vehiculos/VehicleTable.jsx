import React, { useState } from 'react';
import { Radio, Zap, RefreshCw, ChevronLeft, ChevronRight, MapPin, Clock, User, Building } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';

const VehicleTable = ({ vehiclesData, itemsPerPage, isLoading = false, resetPageTrigger }) => {
  const { primaryColor } = usePrimaryColor();
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const totalPages = Math.ceil(vehiclesData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = vehiclesData.slice(startIndex, endIndex);

  // Reset to first page when filters change (triggered by resetPageTrigger prop)
  React.useEffect(() => {
    if (resetPageTrigger) {
      setCurrentPage(1);
    }
  }, [resetPageTrigger]);

  // Reset to first page when items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Adjust current page if it's beyond the available pages
  React.useEffect(() => {
    const maxValidPage = Math.ceil(vehiclesData.length / itemsPerPage);
    if (currentPage > maxValidPage && maxValidPage > 0) {
      setCurrentPage(maxValidPage);
    }
  }, [vehiclesData.length, itemsPerPage, currentPage]);

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case 'EN RUTA': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'CARGANDO': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'DISPONIBLE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'TALLER': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getGpsStatusIcon = (semaforoAntena) => {
    const color = semaforoAntena === 1 ? '#10B981' : semaforoAntena === 0 ? '#DC2626' : '#6B7280';
    return <Radio className="h-4 w-4" style={{ color }} />;
  };

  const getEngineStatusIcon = (ignicion) => {
    const color = ignicion === 1 ? '#10B981' : ignicion === 0 ? '#DC2626' : '#6B7280';
    return <Zap className="h-4 w-4" style={{ color }} />;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (diasStatus) => {
    if (!diasStatus || diasStatus.trim() === '') return 'N/A';
    return diasStatus.replace(/d/g, 'd ').replace(/h/g, 'h ').replace(/min/g, 'min').trim();
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (isLoading && vehiclesData.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Cargando vehículos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (vehiclesData.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-400">No se encontraron vehículos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vehicle Cards */}
      <div className="space-y-3">
        {currentData.map((vehicle, index) => (
          <div 
            key={`${vehicle.tractoNumEco}-${index}`}
            className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              
              {/* Left Section - Unit Info */}
              <div className="lg:col-span-3">
                <div className="space-y-3">
                  {/* Tractor Section */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded font-medium">
                        TRACTO
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded font-bold">
                        {vehicle.tractoNumEco}
                      </span>
                    </div>
                    
                    {/* Status Indicators */}
                    <div className="flex items-center space-x-2">
                      <div title={`GPS: ${vehicle.semaforoAntena === 1 ? 'Activo' : vehicle.semaforoAntena === 0 ? 'Sin señal' : 'Sin información'}`}>
                        {getGpsStatusIcon(vehicle.semaforoAntena)}
                      </div>
                      <div title={`Motor: ${vehicle.ignicion === 1 ? 'Encendido' : vehicle.ignicion === 0 ? 'Apagado' : 'Sin información'}`}>
                        {getEngineStatusIcon(vehicle.ignicion)}
                      </div>
                    </div>
                  </div>
                
                  {/* Remolques Section */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded font-medium">
                      REMOLQUES
                    </span>
                    <div className="flex items-center space-x-2">
                      {vehicle.remNe1 && (
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded font-bold">
                          {vehicle.remNe1}
                        </span>
                      )}
                      {vehicle.remNe2 && (
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded font-bold">
                          {vehicle.remNe2}
                        </span>
                      )}
                      {!vehicle.remNe1 && !vehicle.remNe2 && (
                        <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded">
                          Sin remolques
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="lg:col-span-2">
                <div className="space-y-1">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(vehicle.statusDescrip)}`}>
                    {vehicle.statusDescrip}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatDuration(vehicle.diasStatus)}
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="lg:col-span-3">
                <div className="space-y-1">
                  <div className="flex items-start space-x-1">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-white font-medium leading-tight">
                      {vehicle.posicion || 'Ubicación no disponible'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-5">
                    {formatDateTime(vehicle.fechaPosicion)}
                  </div>
                </div>
              </div>

              {/* Terminals Section */}
              <div className="lg:col-span-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Origen:</span>
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded font-bold">
                      {vehicle.terminalDespacho || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Destino:</span>
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded font-bold">
                      {vehicle.terminalDestino || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section - Operator & Business */}
              <div className="lg:col-span-2">
                <div className="space-y-2">
                  {/* Operator */}
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white font-medium truncate">
                      {vehicle.operadorNombre || 'Sin asignar'}
                    </span>
                  </div>
                  
                  {/* Client */}
                  <div className="flex items-center space-x-1">
                    <Building className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={vehicle.clienteNombre}>
                      {vehicle.clienteNombre || 'Sin cliente'}
                    </span>
                  </div>
                  
                  {/* Business Line & Circuit */}
                  <div className="flex space-x-1">
                    <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded">
                      {vehicle.negocioClave || 'N/A'}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded">
                      {vehicle.circuitoClave || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando {startIndex + 1} a {Math.min(endIndex, vehiclesData.length)} de {vehiclesData.length} vehículos
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-[#3C3C48] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                  disabled={pageNum === '...' || pageNum === currentPage}
                  className={`px-3 py-1 text-sm border border-gray-300 dark:border-[#3C3C48] rounded-md transition-colors ${
                    pageNum === currentPage
                      ? 'text-white'
                      : pageNum === '...'
                      ? 'cursor-default'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  style={pageNum === currentPage ? { backgroundColor: primaryColor } : {}}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-[#3C3C48] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-50">
          <div className="text-center">
            <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Actualizando datos...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTable;