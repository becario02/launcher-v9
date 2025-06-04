'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Import, Upload, Search, ChevronLeft, ChevronRight, FileText, CheckCircle, XCircle, Building, Eye, Files, Edit, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import Toast from '@/components/Toast';

// Importar los modales
import IntegratorFormModal from '@/components/IntegratorFormModal';
import IntegratorCompaniesModal from '@/components/IntegratorCompaniesModal';
import EditIntegratorModal from '@/components/EditIntegratorModal';
import CreateIntegratorModal from '@/components/CreateIntegratorModal';

export default function AdminIntegradoresPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [companiesModalOpen, setCompaniesModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedIntegrator, setSelectedIntegrator] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({}); // Para manejar loading individual de switches

  // Estados para la tabla de integradores
  const [integradores, setIntegradores] = useState([]);
  const [filteredIntegradores, setFilteredIntegradores] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Estado para notificaciones
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  // Cargar integradores al montar el componente
  useEffect(() => {
    fetchIntegradores();
  }, []);

  // Aplicar filtros cuando cambien los estados de búsqueda
  useEffect(() => {
    let filtered = [...integradores];

    // Filtrar por búsqueda
    if (search.trim()) {
      filtered = filtered.filter(integrador =>
        integrador.name.toLowerCase().includes(search.toLowerCase()) ||
        integrador.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(integrador => integrador.status === statusFilter);
    }

    setFilteredIntegradores(filtered);
    setPage(1); // Resetear a la primera página
  }, [integradores, search, statusFilter]);

  // Función para cargar integradores
  const fetchIntegradores = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5173/mslauncher/api/v1/integrator?includeInactive=true', {
        headers: {
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          setIntegradores(result.data);
          setFilteredIntegradores(result.data);
        }
      } else {
        console.error('Error al cargar integradores:', response.statusText);
        setToast({
          visible: true,
          message: 'Error al cargar los integradores',
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

  // Función para abrir el modal del integrador
  const handleCargar = () => {
    setModalOpen(true);
  };

  // Función para abrir el modal de crear integrador
  const handleCreateIntegrator = () => {
    setCreateModalOpen(true);
  };

  // Función para cerrar el modal del integrador
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Función para cerrar el modal de crear
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  // Función para procesar el formulario del integrador
  const handleSubmitIntegrator = async (result) => {
    // Mostrar toast con el resultado real del proceso
    setToast({
      visible: true,
      message: result.message || (result.success ? 'Archivo procesado exitosamente' : 'Error al procesar archivo'),
      type: result.success ? 'success' : 'error'
    });
    
    if (!result.success) {
      handleCloseModal();
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearch('');
  };

  // Cerrar toast
  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Función para cambiar el estado del integrador
  const handleStatusChange = async (integradorId, newStatus) => {
    // Marcar este integrador como "actualizando"
    setUpdatingStatus(prev => ({ ...prev, [integradorId]: true }));

    try {
      const response = await fetch(`http://localhost:5173/mslauncher/api/v1/integrator/${integradorId}/status`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.statusCode === "200") {
          // Actualizar el estado local
          setIntegradores(prev => 
            prev.map(integrador => 
              integrador.idIntegrator === integradorId 
                ? { ...integrador, status: newStatus }
                : integrador
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
      // Quitar el loading de este integrador
      setUpdatingStatus(prev => ({ ...prev, [integradorId]: false }));
    }
  };

  // Función para ver las compañías del integrador
  const handleViewCompanies = async (integrador) => {
    setSelectedIntegrator(integrador);
    setCompaniesModalOpen(true);
  };

  // Función para cerrar el modal de compañías
  const handleCloseCompaniesModal = () => {
    setCompaniesModalOpen(false);
    setSelectedIntegrator(null);
  };

  // Función para abrir el modal de editar
  const handleEditIntegrator = (integrador) => {
    setSelectedIntegrator(integrador);
    setEditModalOpen(true);
  };

  // Función para cerrar el modal de editar
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedIntegrator(null);
  };

  // Función para manejar el éxito al crear integrador
  const handleCreateSuccess = (result) => {
    if (result.success) {
      // Recargar la lista de integradores para incluir el nuevo
      fetchIntegradores();
    }

    setToast({
      visible: true,
      message: result.message,
      type: result.success ? 'success' : 'error'
    });
  };

  // Función para manejar el éxito al editar integrador
  const handleEditSuccess = (result) => {
    if (result.success) {
      // Actualizar el integrador en la lista local
      setIntegradores(prev => 
        prev.map(integrador => 
          integrador.idIntegrator === result.data.idIntegrator 
            ? { ...integrador, ...result.data }
            : integrador
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

  // Función para ver archivos cargados
  const handleViewFiles = (integrador) => {
    // Redirigir a la página de archivos del integrador
    window.location.href = `/admin/integradores/${integrador.idIntegrator}/archivos`;
  };

  // Paginación
  const totalPages = Math.ceil(filteredIntegradores.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentIntegradores = filteredIntegradores.slice(startIndex, endIndex);

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="text-center py-20">
      <Import className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {search || statusFilter !== 'all' 
          ? 'No se encontraron integradores que coincidan con los filtros'
          : 'No hay integradores disponibles'
        }
      </h3>
      <p className="text-gray-500 dark:text-gray-500 mb-4">
        {search || statusFilter !== 'all'
          ? 'Intenta ajustar los filtros de búsqueda'
          : 'Los integradores configurados aparecerán aquí'
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
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
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
                    <Import className="w-6 h-6 text-primary" />
                    <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                      Integrador de Cargas
                    </h1>
                  </div>
                  <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                    Procesa archivos estructurados y genera órdenes de servicio.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-100 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-colors"
                    onClick={handleCreateIntegrator}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4" />
                    Crear Integrador
                  </button>
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                    onClick={handleCargar}
                    disabled={isLoading}
                  >
                    <Upload className="w-4 h-4" />
                    Cargar Archivo
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
                      placeholder="Buscar por nombre o descripción..."
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

            {/* Tabla de integradores */}
            <div className="rounded-lg border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24] overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    {['Nombre', 'Descripción', 'Tipos de Archivo', 'Estado', 'Acciones'].map((label, i) => (
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
                  ) : currentIntegradores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4">
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    currentIntegradores.map(integrador => {
                      const isUpdating = updatingStatus[integrador.idIntegrator];
                      
                      return (
                        <tr key={integrador.idIntegrator} className="hover:bg-gray-50 dark:hover:bg-[#262636] transition">
                          <td className="px-6 py-4 font-medium">{integrador.name}</td>
                          <td className="px-6 py-4">{integrador.description}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {integrador.uploadFileTypes}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="relative">
                                <button
                                  onClick={() => handleStatusChange(
                                    integrador.idIntegrator, 
                                    integrador.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                  )}
                                  className={clsx(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800",
                                    integrador.status === 'ACTIVE'
                                      ? "focus:ring-primary"
                                      : "bg-gray-300 dark:bg-gray-600 focus:ring-gray-300",
                                    isUpdating && "opacity-70"
                                  )}
                                  style={integrador.status === 'ACTIVE' ? { backgroundColor: primaryColor } : {}}
                                  disabled={isLoading || isUpdating}
                                >
                                  <span
                                    className={clsx(
                                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                      integrador.status === 'ACTIVE' ? "translate-x-6" : "translate-x-1"
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
                                integrador.status === 'ACTIVE' 
                                  ? "" 
                                  : "text-gray-500 dark:text-gray-400",
                                isUpdating && "opacity-70"
                              )}
                              style={integrador.status === 'ACTIVE' ? { color: primaryColor } : {}}>
                                {isUpdating 
                                  ? 'Actualizando...'
                                  : integrador.status === 'ACTIVE' 
                                    ? 'Activo' 
                                    : 'Inactivo'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditIntegrator(integrador)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                title="Editar integrador"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Editar</span>
                              </button>
                              <button
                                onClick={() => handleViewCompanies(integrador)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                              >
                                <Building className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Compañías</span>
                              </button>
                              <button
                                onClick={() => handleViewFiles(integrador)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                              >
                                <Files className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Archivos</span>
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
              {filteredIntegradores.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-[#2C2C38] gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {Math.min(startIndex + 1, filteredIntegradores.length)} - {Math.min(endIndex, filteredIntegradores.length)} de {filteredIntegradores.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1 || isLoading}
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      className={clsx(
                        "inline-flex items-center px-3 py-1.5 rounded text-sm text-gray-700 dark:text-gray-200",
                        "transition focus:outline-none",
                        page === 1 || isLoading
                          ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#2C2C38]"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48]"
                      )}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </button>
                    <button
                      disabled={page >= totalPages || isLoading}
                      onClick={() => setPage(prev => prev + 1)}
                      className={clsx(
                        "inline-flex items-center px-3 py-1.5 rounded text-sm text-gray-700 dark:text-gray-200",
                        "transition focus:outline-none",
                        page >= totalPages || isLoading
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

        {/* Modal del Integrador */}
        <IntegratorFormModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitIntegrator}
        />

        {/* Modal de Compañías del Integrador */}
        <IntegratorCompaniesModal
          isOpen={companiesModalOpen}
          onClose={handleCloseCompaniesModal}
          integrator={selectedIntegrator}
          onSuccess={handleCompaniesSuccess}
        />

        {/* Modal de Editar Integrador */}
        <EditIntegratorModal
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          integrator={selectedIntegrator}
          onSuccess={handleEditSuccess}
        />

        {/* Modal de Crear Integrador */}
        <CreateIntegratorModal
          isOpen={createModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleCreateSuccess}
        />

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