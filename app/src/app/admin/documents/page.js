'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { FileText, Search, ChevronLeft, ChevronRight, XCircle, Eye, Trash2, Calendar, AlertTriangle, Upload, Edit } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import Toast from '@/components/Toast';

// Importar el modal de documentos
import DocumentFormModal from '@/components/DocumentFormModal';

export default function AdminDocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({}); // Para manejar loading individual de switches
  const [deletingDocument, setDeletingDocument] = useState({}); // Para manejar loading individual de eliminación
  const [viewingDocument, setViewingDocument] = useState({}); // Para manejar loading individual del botón ver
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  // Estados para la tabla de documentos
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

  // Cargar documentos al montar el componente
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Recargar documentos cuando cambien los filtros o la página
  useEffect(() => {
    fetchDocuments();
  }, [search, statusFilter, startDate, endDate, page]);

  // Función para cargar documentos
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      // Agregar filtros opcionales
      if (search.trim()) {
        params.append('name', search.trim());
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (startDate) {
        params.append('startDate', startDate);
      }

      if (endDate) {
        params.append('endDate', endDate);
      }

      // Cambiar la URL para usar la API de Next.js
      const response = await fetch(`/api/documents/all?${params.toString()}`, {
        headers: {
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          setDocuments(result.data);
          
          // Actualizar información de paginación
          if (result.pagination) {
            setPagination(result.pagination);
          }
        }
      } else {
        console.error('Error al cargar documentos:', response.statusText);
        setToast({
          visible: true,
          message: 'Error al cargar los documentos',
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

  // Función para abrir el modal de crear documento
  const handleCreateDocument = () => {
    setCreateModalOpen(true);
  };

  // Función para cerrar el modal de crear
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  // Función para abrir el modal de editar documento
  const handleEditDocument = (document) => {
    setSelectedDocument(document);
    setEditModalOpen(true);
  };

  // Función para cerrar el modal de editar
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedDocument(null);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
  };

  // Cerrar toast
  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Función para cambiar el estado del documento
  const handleStatusChange = async (documentId, newStatus) => {
    // Marcar este documento como "actualizando"
    setUpdatingStatus(prev => ({ ...prev, [documentId]: true }));

    try {
      const response = await fetch('/api/documents/status', {
        method: 'PATCH',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idDocument: documentId,
          status: newStatus
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.statusCode === "200") {
          // Actualizar el estado local
          setDocuments(prev => 
            prev.map(document => 
              document.idDocument === documentId 
                ? { ...document, status: newStatus }
                : document
            )
          );

          setToast({
            visible: true,
            message: `Estado actualizado a ${newStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}`,
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
      // Quitar el loading de este documento
      setUpdatingStatus(prev => ({ ...prev, [documentId]: false }));
    }
  };

  // Función para abrir un documento
  const handleViewDocument = async (document) => {
    const documentId = document.idDocument;
    setViewingDocument(prev => ({ ...prev, [documentId]: true }));

    try {
      const response = await fetch(`/api/documents/${documentId}/file`, {
        headers: {
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.statusCode === "200" && result.data?.file) {
          // Convertir base64 a blob y abrir en nueva ventana
          const byteCharacters = atob(result.data.file);
          const byteNumbers = new Array(byteCharacters.length);
          
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          // Abrir en nueva ventana
          window.open(url, '_blank');
          
          // Limpiar la URL después de un tiempo
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else {
          throw new Error('No se pudo obtener el archivo');
        }
      } else {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al abrir documento:', error);
      setToast({
        visible: true,
        message: `Error al abrir el documento: ${error.message}`,
        type: 'error'
      });
    } finally {
      setViewingDocument(prev => ({ ...prev, [documentId]: false }));
    }
  };

  // Función para mostrar modal de confirmación de eliminación
  const handleDeleteDocument = (document) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  // Función para confirmar eliminación
  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    const documentId = documentToDelete.idDocument;
    setDeletingDocument(prev => ({ ...prev, [documentId]: true }));

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.statusCode === "200") {
          // Eliminar el documento de la lista local
          setDocuments(prev => prev.filter(doc => doc.idDocument !== documentId));
          
          setToast({
            visible: true,
            message: 'Documento eliminado exitosamente',
            type: 'success'
          });

          // Si no quedan documentos en la página actual y no es la primera página, ir a la anterior
          if (documents.length === 1 && page > 1) {
            setPage(prev => prev - 1);
          } else {
            // Recargar la lista para actualizar la paginación
            fetchDocuments();
          }
        } else {
          throw new Error(result.message || 'Error en la respuesta del servidor');
        }
      } else {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      setToast({
        visible: true,
        message: `Error al eliminar el documento: ${error.message}`,
        type: 'error'
      });
    } finally {
      setDeletingDocument(prev => ({ ...prev, [documentId]: false }));
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
  };

  // Función para cancelar eliminación
  const cancelDeleteDocument = () => {
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  // Función para manejar el éxito al crear documento
  const handleCreateSuccess = (result) => {
    if (result.success) {
      // Recargar la lista de documentos para incluir el nuevo
      fetchDocuments();
    }

    setToast({
      visible: true,
      message: result.message,
      type: result.success ? 'success' : 'error'
    });
  };

  // Función para manejar el éxito al editar documento
  const handleEditSuccess = (result) => {
    if (result.success) {
      // Recargar la lista de documentos para reflejar los cambios
      fetchDocuments();
    }

    setToast({
      visible: true,
      message: result.message,
      type: result.success ? 'success' : 'error'
    });
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Paginación usando los datos del servidor
  const totalPages = pagination.totalPages;
  const currentDocuments = documents; // Ya vienen paginados del servidor

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="text-center py-20">
      <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {search || statusFilter !== 'all' || startDate || endDate
          ? 'No se encontraron documentos que coincidan con los filtros'
          : 'No hay documentos disponibles'
        }
      </h3>
      <p className="text-gray-500 dark:text-gray-500 mb-4">
        {search || statusFilter !== 'all' || startDate || endDate
          ? 'Intenta ajustar los filtros de búsqueda'
          : 'Los documentos subidos aparecerán aquí'
        }
      </p>
    </div>
  );

  // Componente de Skeleton para la tabla
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </td>
    </tr>
  );

  // Modal de confirmación de eliminación
  const DeleteConfirmationModal = () => (
    showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmar eliminación
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar el documento{' '}
              <span className="font-semibold">"{documentToDelete?.name}"</span>?
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteDocument}
                disabled={deletingDocument[documentToDelete?.idDocument]}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteDocument}
                disabled={deletingDocument[documentToDelete?.idDocument]}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingDocument[documentToDelete?.idDocument] && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
                      Administración de Documentos
                    </h1>
                  </div>
                  <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                    Gestiona todos los documentos del sistema y controla su disponibilidad.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                    onClick={handleCreateDocument}
                    disabled={isLoading}
                  >
                    <Upload className="w-4 h-4" />
                    Subir Documento
                  </button>
                </div>
              </div>

              {/* Buscador y filtros */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 flex-grow">
                    <div className="relative max-w-md w-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar documentos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch('')}
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

                {/* Filtros de fecha */}
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex flex-col sm:flex-row gap-4 flex-grow">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha desde
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha hasta
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Botón para limpiar filtros */}
                  {(search || statusFilter !== 'all' || startDate || endDate) && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors whitespace-nowrap"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de documentos */}
            <div className="rounded-lg border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24] overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    {['Documento', 'Fecha de Subida', 'Estado', 'Acciones'].map((label, i) => (
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
                  ) : currentDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4">
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    currentDocuments.map(document => {
                      const isUpdatingStatus = updatingStatus[document.idDocument];
                      const isDeleting = deletingDocument[document.idDocument];
                      const isViewing = viewingDocument[document.idDocument];
                      
                      return (
                        <tr key={document.idDocument} className="hover:bg-gray-50 dark:hover:bg-[#262636] transition">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium mb-1">{document.name}</div>
                              {document.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {document.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              {formatDate(document.uploadDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="relative">
                                <button
                                  onClick={() => handleStatusChange(
                                    document.idDocument, 
                                    document.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                  )}
                                  className={clsx(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800",
                                    document.status === 'ACTIVE'
                                      ? "focus:ring-primary"
                                      : "bg-gray-300 dark:bg-gray-600 focus:ring-gray-300",
                                    isUpdatingStatus && "opacity-70"
                                  )}
                                  style={document.status === 'ACTIVE' ? { backgroundColor: primaryColor } : {}}
                                  disabled={isLoading || isUpdatingStatus}
                                >
                                  <span
                                    className={clsx(
                                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                      document.status === 'ACTIVE' ? "translate-x-6" : "translate-x-1"
                                    )}
                                  />
                                </button>
                                
                                {/* Spinner de loading */}
                                {isUpdatingStatus && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                )}
                              </div>
                              
                              <span className={clsx(
                                "ml-3 text-sm font-medium transition-colors",
                                document.status === 'ACTIVE' 
                                  ? "" 
                                  : "text-gray-500 dark:text-gray-400",
                                isUpdatingStatus && "opacity-70"
                              )}
                              style={document.status === 'ACTIVE' ? { color: primaryColor } : {}}>
                                {isUpdatingStatus 
                                  ? 'Actualizando...'
                                  : document.status === 'ACTIVE' 
                                    ? 'Activo' 
                                    : 'Inactivo'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDocument(document)}
                                disabled={isViewing}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Abrir documento"
                              >
                                {isViewing ? (
                                  <div className="w-3.5 h-3.5 border border-blue-700 dark:border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                                <span className="text-xs font-medium">
                                  {isViewing ? 'Abriendo...' : 'Ver'}
                                </span>
                              </button>
                              <button
                                onClick={() => handleEditDocument(document)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                title="Editar documento"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Editar</span>
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(document)}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
                                title="Eliminar documento"
                              >
                                {isDeleting ? (
                                  <div className="w-3.5 h-3.5 border border-red-700 dark:border-red-200 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span className="text-xs font-medium">
                                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                                </span>
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

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmationModal />

        {/* Modal de crear documento */}
        <DocumentFormModal
          isOpen={createModalOpen}
          onClose={handleCloseCreateModal}
          onSubmit={handleCreateSuccess}
        />

        {/* Modal de editar documento */}
        <DocumentFormModal
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          onSubmit={handleEditSuccess}
          document={selectedDocument}
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