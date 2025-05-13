'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { Pencil, PlusCircle, Bell, Calendar, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import Toast from '@/components/Toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import NotificationFormModal from '@/components/NotificationFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import CategoryBadge from '@/components/CategoryBadge';
import NotificationFilters from '@/components/NotificationFilters';

export default function AdminNotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para paginación
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalNotifications, setTotalNotifications] = useState(0);

  // Estados para filtros
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  // Estados para modales
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  // Estado para el listado de compañías
  const [companies, setCompanies] = useState([]);

  // Estado para manejar el toast
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  const fetchNotifications = () => {
    setIsLoading(true);

    // Construir los parámetros para la petición
    const params = {
      page,
      pageSize,
      search: search || undefined,
      status: status || undefined,
      category: category || undefined,
      companyId: companyId || undefined
    };

    // Añadir fechas solo si están definidas
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    axios
      .get('http://localhost:5173/mslauncher/api/v1/notifications', {
        params,
        headers: {
          'Accept-Language': 'es' // Requerido según el controlador
        }
      })
      .then(res => {
        if (res.data && res.data.data) {
          setNotifications(res.data.data || []);
          setTotalNotifications(res.data.pagination?.totalItems || 0);
        } else {
          console.error('Formato de respuesta inesperado:', res.data);
          setNotifications([]);
          setTotalNotifications(0);
        }
      })
      .catch(err => {
        console.error('Error al obtener notificaciones:', err);
        showToast('Error al cargar las notificaciones', 'error');
      })
      .finally(() => setIsLoading(false));
  };

  // Cargar lista de compañías para el filtro
  const fetchCompanies = () => {
    axios
      .get('http://localhost:5173/mslauncher/api/v1/companies', {
        headers: {
          'Accept-Language': 'es'
        }
      })
      .then(res => {
        if (res.data && res.data.data) {
          setCompanies(res.data.data || []);
        }
      })
      .catch(err => {
        console.error('Error al obtener compañías:', err);
      });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchNotifications();
    }, 400); // pequeño debounce para evitar exceso de llamadas

    return () => clearTimeout(delayDebounce);
  }, [page, search, status, category, startDate, endDate, companyId]);

  const handleNotificationSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        expirationDate: data.expirationDate,
        status: data.status,
        companyIds: data.companyIds || []
      };

      if (editingNotification) {
        // Update
        const response = await axios.put('http://localhost:5173/mslauncher/api/v1/notification', {
          ...payload,
          id: editingNotification.idNotification
        }, {
          headers: {
            'Accept-Language': 'es'
          }
        });

        if (response.data && response.data.statusCode === "200") {
          showToast('Notificación actualizada exitosamente', 'success');
          setModalOpen(false);
          setEditingNotification(null);
          fetchNotifications();
        } else {
          showToast(response.data?.message || 'Error al actualizar la notificación', 'error');
        }
      } else {
        // Create
        const response = await axios.post('http://localhost:5173/mslauncher/api/v1/notification', payload, {
          headers: {
            'Accept-Language': 'es'
          }
        });

        if (response.data && response.data.statusCode === "201") {
          showToast('Notificación creada exitosamente', 'success');
          setModalOpen(false);
          fetchNotifications();
        } else {
          showToast(response.data?.message || 'Error al crear la notificación', 'error');
        }
      }
    } catch (err) {
      console.error('Error al guardar notificación:', err);
      showToast('Error al procesar la solicitud. Inténtalo de nuevo.', 'error');
    }
  };

  const handleDeleteNotification = async () => {
    if (!notificationToDelete) return;

    try {
      const response = await axios.delete(`http://localhost:5173/mslauncher/api/v1/notification/${notificationToDelete}`, {
        headers: {
          'Accept-Language': 'es'
        }
      });

      if (response.data && response.data.statusCode === "200") {
        showToast('Notificación eliminada exitosamente', 'success');
        fetchNotifications();
      } else {
        showToast(response.data?.message || 'Error al eliminar la notificación', 'error');
      }
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
      showToast('Error al eliminar la notificación', 'error');
    } finally {
      setConfirmDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

  // Mostrar Toast
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  // Manejar el cierre del toast
  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    setStartDate(null);
    setEndDate(null);
    setCompanyId(null);
    setPage(1);
  };

  // Componente de Skeleton para una fila de la tabla
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4 hidden lg:table-cell">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </td>
    </tr>
  );

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch (e) {
      return dateString;
    }
  };

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
        {/* Navbar fixed */}
        <Navbar className="sticky top-0 z-30" onMenuClick={() => setSidebarOpen(true)} />

        {/* Main */}
        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14 px-4 md:px-8 xl:px-10 w-full">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-6 h-6 text-primary" />
                    <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                      Administración de Notificaciones
                    </h1>
                  </div>
                  <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                    Gestiona las notificaciones que recibirán los usuarios en la plataforma.
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => {
                    setEditingNotification(null);
                    setModalOpen(true);
                  }}
                >
                  <PlusCircle className="w-4 h-4" />
                  Nueva notificación
                </button>
              </div>

              {/* Componente de filtros */}
              <NotificationFilters 
                search={search}
                setSearch={setSearch}
                status={status}
                setStatus={setStatus}
                category={category}
                setCategory={setCategory}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                companyId={companyId}
                setCompanyId={setCompanyId}
                companies={companies}
                setPage={setPage}
                clearAllFilters={clearAllFilters}
              />
            </div>

            {/* Tabla */}
            <div className="custom-scrollbar overflow-hidden rounded-xl border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap font-medium">Información</th>
                      <th className="px-6 py-4 whitespace-nowrap hidden lg:table-cell font-medium">Categoría</th>
                      <th className="px-6 py-4 whitespace-nowrap font-medium">Estado</th>
                      <th className="px-6 py-4 whitespace-nowrap hidden md:table-cell font-medium">Fecha Expiración</th>
                      <th className="px-6 py-4 whitespace-nowrap font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#2C2C38] text-gray-800 dark:text-gray-200">
                    {isLoading ? (
                      // Skeleton loading state
                      <>
                        {[...Array(pageSize)].map((_, index) => (
                          <TableRowSkeleton key={index} />
                        ))}
                      </>
                    ) : notifications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          {search || status || category || startDate || endDate || companyId ?
                            'No se encontraron notificaciones con los filtros aplicados' :
                            'No hay notificaciones registradas'}
                        </td>
                      </tr>
                    ) : (
                      notifications.map(notification => (
                        <tr key={notification.idNotification} className="hover:bg-gray-50 dark:hover:bg-[#262636] transition">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800 dark:text-gray-200 mb-1">{notification.title}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{notification.description}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <CategoryBadge category={notification.category} />
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={notification.status} />
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{formatDate(notification.expirationDate)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingNotification(notification);
                                  setModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                title="Editar notificación"
                              >
                                <Pencil className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-medium">Editar</span>
                              </button>
                              <button
                                onClick={() => {
                                  setNotificationToDelete(notification.idNotification);
                                  setConfirmDialogOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                                title="Eliminar notificación"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                                <span className="text-xs font-medium">Eliminar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-[#2C2C38] text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {totalNotifications > 0 ? (
                    <>Mostrando {Math.min((page - 1) * pageSize + 1, totalNotifications)} - {Math.min(page * pageSize, totalNotifications)} de {totalNotifications}</>
                  ) : (
                    'No hay resultados'
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1 || isLoading || totalNotifications === 0}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className={clsx(
                      "inline-flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-200",
                      "transition focus:outline-none",
                      page === 1 || isLoading || totalNotifications === 0
                        ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#2C2C38]"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48]"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </button>
                  <button
                    disabled={page * pageSize >= totalNotifications || isLoading || totalNotifications === 0}
                    onClick={() => setPage(prev => prev + 1)}
                    className={clsx(
                      "inline-flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-200",
                      "transition focus:outline-none",
                      page * pageSize >= totalNotifications || isLoading || totalNotifications === 0
                        ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#2C2C38]"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48]"
                    )}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modal de Creación/Edición */}
        {modalOpen && (
          <NotificationFormModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setEditingNotification(null);
            }}
            onSubmit={handleNotificationSubmit}
            initialData={editingNotification}
            companies={companies}
          />
        )}

        {/* Diálogo de Confirmación */}
        {confirmDialogOpen && (
          <ConfirmDialog
            isOpen={confirmDialogOpen}
            title="Eliminar notificación"
            message="¿Estás seguro de que deseas eliminar esta notificación? Esta acción no se puede deshacer."
            confirmLabel="Eliminar"
            cancelLabel="Cancelar"
            onConfirm={handleDeleteNotification}
            onCancel={() => {
              setConfirmDialogOpen(false);
              setNotificationToDelete(null);
            }}
            danger
          />
        )}

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

// Componente para mostrar el estado
const StatusBadge = ({ status }) => {
  const isActive = status === 'ACTIVE';

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      isActive
        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-400'
    )}>
      <span className={clsx(
        'w-2 h-2 rounded-full mr-1.5',
        isActive ? 'bg-green-500' : 'bg-gray-500'
      )}></span>
      {isActive ? 'Activa' : 'Inactiva'}
    </span>
  );
};