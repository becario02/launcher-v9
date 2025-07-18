'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { UserCheck, Search, ChevronLeft, ChevronRight, XCircle, Building, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import Toast from '@/components/Toast';
import StatusConfirmModal from '@/components/advanpac/clientes/StatusConfirmModal';
import AddClientModal from '@/components/advanpac/clientes/AddClientModal';

export default function AdvanPacClientesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Estados para la tabla de clientes
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
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
    cliente: null,
    newStatus: null
  });

  // Estado para modal de agregar cliente
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClientes();
  }, [pagination.page, search, statusFilter]);

  // Función para obtener estados de AdvanPAC
  const fetchAdvanPacStatuses = async () => {
    try {
      const response = await fetch('/api/advanpac/customers');
      if (response.ok) {
        const result = await response.json();
        // Si la respuesta es un array directo, lo retornamos; si no, extraemos data
        return Array.isArray(result) ? result : (result.data || []);
      } else {
        console.error('Error al obtener estados de AdvanPAC:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error al conectar con AdvanPAC:', error);
      return [];
    }
  };

  // Función para cargar clientes desde la API
  const fetchClientes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString()
      });

      if (search.trim()) {
        params.append('search', search);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      // Obtener datos de clientes y estados de AdvanPAC en paralelo
      const [clientesResponse, advanPacCustomers] = await Promise.all([
        fetch(`/api/companies/advanpac?${params}`),
        fetchAdvanPacStatuses()
      ]);

      const clientesResult = await clientesResponse.json();
      
      if (clientesResult.statusCode === "200") {
        // Combinar datos de clientes con estados reales de AdvanPAC
        const clientesWithRealStatus = clientesResult.data.map(cliente => {
          // Buscar el estado real en AdvanPAC usando idCustomerAdvanPac
          const advanPacCustomer = advanPacCustomers.find(
            customer => customer.idCustomer === cliente.idCustomerAdvanPac
          );
          
          return {
            ...cliente,
            // Usar el estado real de AdvanPAC si existe, sino mantener el original
            status: advanPacCustomer ? advanPacCustomer.status : cliente.status,
            // Agregar información adicional para debugging
            advanPacStatus: advanPacCustomer ? advanPacCustomer.status : null,
            hasAdvanPacData: !!advanPacCustomer
          };
        });

        // Filtrar por estado si es necesario (ahora usando el estado real)
        let filteredData = clientesWithRealStatus;
        if (statusFilter !== 'all') {
          filteredData = clientesWithRealStatus.filter(cliente => cliente.status === statusFilter);
        }

        setClientes(clientesWithRealStatus);
        setFilteredClientes(filteredData);
        
        if (clientesResult.pagination) {
          setPagination(prev => ({
            ...prev,
            totalItems: filteredData.length, // Actualizar con datos filtrados
            totalPages: Math.ceil(filteredData.length / prev.pageSize)
          }));
        }
      } else {
        console.error('Error al cargar clientes:', clientesResult.message);
        setToast({
          visible: true,
          message: clientesResult.message || 'Error al cargar los clientes',
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
  const handleStatusChangeRequest = (cliente, newStatus) => {
    setConfirmModal({
      isOpen: true,
      cliente: cliente,
      newStatus: newStatus
    });
  };

  // Función para cerrar modal de confirmación
  const handleCloseConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      cliente: null,
      newStatus: null
    });
  };

  // Función para cambiar el estado del cliente usando Next.js API
  const handleStatusChange = async (clienteId, newStatus) => {
    // Marcar este cliente como "actualizando"
    setUpdatingStatus(prev => ({ ...prev, [clienteId]: true }));

    try {
      // Buscar el cliente para obtener su idCustomerAdvanPac
      const cliente = clientes.find(c => c.idCompany === clienteId);
      if (!cliente || !cliente.idCustomerAdvanPac) {
        throw new Error('No se encontró el ID de cliente de AdvanPAC');
      }

      // Determinar endpoint según el nuevo estado
      const action = newStatus === 'ACTIVE' ? 'activate' : 'inactivate';
      const endpoint = `/api/advanpac/customers/${cliente.idCustomerAdvanPac}/${action}`;

      // Llamar al endpoint de Next.js que se conecta con AdvanPAC
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        // Actualizar el estado local inmediatamente
        setClientes(prev => 
          prev.map(c => 
            c.idCompany === clienteId 
              ? { ...c, status: newStatus, advanPacStatus: newStatus }
              : c
          )
        );

        setFilteredClientes(prev => 
          prev.map(c => 
            c.idCompany === clienteId 
              ? { ...c, status: newStatus, advanPacStatus: newStatus }
              : c
          )
        );

        setToast({
          visible: true,
          message: result.message || `Cliente ${newStatus === 'ACTIVE' ? 'activado' : 'inactivado'} exitosamente`,
          type: 'success'
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setToast({
        visible: true,
        message: `Error al actualizar el estado: ${error.message}`,
        type: 'error'
      });
    } finally {
      // Quitar el loading de este cliente
      setUpdatingStatus(prev => ({ ...prev, [clienteId]: false }));
    }
  };

  // Función para abrir modal de crear cliente
  const handleOpenAddClientModal = () => {
    setAddClientModalOpen(true);
  };

  // Función para cerrar modal de crear cliente
  const handleCloseAddClientModal = () => {
    setAddClientModalOpen(false);
  };

  // Función para manejar submit del modal de cliente
  const handleAddClientSubmit = (result) => {
    if (result.success) {
      setToast({
        visible: true,
        message: result.message,
        type: 'success'
      });
      
      // Recargar la lista de clientes
      fetchClientes();
    } else {
      setToast({
        visible: true,
        message: result.message || 'Error al crear el cliente',
        type: 'error'
      });
    }
  };

  // Paginación
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = Math.min(startIndex + pagination.pageSize, pagination.totalItems);
  const currentClientes = filteredClientes.slice(startIndex, Math.min(startIndex + pagination.pageSize, filteredClientes.length));

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="text-center py-20">
      <UserCheck className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {search || statusFilter !== 'all' 
          ? 'No se encontraron clientes que coincidan con los filtros'
          : 'No hay clientes disponibles'
        }
      </h3>
      <p className="text-gray-500 dark:text-gray-500 mb-4">
        {search || statusFilter !== 'all'
          ? 'Intenta ajustar los filtros de búsqueda'
          : 'Los clientes registrados aparecerán aquí'
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
                    <UserCheck className="w-6 h-6 text-primary" />
                    <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                      Clientes AdvanPAC
                    </h1>
                  </div>
                  <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                    Gestión y administración de empresas clientes del sistema.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                    onClick={handleOpenAddClientModal}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Cliente
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
                      placeholder="Buscar por identificador o nombre..."
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

            {/* Tabla de clientes */}
            <div className="rounded-lg border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24] overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    {['Identificador Empresa', 'Nombre', 'Estado'].map((label, i) => (
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
                  ) : currentClientes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4">
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    currentClientes.map(cliente => {
                      const isUpdating = updatingStatus[cliente.idCompany];
                      
                      return (
                        <tr key={cliente.idCompany} className="hover:bg-gray-50 dark:hover:bg-[#262636] transition">
                          <td className="px-6 py-4 font-medium">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {cliente.companyIdentifier}
                              </span>
                              {/* Indicador si hay datos de AdvanPAC */}
                              {!cliente.hasAdvanPacData && (
                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-1 py-0.5 rounded" title="Sin datos en AdvanPAC">
                                  !
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium max-w-xs">
                            <span className="truncate">{cliente.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="relative">
                                <button
                                  onClick={() => handleStatusChangeRequest(
                                    cliente, 
                                    cliente.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                  )}
                                  className={clsx(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800",
                                    cliente.status === 'ACTIVE'
                                      ? "focus:ring-primary"
                                      : "bg-gray-300 dark:bg-gray-600 focus:ring-gray-300",
                                    isUpdating && "opacity-70"
                                  )}
                                  style={cliente.status === 'ACTIVE' ? { backgroundColor: primaryColor } : {}}
                                  disabled={isLoading || isUpdating || !cliente.hasAdvanPacData}
                                >
                                  <span
                                    className={clsx(
                                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                      cliente.status === 'ACTIVE' ? "translate-x-6" : "translate-x-1"
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
                                cliente.status === 'ACTIVE' 
                                  ? "" 
                                  : "text-gray-500 dark:text-gray-400",
                                isUpdating && "opacity-70",
                                !cliente.hasAdvanPacData && "opacity-60"
                              )}
                              style={cliente.status === 'ACTIVE' ? { color: primaryColor } : {}}>
                                {isUpdating 
                                  ? 'Actualizando...'
                                  : cliente.status === 'ACTIVE' 
                                    ? 'Activo' 
                                    : 'Inactivo'
                                }
                                {!cliente.hasAdvanPacData && (
                                  <span className="text-xs text-gray-400 ml-1">(sin sync)</span>
                                )}
                              </span>
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
          cliente={confirmModal.cliente}
          newStatus={confirmModal.newStatus}
          onClose={handleCloseConfirmModal}
          onConfirm={handleStatusChange}
        />

        {/* Modal de agregar cliente */}
        <AddClientModal
          isOpen={addClientModalOpen}
          onClose={handleCloseAddClientModal}
          onSubmit={handleAddClientSubmit}
        />
      </div>
    </div>
  );
}