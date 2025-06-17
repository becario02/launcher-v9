'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Gift, Upload, Search, ChevronLeft, ChevronRight, Image, CheckCircle, XCircle, Calendar, Eye, Edit, Plus, Star, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import Toast from '@/components/Toast';

// Importar el modal unificado y el visor de imágenes
import PromotionFormModal from '@/components/PromotionFormModal';
import ImageViewerModal from '@/components/ImageViewerModal';
// import ViewPromotionModal from '@/components/ViewPromotionModal';

export default function AdminPromotionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [selectedImage, setSelectedImage] = useState({ src: '', alt: '' });
  const [updatingStatus, setUpdatingStatus] = useState({}); // Para manejar loading individual de switches

  // Estados para la tabla de promociones
  const [promotions, setPromotions] = useState([]);
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

  // Cargar promociones al montar el componente
  useEffect(() => {
    fetchPromotions();
  }, [page, search, statusFilter]);

  // Función para cargar promociones
  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        Page: page.toString(),
        PageSize: pageSize.toString(),
      });

      if (search.trim()) {
        params.append('Search', search.trim());
      }

      if (statusFilter !== 'all') {
        params.append('Status', statusFilter);
      }

      const response = await fetch(`/api/promotions?${params}`, {
        headers: {
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          setPromotions(result.data);
          setPagination(result.pagination);
        }
      } else {
        console.error('Error al cargar promociones:', response.statusText);
        setToast({
          visible: true,
          message: 'Error al cargar las promociones',
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

  // Función para abrir el modal de crear promoción
  const handleCreatePromotion = () => {
    setSelectedPromotion(null); // null = modo crear
    setPromotionModalOpen(true);
  };

  // Función para abrir el modal de editar promoción
  const handleEditPromotion = (promotion) => {
    setSelectedPromotion(promotion); // objeto = modo editar
    setPromotionModalOpen(true);
  };

  // Función para cerrar el modal de promoción
  const handleClosePromotionModal = () => {
    setPromotionModalOpen(false);
    setSelectedPromotion(null);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearch('');
  };

  // Cerrar toast
  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Función para cambiar el estado de la promoción
  const handleStatusChange = async (promotionId, newStatus) => {
    // Marcar esta promoción como "actualizando"
    setUpdatingStatus(prev => ({ ...prev, [promotionId]: true }));

    try {
      let endpoint, method, successMessage;

      if (newStatus === 'ACTIVE') {
        // Activar promoción
        endpoint = `/api/promotions/activate?id=${promotionId}`;
        method = 'PUT';
        successMessage = 'Promoción activada correctamente. Las demás promociones se han desactivado automáticamente.';
      } else {
        // Desactivar promoción
        endpoint = `/api/promotions/deactivate?id=${promotionId}`;
        method = 'PUT';
        successMessage = 'Promoción desactivada correctamente.';
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.statusCode === "200") {
          // Recargar las promociones para obtener los datos actualizados
          fetchPromotions();

          setToast({
            visible: true,
            message: result.message || successMessage,
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
      console.error(`Error al ${newStatus === 'ACTIVE' ? 'activar' : 'desactivar'} promoción:`, error);
      setToast({
        visible: true,
        message: `Error al ${newStatus === 'ACTIVE' ? 'activar' : 'desactivar'} la promoción: ${error.message}`,
        type: 'error'
      });
    } finally {
      // Quitar el loading de esta promoción
      setUpdatingStatus(prev => ({ ...prev, [promotionId]: false }));
    }
  };

  // Función para ver la promoción
  const handleViewPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setViewModalOpen(true);
  };

  // Función para cerrar el modal de ver
  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedPromotion(null);
  };

  // Función para abrir el visor de imágenes
  const handleViewImage = (promotion) => {
    if (promotion.image) {
      setSelectedImage({
        src: `data:image/jpeg;base64,${promotion.image}`,
        alt: promotion.description
      });
      setImageViewerOpen(true);
    }
  };

  // Función para cerrar el visor de imágenes
  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImage({ src: '', alt: '' });
  };

  // Función para abrir la URL de la promoción
  const handleOpenPromotionUrl = (promotion) => {
    if (promotion.urlReference) {
      // Validar que la URL tenga protocolo
      let url = promotion.urlReference;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Abrir en nueva pestaña
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setToast({
        visible: true,
        message: 'Esta promoción no tiene una URL de referencia configurada',
        type: 'error'
      });
    }
  };

  // Función unificada para manejar el éxito del modal (crear/editar)
  const handlePromotionFormSuccess = (result) => {
    if (result.success) {
      // Recargar la lista de promociones
      fetchPromotions();
    }

    setToast({
      visible: true,
      message: result.message,
      type: result.success ? 'success' : 'error'
    });
  };

  // Formatear fecha de expiración
  const formatExpirationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isExpired = date < now;
    
    return {
      formatted: date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      isExpired
    };
  };

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="text-center py-20">
      <Gift className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {search || statusFilter !== 'all' 
          ? 'No se encontraron promociones que coincidan con los filtros'
          : 'No hay promociones disponibles'
        }
      </h3>
      <p className="text-gray-500 dark:text-gray-500 mb-4">
        {search || statusFilter !== 'all'
          ? 'Intenta ajustar los filtros de búsqueda'
          : 'Las promociones creadas aparecerán aquí'
        }
      </p>
    </div>
  );

  // Componente de Skeleton para la tabla
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </td>
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
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
                    <Gift className="w-6 h-6 text-primary" />
                    <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                      Administrador de Promociones
                    </h1>
                  </div>
                  <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                    Gestiona las promociones y ofertas especiales de la plataforma.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                    onClick={handleCreatePromotion}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Promoción
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
                      placeholder="Buscar promociones..."
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
                    <option value="ACTIVE">Activas</option>
                    <option value="INACTIVE">Inactivas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla de promociones */}
            <div className="rounded-lg border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24] overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    {['Promoción', 'Tipo', 'Fecha de Expiración', 'Estado', 'Acciones'].map((label, i) => (
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
                  ) : promotions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4">
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    promotions.map(promotion => {
                      const isUpdating = updatingStatus[promotion.idPromotion];
                      const expirationInfo = formatExpirationDate(promotion.expirationDate);
                      
                      return (
                        <tr key={promotion.idPromotion} className="hover:bg-gray-50 dark:hover:bg-[#262636] transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {promotion.image ? (
                                  <button
                                    onClick={() => handleViewImage(promotion)}
                                    className="block rounded-lg overflow-hidden hover:opacity-75 transition-opacity cursor-pointer"
                                    title="Clic para ver imagen"
                                  >
                                    <img
                                      src={`data:image/jpeg;base64,${promotion.image}`}
                                      alt={promotion.description}
                                      className="w-12 h-12 object-cover"
                                    />
                                  </button>
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <Image className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                  </div>
                                )}
                                {promotion.isDefault && (
                                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                                    <Star className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {promotion.description}
                                  {promotion.isDefault && (
                                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                                      Por defecto
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={clsx(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                              promotion.isDefault
                                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                            )}>
                              {promotion.isDefault ? (
                                <>
                                  <Star className="w-3 h-3" />
                                  Por defecto
                                </>
                              ) : (
                                <>
                                  <Gift className="w-3 h-3" />
                                  Normal
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {promotion.isDefault ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                  Sin expiración
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className={clsx(
                                  "text-sm",
                                  expirationInfo.isExpired && "text-red-600 dark:text-red-400"
                                )}>
                                  {expirationInfo.formatted}
                                </span>
                                {expirationInfo.isExpired && (
                                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                                    Expirada
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="relative">
                                <button
                                  onClick={() => {
                                    if (promotion.status === 'ACTIVE') {
                                      // Solo permitir desactivar si NO es promoción por defecto
                                      if (!promotion.isDefault) {
                                        handleStatusChange(promotion.idPromotion, 'INACTIVE');
                                      }
                                    } else {
                                      // Permitir activar cualquier promoción inactiva
                                      handleStatusChange(promotion.idPromotion, 'ACTIVE');
                                    }
                                  }}
                                  className={clsx(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800",
                                    promotion.status === 'ACTIVE'
                                      ? promotion.isDefault
                                        ? "cursor-default focus:ring-primary" // Promoción por defecto activa: no clickeable
                                        : "cursor-pointer focus:ring-primary hover:opacity-80" // Promoción normal activa: clickeable para desactivar
                                      : "bg-gray-300 dark:bg-gray-600 focus:ring-gray-300 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500", // Promoción inactiva: clickeable para activar
                                    isUpdating && "opacity-70"
                                  )}
                                  style={promotion.status === 'ACTIVE' ? { backgroundColor: primaryColor } : {}}
                                  disabled={isLoading || isUpdating || (promotion.status === 'ACTIVE' && promotion.isDefault)}
                                  title={
                                    promotion.status === 'ACTIVE'
                                      ? promotion.isDefault
                                        ? 'Las promociones por defecto no se pueden desactivar'
                                        : 'Clic para desactivar promoción'
                                      : 'Clic para activar promoción'
                                  }
                                >
                                  <span
                                    className={clsx(
                                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                      promotion.status === 'ACTIVE' ? "translate-x-6" : "translate-x-1"
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
                                promotion.status === 'ACTIVE' 
                                  ? "" 
                                  : "text-gray-500 dark:text-gray-400",
                                isUpdating && "opacity-70"
                              )}
                              style={promotion.status === 'ACTIVE' ? { color: primaryColor } : {}}>
                                {isUpdating 
                                  ? promotion.status === 'ACTIVE' 
                                    ? 'Desactivando...'
                                    : 'Activando...'
                                  : promotion.status === 'ACTIVE' 
                                    ? 'Activa' 
                                    : 'Inactiva'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewImage(promotion)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                title="Ver imagen"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Ver</span>
                              </button>
                              <button
                                onClick={() => handleEditPromotion(promotion)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                title="Editar promoción"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Editar</span>
                              </button>
                              {promotion.urlReference && (
                                <button
                                  onClick={() => handleOpenPromotionUrl(promotion)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                  title={`Ir a: ${promotion.urlReference}`}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">URL</span>
                                </button>
                              )}
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

        {/* Modal Unificado de Promoción (Crear/Editar) */}
        <PromotionFormModal
          isOpen={promotionModalOpen}
          onClose={handleClosePromotionModal}
          promotion={selectedPromotion} // null = crear, objeto = editar
          onSuccess={handlePromotionFormSuccess}
        />

        {/* Modal Visor de Imágenes */}
        <ImageViewerModal
          isOpen={imageViewerOpen}
          onClose={handleCloseImageViewer}
          imageSrc={selectedImage.src}
          imageAlt={selectedImage.alt}
        />

        {/* Modal de Ver Promoción */}
        {/*
        <ViewPromotionModal
          isOpen={viewModalOpen}
          onClose={handleCloseViewModal}
          promotion={selectedPromotion}
        />
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