'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import clsx from 'clsx';
import { 
  Files, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  XCircle, 
  CheckCircle, 
  Calendar,
  Download,
  Filter,
  ArrowLeft,
  User,
  Building2,
  FileText,
  Clock,
  Eye
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import Toast from '@/components/Toast';
import FileContentModal from '@/components/FileContentModal';

export default function IntegratorFilesPage() {
  const router = useRouter();
  const params = useParams();
  const integratorId = params?.id;
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  const [integrator, setIntegrator] = useState(null);
  const [companies, setCompanies] = useState([]);
  
  // Estados para modal de contenido
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Estados para la tabla de archivos
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });

  // Estado para notificaciones
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (integratorId) {
      fetchIntegrator();
      fetchCompanies();
      fetchFiles();
    }
  }, [integratorId]);

  // Refetch files cuando cambien los filtros
  useEffect(() => {
    if (integratorId) {
      fetchFiles();
    }
  }, [page, search, selectedCompany, resultFilter, startDate, endDate]);

  // Función para cargar información del integrador
  const fetchIntegrator = async () => {
    try {
      const response = await fetch(`http://localhost:5173/mslauncher/api/v1/integrator/${integratorId}`, {
        headers: {
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          setIntegrator(result.data);
        }
      }
    } catch (error) {
      console.error('Error al cargar integrador:', error);
    }
  };

  // Función para cargar compañías del integrador
  const fetchCompanies = async () => {
    try {
      const response = await fetch(`http://localhost:5173/mslauncher/api/v1/integrator/${integratorId}/companies`, {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          setCompanies(result.data);
        }
      }
    } catch (error) {
      console.error('Error al cargar compañías:', error);
    }
  };

  // Función para cargar archivos
  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const requestBody = {
        idIntegrator: parseInt(integratorId),
        idCustomerIntegrator: selectedCompany === 'all' ? null : parseInt(selectedCompany),
        search: search.trim() || null,
        startDate: startDate || null,
        endDate: endDate || null,
        successOnly: resultFilter === 'success' ? true : resultFilter === 'error' ? false : null,
        page: page,
        pageSize: pageSize
      };

      // Remover propiedades null del body
      Object.keys(requestBody).forEach(key => {
        if (requestBody[key] === null) {
          delete requestBody[key];
        }
      });

      const response = await fetch('http://localhost:5173/mslauncher/api/v1/integrator/files', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          setFiles(result.data);
          // Actualizar información de paginación desde el response
          if (result.pagination) {
            setPagination(result.pagination);
          } else {
            // Fallback si no viene pagination
            setPagination({
              page: page,
              pageSize: pageSize,
              totalItems: result.data.length,
              totalPages: 1
            });
          }
        }
      } else {
        setToast({
          visible: true,
          message: 'Error al cargar los archivos',
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

  // Limpiar filtros
  const clearFilters = () => {
    setSearch('');
    setSelectedCompany('all');
    setResultFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Cerrar toast
  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Función para ver contenido del archivo
  const handleViewContent = (file) => {
    setSelectedFile(file);
    setContentModalOpen(true);
  };

  // Función para cerrar modal de contenido
  const handleCloseContentModal = () => {
    setContentModalOpen(false);
    setSelectedFile(null);
  };

  // Función para manejar errores del modal
  const handleModalError = (message) => {
    setToast({
      visible: true,
      message: message,
      type: 'error'
    });
  };

  // Formatear fecha según zona horaria del navegador
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    // Verificar si la fecha es válida antes de procesarla
    let date;
    
    // Si el string no termina en 'Z', asumimos que es UTC y lo agregamos
    if (dateString.includes('T') && !dateString.endsWith('Z') && !dateString.includes('+')) {
      date = new Date(dateString + 'Z');
    } else {
      date = new Date(dateString);
    }
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    // Obtener la zona horaria del navegador
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Formatear la fecha en la zona horaria del usuario
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: userTimeZone,
      hour12: false // Formato 24 horas
    });
  };

  // Volver a integradores
  const handleBack = () => {
    router.push('/admin/integradores');
  };

  // Paginación
  const totalPages = pagination.totalPages;
  const totalItems = pagination.totalItems;

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="text-center py-20">
      <Files className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {search || selectedCompany !== 'all' || resultFilter !== 'all' || startDate || endDate
          ? 'No se encontraron archivos que coincidan con los filtros'
          : 'No hay archivos cargados'
        }
      </h3>
      <p className="text-gray-500 dark:text-gray-500 mb-4">
        {search || selectedCompany !== 'all' || resultFilter !== 'all' || startDate || endDate
          ? 'Intenta ajustar los filtros de búsqueda'
          : 'Los archivos procesados aparecerán aquí'
        }
      </p>
      {(search || selectedCompany !== 'all' || resultFilter !== 'all' || startDate || endDate) && (
        <button
          onClick={clearFilters}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );

  // Componente de Skeleton para la tabla
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBack}
                      className="p-2 rounded-md bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] hover:bg-gray-50 dark:hover:bg-[#262636] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <Files className="w-6 h-6 text-primary" />
                        <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                          Archivos - {integrator?.name || 'Integrador'}
                        </h1>
                      </div>
                      <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                        Historial de archivos procesados por este integrador.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtros compactos */}
              <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Búsqueda por nombre de archivo */}
                  <div className="relative min-w-[250px]">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar archivo..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-gray-50 dark:bg-[#262636] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 focus:bg-white dark:focus:bg-[#1C1C24] transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Filtro por compañía */}
                  <div className="relative min-w-[180px]">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-gray-50 dark:bg-[#262636] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 focus:bg-white dark:focus:bg-[#1C1C24] transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">Todas las compañías</option>
                      {companies.map(company => (
                        <option key={company.idCustomerIntegrator} value={company.idCustomerIntegrator}>
                          {company.companyName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                    </div>
                  </div>

                  {/* Filtro por resultado */}
                  <div className="relative min-w-[140px]">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <CheckCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <select
                      value={resultFilter}
                      onChange={(e) => setResultFilter(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-gray-50 dark:bg-[#262636] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 focus:bg-white dark:focus:bg-[#1C1C24] transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">Todos</option>
                      <option value="success">Exitosos</option>
                      <option value="error">Errores</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                    </div>
                  </div>

                  {/* Fecha desde */}
                  <div className="relative min-w-[140px]">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Desde"
                      className="w-full pl-9 pr-3 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-gray-50 dark:bg-[#262636] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 focus:bg-white dark:focus:bg-[#1C1C24] transition-all"
                    />
                  </div>

                  {/* Fecha hasta */}
                  <div className="relative min-w-[140px]">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="Hasta"
                      className="w-full pl-9 pr-3 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-gray-50 dark:bg-[#262636] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 focus:bg-white dark:focus:bg-[#1C1C24] transition-all"
                    />
                  </div>

                  {/* Botón limpiar filtros */}
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2C2C38] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3C3C48] transition-colors text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    Limpiar
                  </button>
                </div>

                {/* Indicador compacto de filtros activos */}
                {(search || selectedCompany !== 'all' || resultFilter !== 'all' || startDate || endDate) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#2C2C38]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Activos:</span>
                      {search && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          "{search.slice(0, 15)}{search.length > 15 ? '...' : ''}"
                          <button onClick={() => setSearch('')} className="hover:bg-primary/20 rounded-full p-0.5">
                            <XCircle className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedCompany !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs">
                          {companies.find(c => c.idCustomerIntegrator.toString() === selectedCompany)?.companyName?.slice(0, 20)}
                          <button onClick={() => setSelectedCompany('all')} className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5">
                            <XCircle className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {resultFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs">
                          {resultFilter === 'success' ? 'Exitosos' : 'Errores'}
                          <button onClick={() => setResultFilter('all')} className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5">
                            <XCircle className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {(startDate || endDate) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs">
                          {startDate || '...'} - {endDate || '...'}
                          <button onClick={() => { setStartDate(''); setEndDate(''); }} className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5">
                            <XCircle className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabla de archivos */}
            <div className="rounded-lg border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24] overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    {['Archivo', 'Estado y Descripción', 'Compañía', 'Usuario', 'Fecha de Carga'].map((label, i) => (
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
                  ) : files.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4">
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    files.map(file => {
                      // Extraer la primera palabra como estado y el resto como descripción
                      const description = file.integrationResultDescription || '';
                      const parts = description.split(/[.:](.+)/); // Split en el primer . o :
                      const statusWord = parts[0]?.trim() || '';
                      const restDescription = parts[1]?.trim() || '';
                      
                      // Determinar si es exitoso basado en la primera palabra
                      const isSuccess = statusWord.toLowerCase() === 'ok';
                      
                      return (
                        <tr key={file.idFile} className="hover:bg-gray-50 dark:hover:bg-[#262636] transition">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleViewContent(file)}
                              className="flex items-center gap-2 text-left hover:text-primary transition-colors group w-full"
                            >
                              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-primary" />
                              <span className="font-medium underline decoration-transparent group-hover:decoration-primary transition-all">
                                {file.fileName}
                              </span>
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                {isSuccess ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className={clsx(
                                  "text-xs font-medium px-2 py-1 rounded-full",
                                  isSuccess
                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                )}>
                                  {statusWord || (isSuccess ? 'Exitoso' : 'Error')}
                                </span>
                              </div>
                              {restDescription && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md" title={description}>
                                  {restDescription}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm">{file.companyName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm">{file.uploadedBy}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm">{formatDate(file.uploadDate)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Paginación */}
              {files.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-[#2C2C38] gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {Math.min((pagination.page - 1) * pagination.pageSize + 1, totalItems)} - {Math.min(pagination.page * pagination.pageSize, totalItems)} de {totalItems}
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
                    <span className="flex items-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
                      Página {pagination.page} de {totalPages}
                    </span>
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

        {/* Modal de contenido del archivo */}
        <FileContentModal
          isOpen={contentModalOpen}
          onClose={handleCloseContentModal}
          file={selectedFile}
          onError={handleModalError}
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