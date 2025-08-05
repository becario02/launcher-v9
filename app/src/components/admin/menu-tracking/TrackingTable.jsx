import React from 'react';
import clsx from 'clsx';
import { Activity, User, Calendar, MousePointer, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';

const TrackingTable = ({ 
  data = [], 
  isLoading = false, 
  pagination = { page: 1, pageSize: 15, totalItems: 0, totalPages: 1 },
  onPageChange = () => {},
  pageSize = 15
}) => {
  const { primaryColor } = usePrimaryColor();

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="text-center py-20">
      <Activity className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        No se encontraron registros de tracking
      </h3>
      <p className="text-gray-500 dark:text-gray-500 mb-4">
        Los accesos a menús aparecerán aquí cuando haya actividad
      </p>
    </div>
  );

  // Componente de Skeleton para la tabla
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </td>
    </tr>
  );

  // Funciones de paginación
  const handlePrevPage = () => {
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      onPageChange(pagination.page + 1);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24] overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
          <tr>
            {['ID Usuario', 'Custom Option', 'ID Menú', 'Última Fecha', 'IP', 'Contador Clics', 'ID Tracking'].map((label, i) => (
              <th key={i} className="px-6 py-4 whitespace-nowrap">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-[#2C2C38] text-gray-800 dark:text-gray-200">
          {isLoading ? (
            <>
              {[...Array(pageSize)].map((_, index) => (
                <TableRowSkeleton key={index} />
              ))}
            </>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-4">
                <EmptyState />
              </td>
            </tr>
          ) : (
            data.map(item => {
              const dateInfo = formatDate(item.lastClickDate);
              
              return (
                <tr key={item.idMenuTracking} className="hover:bg-gray-50 dark:hover:bg-[#262636] transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{item.idUser}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.userName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.idCustomOption > 0 ? (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{item.idCustomOption}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.customOptionName}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.idMenu > 0 ? (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{item.idMenu}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.menuName}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{dateInfo.date}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{dateInfo.time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {item.ipName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-semibold" style={{ color: primaryColor }}>
                        {item.clickCounter}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {item.idMenuTracking}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Paginación */}
      {pagination.totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-[#2C2C38] gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} de {pagination.totalItems}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page === 1 || isLoading}
              onClick={handlePrevPage}
              className={clsx(
                "inline-flex items-center px-3 py-1.5 rounded text-sm text-gray-700 dark:text-gray-200",
                "transition focus:outline-none",
                pagination.page === 1 || isLoading
                  ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#2C2C38]"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48]"
              )}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={handleNextPage}
              className={clsx(
                "inline-flex items-center px-3 py-1.5 rounded text-sm text-gray-700 dark:text-gray-200",
                "transition focus:outline-none",
                pagination.page >= pagination.totalPages || isLoading
                  ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#2C2C38]"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48]"
              )}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingTable;