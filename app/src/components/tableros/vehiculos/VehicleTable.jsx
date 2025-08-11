import React, { useState } from 'react';
import { Truck, Radio, Zap, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';

const VehicleTable = ({ vehiclesData, itemsPerPage, isLoading = false }) => {
  const { primaryColor } = usePrimaryColor();
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const totalPages = Math.ceil(vehiclesData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = vehiclesData.slice(startIndex, endIndex);

  // Reset to first page when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [vehiclesData, itemsPerPage]);

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
    <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 dark:bg-[#2C2C38] border-b border-gray-200 dark:border-[#3C3C48]">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          <div className="col-span-2">Unidad</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2">Ubicación</div>
          <div className="col-span-1">Tiempo</div>
          <div className="col-span-1">Terminales</div>
          <div className="col-span-2">Operador</div>
          <div className="col-span-1">Cliente</div>
          <div className="col-span-1">Negocio</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200 dark:divide-[#2C2C38]">
        {currentData.map((vehicle, index) => (
          <div 
            key={`${vehicle.tractoNumEco}-${index}`}
            className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-[#2C2C38] transition-colors"
          >
            {/* Unidad Column */}
            <div className="col-span-2">
              <div className="flex flex-col space-y-2">
                {/* Tractor */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded text-[10px] leading-tight">
                      {vehicle.tractoNumEco}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <div title={`GPS: ${vehicle.semaforoAntena === 1 ? 'Activo' : vehicle.semaforoAntena === 0 ? 'Sin señal' : 'Sin información'}`}>
                      {getGpsStatusIcon(vehicle.semaforoAntena)}
                    </div>
                    <div title={`Motor: ${vehicle.ignicion === 1 ? 'Encendido' : vehicle.ignicion === 0 ? 'Apagado' : 'Sin información'}`}>
                      {getEngineStatusIcon(vehicle.ignicion)}
                    </div>
                  </div>
                </div>
                
                {/* Remolques */}
                <div className="flex flex-wrap gap-1">
                  {vehicle.remNe1 && (
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[8px] leading-none">
                          {vehicle.remNe1}
                        </span>
                      </div>
                    </div>
                  )}
                  {vehicle.remNe2 && (
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[8px] leading-none">
                          {vehicle.remNe2}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Estado Column */}
            <div className="col-span-2">
              <div className="flex flex-col space-y-1">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.statusDescrip)}`}>
                  {vehicle.statusDescrip}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDuration(vehicle.diasStatus)}
                </span>
              </div>
            </div>

            {/* Ubicación Column */}
            <div className="col-span-2">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-900 dark:text-white font-medium truncate" title={vehicle.posicion}>
                  {vehicle.posicion || 'N/A'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(vehicle.fechaPosicion)}
                </span>
              </div>
            </div>

            {/* Tiempo Column */}
            <div className="col-span-1">
              <div className="text-sm text-gray-900 dark:text-white">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {vehicle.fechaPosicion ? (
                    <span title={formatDateTime(vehicle.fechaPosicion)}>
                      {new Date(vehicle.fechaPosicion).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  ) : 'N/A'}
                </div>
              </div>
            </div>

            {/* Terminales Column */}
            <div className="col-span-1">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-1">
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-1 py-0.5 rounded">
                    {vehicle.terminalDespacho || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-1 py-0.5 rounded">
                    {vehicle.terminalDestino || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Operador Column */}
            <div className="col-span-2">
              <div className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">
                  {vehicle.operadorNombre || 'Sin asignar'}
                </span>
              </div>
            </div>

            {/* Cliente Column */}
            <div className="col-span-1">
              <div className="text-sm text-gray-900 dark:text-white truncate" title={vehicle.clienteNombre}>
                {vehicle.clienteNombre || 'N/A'}
              </div>
            </div>

            {/* Negocio Column */}
            <div className="col-span-1">
              <div className="flex flex-col space-y-1">
                <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-1 py-0.5 rounded text-center">
                  {vehicle.negocioClave || 'N/A'}
                </span>
                <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 px-1 py-0.5 rounded text-center">
                  {vehicle.circuitoClave || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 dark:bg-[#2C2C38] px-4 py-3 border-t border-gray-200 dark:border-[#3C3C48]">
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
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center">
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