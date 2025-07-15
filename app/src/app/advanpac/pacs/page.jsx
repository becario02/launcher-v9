'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Shield, Search, ChevronLeft, ChevronRight, XCircle, Building, Plus, User, Key, Clock, Edit } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import Toast from '@/components/Toast';
import StatusConfirmModal from '@/components/advanpac/pacs/StatusConfirmModal';
import AddPacModal from '@/components/advanpac/pacs/AddPacModal';
import EditPacModal from '@/components/advanpac/pacs/EditPacModal';

export default function AdvanPacPacsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Estados para la tabla de PACs
  const [pacs, setPacs] = useState([]);
  const [filteredPacs, setFilteredPacs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Estado para notificaciones
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  // Estado para modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    pac: null,
    newStatus: null
  });

  // Estado para modal de agregar PAC
  const [addPacModalOpen, setAddPacModalOpen] = useState(false);

  // Estado para modal de editar PAC
  const [editPacModal, setEditPacModal] = useState({
    isOpen: false,
    pac: null
  });

  // Cargar PACs al montar el componente
  useEffect(() => {
    fetchPacs();
  }, [pagination.page, search, statusFilter]);

  // Función para cargar PACs desde la API
  const fetchPacs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://10.50.77.181:83/msadvan_pac/api/v1/pacprovider');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Aplicar filtros del lado del cliente
      let filteredData = [...data];
      
      // Aplicar filtro de búsqueda
      if (search.trim()) {
        filteredData = filteredData.filter(pac => 
          pac.name.toLowerCase().includes(search.toLowerCase()) ||
          pac.user.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Aplicar filtro de estado
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter(pac => pac.status === statusFilter);
      }
      
      setPacs(data); // Guardamos todos los datos originales
      setFilteredPacs(filteredData); // Guardamos los datos filtrados
      
      setPagination(prev => ({
        ...prev,
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / prev.pageSize)
      }));
      
    } catch (error) {
      console.error('Error al conectar con la API:', error);
      setToast({
        visible: true,
        message: 'Error de conexión con la API',
        type: 'error'
      });
      
      // En caso de error, limpiar los datos
      setPacs([]);
      setFilteredPacs([]);
      setPagination(prev => ({
        ...prev,
        totalItems: 0,
        totalPages: 0
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearch('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Función para manejar cambio de página
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Función para manejar cambio de búsqueda con debounce
  const handleSearchChange = (value) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Función para manejar cambio de filtro de estado
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Cerrar toast
  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Función para mostrar modal de confirmación de cambio de estado
  const handleStatusChangeRequest = (pac, newStatus) => {
    setConfirmModal({
      isOpen: true,
      pac: pac,
      newStatus: newStatus
    });
  };

  // Función para cerrar modal de confirmación
  const handleCloseConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      pac: null,
      newStatus: null
    });
  };

  // Función para cambiar el estado del PAC
  const handleStatusChange = async (pacId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [pacId]: true }));

    try {
      // TODO: Implementar llamada a la API para cambiar estado
      // const response = await fetch(`http://10.50.77.181:83/msadvan_pac/api/v1/pacprovider/${pacId}/status`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // Por ahora simular la actualización
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar el estado local
      setPacs(prev => 
        prev.map(pac => 
          pac.idProvider === pacId 
            ? { ...pac, status: newStatus }
            : pac
        )
      );

      setFilteredPacs(prev => 
        prev.map(pac => 
          pac.idProvider === pacId 
            ? { ...pac, status: newStatus }
            : pac
        )
      );

      setToast({
        visible: true,
        message: `Estado del PAC actualizado a ${newStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}`,
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setToast({
        visible: true,
        message: `Error al actualizar el estado: ${error.message}`,
        type: 'error'
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [pacId]: false }));
    }
  };

  // Función para abrir modal de crear PAC
  const handleOpenAddPacModal = () => {
    setAddPacModalOpen(true);
  };

  // Función para cerrar modal de crear PAC
  const handleCloseAddPacModal = () => {
    setAddPacModalOpen(false);
  };

  // Función para manejar submit del modal de PAC
  const handleAddPacSubmit = (result) => {
    if (result.success) {
      setToast({
        visible: true,
        message: result.message,
        type: 'success'
      });
      
      // Recargar la lista de PACs
      fetchPacs();
    } else {
      setToast({
        visible: true,
        message: result.message || 'Error al crear el PAC',
        type: 'error'
      });
    }
  };

  // Función para abrir modal de editar PAC
  const handleOpenEditPacModal = (pac) => {
    setEditPacModal({
      isOpen: true,
      pac: pac
    });
  };

  // Función para cerrar modal de editar PAC
  const handleCloseEditPacModal = () => {
    setEditPacModal({
      isOpen: false,
      pac: null
    });
  };

  // Función para manejar submit del modal de editar PAC
  const handleEditPacSubmit = (result) => {
    if (result.success) {
      setToast({
        visible: true,
        message: result.message,
        type: 'success'
      });
      
      // Recargar la lista de PACs
      fetchPacs();
    } else {
      setToast({
        visible: true,
        message: result.message || 'Error al actualizar el PAC',
        type: 'error'
      });
    }
  };

  // Función para marcar/desmarcar PAC como primario
  const handlePrimaryPacToggle = async (pacId) => {
    setUpdatingStatus(prev => ({ ...prev, [`primary_${pacId}`]: true }));

    try {
      // TODO: Implementar llamada a la API para cambiar PAC primario
      // const response = await fetch(`http://10.50.77.181:83/msadvan_pac/api/v1/pacprovider/${pacId}/primary`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ isPrimary: true })
      // });
      
      // Por ahora simular la actualización
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar el estado local - solo un PAC puede ser primario
      setPacs(prev => 
        prev.map(pac => ({
          ...pac,
          primaryPac: pac.idProvider === pacId ? pac.idProvider : (pac.primaryPac === pac.idProvider ? 0 : pac.primaryPac)
        }))
      );

      setFilteredPacs(prev => 
        prev.map(pac => ({
          ...pac,
          primaryPac: pac.idProvider === pacId ? pac.idProvider : (pac.primaryPac === pac.idProvider ? 0 : pac.primaryPac)
        }))
      );

      setToast({
        visible: true,
        message: 'PAC primario actualizado correctamente',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error al cambiar PAC primario:', error);
      setToast({
        visible: true,
        message: 'Error al actualizar el PAC primario',
        type: 'error'
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [`primary_${pacId}`]: false }));
    }
  };

  // Paginación
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = Math.min(startIndex + pagination.pageSize, pagination.totalItems);
  const currentPacs = filteredPacs.slice(startIndex, startIndex + pagination.pageSize);

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="text-center py-20">
      <Shield className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {search || statusFilter !== 'all' 
          ? 'No se encontraron PACs que coincidan con los filtros'
          : 'No hay PACs disponibles'
        }
      </h3>
      <p className="text-gray-500 dark:text-gray-500 mb-4">
        {search || statusFilter !== 'all'
          ? 'Intenta ajustar los filtros de búsqueda'
          : 'Los PACs registrados aparecerán aquí'
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
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
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
                    <Shield className="w-6 h-6 text-primary" />
                    <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                      Gestión de PACs
                    </h1>
                  </div>
                  <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                    Administración de Proveedores Autorizados de Certificación.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                    onClick={handleOpenAddPacModal}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4" />
                    Agregar PAC
                  </button>
                </div>
              </div>

              {/* Buscador y filtros */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-col sm:flex-row lg:flex-row gap-4 flex-grow">
                  <div className="relative w-full sm:max-w-md lg:max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar por nombre o usuario..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
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
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="ACTIVE">Activos</option>
                    <option value="INACTIVE">Inactivos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla de PACs */}
            <div className="rounded-lg border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24] overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    {['Nombre', 'Usuario', 'Contraseña', 'Contrato', 'Estado', 'PAC Primario', 'Acciones'].map((label, i) => (
                      <th key={i} className="px-6 py-4 whitespace-nowrap">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2C2C38] text-gray-800 dark:text-gray-200">
                  {isLoading ? (
                    <>
                      {[...Array(pagination.pageSize)].map((_, index) => (
                        <TableRowSkeleton key={index} />
                      ))}
                    </>
                  ) : currentPacs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4">
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    currentPacs.map(pac => {
                      const isUpdating = updatingStatus[pac.idProvider];
                      const isPrimaryUpdating = updatingStatus[`primary_${pac.idProvider}`];
                      
                      return (
                        <tr key={pac.idProvider} className="hover:bg-gray-50 dark:hover:bg-[#262636] transition">
                          <td className="px-6 py-4 font-medium">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span className="truncate">{pac.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-mono text-gray-600 dark:text-gray-400 truncate max-w-xs">
                                {pac.user}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Key className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                                {pac.password}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {pac.contract ? (
                              <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                {pac.contract}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-sm">
                                Sin contrato
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="relative">
                                <button
                                  onClick={() => handleStatusChangeRequest(
                                    pac, 
                                    pac.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                  )}
                                  className={clsx(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800",
                                    pac.status === 'ACTIVE'
                                      ? "focus:ring-primary"
                                      : "bg-gray-300 dark:bg-gray-600 focus:ring-gray-300",
                                    isUpdating && "opacity-70"
                                  )}
                                  style={pac.status === 'ACTIVE' ? { backgroundColor: primaryColor } : {}}
                                  disabled={isLoading || isUpdating}
                                >
                                  <span
                                    className={clsx(
                                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                      pac.status === 'ACTIVE' ? "translate-x-6" : "translate-x-1"
                                    )}
                                  />
                                </button>
                                
                                {isUpdating && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                )}
                              </div>
                              
                              <span className={clsx(
                                "ml-3 text-sm font-medium transition-colors",
                                pac.status === 'ACTIVE' 
                                  ? "" 
                                  : "text-gray-500 dark:text-gray-400",
                                isUpdating && "opacity-70"
                              )}
                              style={pac.status === 'ACTIVE' ? { color: primaryColor } : {}}>
                                {isUpdating 
                                  ? 'Actualizando...'
                                  : pac.status === 'ACTIVE' 
                                    ? 'Activo' 
                                    : 'Inactivo'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="relative">
                                <button
                                  onClick={() => handlePrimaryPacToggle(pac.idProvider)}
                                  className={clsx(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800",
                                    pac.primaryPac === pac.idProvider
                                      ? "focus:ring-primary"
                                      : "bg-gray-300 dark:bg-gray-600 focus:ring-gray-300",
                                    isPrimaryUpdating && "opacity-70"
                                  )}
                                  style={pac.primaryPac === pac.idProvider ? { backgroundColor: primaryColor } : {}}
                                  disabled={isLoading || isPrimaryUpdating}
                                >
                                  <span
                                    className={clsx(
                                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                      pac.primaryPac === pac.idProvider ? "translate-x-6" : "translate-x-1"
                                    )}
                                  />
                                </button>
                                
                                {isPrimaryUpdating && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                )}
                              </div>
                              
                              <span className={clsx(
                                "ml-3 text-sm font-medium transition-colors",
                                pac.primaryPac === pac.idProvider 
                                  ? "" 
                                  : "text-gray-500 dark:text-gray-400",
                                isPrimaryUpdating && "opacity-70"
                              )}
                              style={pac.primaryPac === pac.idProvider ? { color: primaryColor } : {}}>
                                {isPrimaryUpdating 
                                  ? 'Actualizando...'
                                  : pac.primaryPac === pac.idProvider 
                                    ? 'Primario' 
                                    : 'Secundario'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleOpenEditPacModal(pac)}
                              disabled={isLoading}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </button>
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
                    Mostrando {Math.min(startIndex + 1, pagination.totalItems)} - {Math.min(endIndex, pagination.totalItems)} de {pagination.totalItems}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={pagination.page === 1 || isLoading}
                      onClick={() => handlePageChange(pagination.page - 1)}
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
                      onClick={() => handlePageChange(pagination.page + 1)}
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

        {/* Toast */}
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={handleCloseToast}
          />
        )}

        {/* Modal de confirmación de cambio de estado */}
        <StatusConfirmModal
          isOpen={confirmModal.isOpen}
          pac={confirmModal.pac}
          newStatus={confirmModal.newStatus}
          onClose={handleCloseConfirmModal}
          onConfirm={handleStatusChange}
        />

        {/* Modal de agregar PAC */}
        <AddPacModal
          isOpen={addPacModalOpen}
          onClose={handleCloseAddPacModal}
          onSubmit={handleAddPacSubmit}
        />

        {/* Modal de editar PAC */}
        <EditPacModal
          isOpen={editPacModal.isOpen}
          pac={editPacModal.pac}
          onClose={handleCloseEditPacModal}
          onSubmit={handleEditPacSubmit}
        />
      </div>
    </div>
  );
}