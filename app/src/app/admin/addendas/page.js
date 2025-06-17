'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { FileText, Upload, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Eye, Edit, Plus, Code, Building } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import Toast from '@/components/Toast';

// Importar los modales
import CreateAddendaModal from '@/components/CreateAddendaModal';
import EditAddendaModal from '@/components/EditAddendaModal';
import AddendaCompaniesModal from '@/components/AddendaCompaniesModal';
import ViewAddendaModal from '@/components/ViewAddendaModal';

export default function AdminAddendasPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [companiesModalOpen, setCompaniesModalOpen] = useState(false);
  const [selectedAddenda, setSelectedAddenda] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({}); // Para manejar loading individual de switches

  // Estados para la tabla de addendas
  const [addendas, setAddendas] = useState([]);
  const [filteredAddendas, setFilteredAddendas] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  // Estado para notificaciones
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  // Cargar addendas al montar el componente
  useEffect(() => {
    fetchAddendas();
  }, []);

  // Aplicar filtros cuando cambien los estados de búsqueda (solo para filtros locales)
  useEffect(() => {
    // Si usamos paginación del servidor, los filtros se manejan en fetchAddendas
    // Este useEffect se puede usar para filtros adicionales del lado cliente si es necesario
  }, [search, statusFilter, page]);

  // Función para cargar addendas
  const fetchAddendas = async () => {
    setIsLoading(true);
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        Page: page.toString(),
        PageSize: pageSize.toString()
      });

      // Agregar filtros opcionales
      if (search.trim()) {
        params.append('Search', search.trim());
      }
      
      if (statusFilter !== 'all') {
        params.append('Status', statusFilter);
      }

      const response = await fetch(`/api/addenda?${params.toString()}`, {
        headers: {
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          setAddendas(result.data);
          setFilteredAddendas(result.data);
          
          // Actualizar información de paginación
          if (result.pagination) {
            setPagination(result.pagination);
          }
        }
      } else {
        console.error('Error al cargar addendas:', response.statusText);
        setToast({
          visible: true,
          message: 'Error al cargar las addendas',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
      setToast({
        visible: true,
        message: 'Error de conexión con la API',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Recargar addendas cuando cambien los filtros o la página
  useEffect(() => {
    fetchAddendas();
  }, [search, statusFilter, page]);

  // Función para abrir el modal de crear addenda
  const handleCreateAddenda = () => {
    setCreateModalOpen(true);
  };

  // Función para cerrar el modal de crear
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearch('');
  };

  // Cerrar toast
  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Función para cambiar el estado de la addenda
  const handleStatusChange = async (addendaId, newStatus) => {
    // Marcar esta addenda como "actualizando"
    setUpdatingStatus(prev => ({ ...prev, [addendaId]: true }));

    try {
      const response = await fetch('/api/addenda/status', {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idAddenda: addendaId,
          status: newStatus
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.statusCode === "200") {
          // Actualizar el estado local
          setAddendas(prev => 
            prev.map(addenda => 
              addenda.idAddenda === addendaId 
                ? { ...addenda, status: newStatus }
                : addenda
            )
          );

          setToast({
            visible: true,
            message: result.message || `Estado actualizado a ${newStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}`,
            type: 'success'
          });
        } else {
          throw new Error(result.message || 'Error en la respuesta del servidor');
        }
      } else {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setToast({
        visible: true,
        message: `Error al actualizar el estado: ${error.message}`,
        type: 'error'
      });
    } finally {
      // Quitar el loading de esta addenda
      setUpdatingStatus(prev => ({ ...prev, [addendaId]: false }));
    }
  };

  // Función para abrir el modal de editar
  const handleEditAddenda = (addenda) => {
    setSelectedAddenda(addenda);
    setEditModalOpen(true);
  };

  // Función para cerrar el modal de editar
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedAddenda(null);
  };

  // Función para ver los detalles de la addenda
  const handleViewAddenda = (addenda) => {
    setSelectedAddenda(addenda);
    setViewModalOpen(true);
  };

  // Función para cerrar el modal de ver
  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedAddenda(null);
  };

  // Función para ver las compañías de la addenda
  const handleViewCompanies = async (addenda) => {
    setSelectedAddenda(addenda);
    setCompaniesModalOpen(true);
  };

  // Función para cerrar el modal de compañías
  const handleCloseCompaniesModal = () => {
    setCompaniesModalOpen(false);
    setSelectedAddenda(null);
  };

  // Función para manejar el éxito al crear addenda
  const handleCreateSuccess = (result) => {
    if (result.success) {
      // Recargar la lista de addendas para incluir la nueva
      fetchAddendas();
    }

    setToast({
      visible: true,
      message: result.message,
      type: result.success ? 'success' : 'error'
    });
  };

  // Función para manejar el éxito al editar addenda
  const handleEditSuccess = (result) => {
    if (result.success) {
      // Actualizar la addenda en la lista local
      setAddendas(prev => 
        prev.map(addenda => 
          addenda.idAddenda === result.data.idAddenda 
            ? { ...addenda, ...result.data }
            : addenda
        )
      );
    }

    setToast({
      visible: true,
      message: result.message,
      type: result.success ? 'success' : 'error'
    });
  };

  // Función para manejar el éxito al actualizar compañías
  const handleCompaniesSuccess = (result) => {
    setToast({
      visible: true,
      message: result.message,
      type: result.type
    });
  };

  // Paginación usando los datos del servidor
  const totalPages = pagination.totalPages;
  const currentAddendas = addendas; // Ya vienen paginadas del servidor

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="text-center py-20">
      <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {search || statusFilter !== 'all' 
          ? 'No se encontraron addendas que coincidan con los filtros'
          : 'No hay addendas disponibles'
        }
      </h3>
      <p className="text-gray-500 dark:text-gray-500 mb-4">
        {search || statusFilter !== 'all'
          ? 'Intenta ajustar los filtros de búsqueda'
          : 'Las addendas configuradas aparecerán aquí'
        }
      </p>
    </div>
  );

  // Componente de Skeleton para la tabla
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex font-poppins">
      {/* Sidebar - Fixed on desktop */}
      <div className="hidden md:block fixed z-10 h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 w-full md:pl-60">
        {/* Navbar */}
        <Navbar className="sticky top-0 z-30" onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content */}
        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14 px-4 md:px-8 xl:px-10 w-full">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                      Generador de Addendas
                    </h1>
                  </div>
                  <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                    Gestiona las addendas y sus estructuras XML para diferentes tipos de documentos.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-100 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-colors"
                    onClick={handleCreateAddenda}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4" />
                    Crear Addenda
                  </button>
                </div>
              </div>

              {/* Buscador y filtros */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-grow">
                  <div className="relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar addendas..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                    />
                    {search && (
                      <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="ACTIVE">Activos</option>
                    <option value="INACTIVE">Inactivos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla de addendas */}
            <div className="rounded-lg border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24] overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    {['Nombre', 'Estado', 'Estructuras', 'Acciones'].map((label, i) => (
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
                  ) : currentAddendas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4">
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    currentAddendas.map(addenda => {
                      const isUpdating = updatingStatus[addenda.idAddenda];
                      
                      return (
                        <tr key={addenda.idAddenda} className="hover:bg-gray-50 dark:hover:bg-[#262636] transition">
                          <td className="px-6 py-4 font-medium">{addenda.name}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="relative">
                                <button
                                  onClick={() => handleStatusChange(
                                    addenda.idAddenda, 
                                    addenda.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                  )}
                                  className={clsx(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800",
                                    addenda.status === 'ACTIVE'
                                      ? "focus:ring-primary"
                                      : "bg-gray-300 dark:bg-gray-600 focus:ring-gray-300",
                                    isUpdating && "opacity-70"
                                  )}
                                  style={addenda.status === 'ACTIVE' ? { backgroundColor: primaryColor } : {}}
                                  disabled={isLoading || isUpdating}
                                >
                                  <span
                                    className={clsx(
                                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                      addenda.status === 'ACTIVE' ? "translate-x-6" : "translate-x-1"
                                    )}
                                  />
                                </button>
                                
                                {/* Spinner de loading */}
                                {isUpdating && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                )}
                              </div>
                              
                              <span className={clsx(
                                "ml-3 text-sm font-medium transition-colors",
                                addenda.status === 'ACTIVE' 
                                  ? "" 
                                  : "text-gray-500 dark:text-gray-400",
                                isUpdating && "opacity-70"
                              )}
                              style={addenda.status === 'ACTIVE' ? { color: primaryColor } : {}}>
                                {isUpdating 
                                  ? 'Actualizando...'
                                  : addenda.status === 'ACTIVE' 
                                    ? 'Activo' 
                                    : 'Inactivo'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {addenda.structureTravel && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium">
                                  <Code className="w-3 h-3" />
                                  Viaje
                                </span>
                              )}
                              {addenda.structureAdditionalInvoice && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium">
                                  <Code className="w-3 h-3" />
                                  Factura Adicional
                                </span>
                              )}
                              {addenda.structureCreditNote && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs font-medium">
                                  <Code className="w-3 h-3" />
                                  Nota de Crédito
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewAddenda(addenda)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Ver</span>
                              </button>
                              <button
                                onClick={() => handleEditAddenda(addenda)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                title="Editar addenda"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Editar</span>
                              </button>
                              <button
                                onClick={() => handleViewCompanies(addenda)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                                title="Gestionar compañías"
                              >
                                <Building className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Compañías</span>
                              </button>
                            </div>
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
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
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
                      onClick={() => setPage(prev => prev + 1)}
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
          </div>
        </main>

        {/* Modales */}
        <CreateAddendaModal
          isOpen={createModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleCreateSuccess}
        />

        <EditAddendaModal
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          addenda={selectedAddenda}
          onSuccess={handleEditSuccess}
        />

        <AddendaCompaniesModal
          isOpen={companiesModalOpen}
          onClose={handleCloseCompaniesModal}
          addenda={selectedAddenda}
          onSuccess={handleCompaniesSuccess}
        />

        <ViewAddendaModal
          isOpen={viewModalOpen}
          onClose={handleCloseViewModal}
          addenda={selectedAddenda}
        />

        {/* Próximos modales - Descomentar cuando estén creados */}
        {/*
        
        */}

        {/* Toast */}
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={handleCloseToast}
          />
        )}
      </div>
    </div>
  );
}