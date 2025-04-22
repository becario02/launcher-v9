'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { Pencil, PlusCircle, User, ChevronDown, Database, ChevronRight, ChevronLeft, Search, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import UserFormModal from '@/components/UserFormModal';
import Toast from '@/components/Toast'; // Importamos el componente Toast

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCompanies, setExpandedCompanies] = useState({});

  // Estados para paginación
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Estado para búsqueda
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Estado para manejar el toast
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  const fetchUsers = () => {
    setIsLoading(true);
    axios
      .get('http://localhost:5173/mslauncher/api/v1/users', {
        params: { page, pageSize, search }
      })
      .then(res => {
        setUsers(res.data.data || []);
        setTotalUsers(res.data.total || 0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 400); // pequeño debounce para evitar exceso de llamadas
    
    return () => clearTimeout(delayDebounce);
  }, [page, search]);

  const handleUserSubmit = async (data) => {
    try {
      if (editingUser) {
        // Update
        const response = await axios.put(`http://localhost:5173/mslauncher/api/v1/users/${editingUser.idUser}`, data);
        
        // Verificar si hay un código de error en la respuesta
        if (response.data && response.data.statusCode === "409") {
          setToast({
            visible: true,
            message: response.data.message || 'El nombre de usuario ya está en uso',
            type: 'error'
          });
          // No cerramos el modal para que el usuario pueda corregir
          return;
        }
        
        // Si no hay error, mostrar éxito
        setToast({
          visible: true,
          message: 'Usuario actualizado exitosamente',
          type: 'success'
        });
        setModalOpen(false);
        setEditingUser(null);
      } else {
        // Create
        const response = await axios.post('http://localhost:5173/mslauncher/api/v1/users/admin', data);
        
        // Verificar si hay un código de error en la respuesta
        if (response.data && response.data.statusCode === "409") {
          setToast({
            visible: true,
            message: response.data.message || 'El nombre de usuario ya está en uso',
            type: 'error'
          });
          // No cerramos el modal para que el usuario pueda corregir
          return;
        }
        
        // Si no hay error, mostrar éxito
        setToast({
          visible: true,
          message: 'Usuario creado exitosamente',
          type: 'success'
        });
        setModalOpen(false);
      }
      fetchUsers();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      
      // Verificar si es un error de usuario duplicado
      if (err.response) {
        if (err.response.status === 409 || (err.response.data && err.response.data.statusCode === "409")) {
          // No cerramos el modal para que el usuario pueda corregir
          setToast({
            visible: true,
            message: err.response.data?.message || 'El nombre de usuario ya está en uso',
            type: 'error'
          });
          return;
        }
      }
      
      // Otro tipo de error
      setToast({
        visible: true,
        message: 'Error al guardar el usuario. Inténtalo de nuevo.',
        type: 'error'
      });
      setModalOpen(false);
      setEditingUser(null);
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearch('');
    setPage(1);
  };

  // Función para manejar la expansión/colapso de conexiones
  const toggleConnectionsVisibility = (userId, companyIndex) => {
    setExpandedCompanies(prev => {
      const key = `${userId}-${companyIndex}`;
      return {
        ...prev,
        [key]: !prev[key]
      };
    });
  };

  // Comprobar si una compañía está expandida
  const isCompanyExpanded = (userId, companyIndex) => {
    const key = `${userId}-${companyIndex}`;
    return !!expandedCompanies[key];
  };

  // Manejar el cierre del toast
  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Componente de Skeleton para una fila de la tabla
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </td>
    </tr>
  );

  return (
    <div className="flex font-poppins overflow-hidden">
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
        <div className="fixed top-0 right-0 left-0 md:left-60 z-20">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Main */}
        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-36 pb-14 px-4 md:px-8 xl:px-10 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-6 h-6 text-primary" />
                    <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                      Administración de Usuarios
                    </h1>
                  </div>
                  <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                    Lista de usuarios registrados en la plataforma.
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => {
                    setEditingUser(null);
                    setModalOpen(true);
                  }}
                >
                  <PlusCircle className="w-4 h-4" />
                  Nuevo usuario
                </button>
              </div>
              
              {/* Buscador */}
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo o usuario..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1); // reinicia a la primera página al buscar
                  }}
                  className="w-full pl-10 pr-10 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                />
                {search && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabla */}
            <div className="rounded-lg border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24] overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    {['Nombre', 'Correo', 'Usuario', 'Perfil', 'Compañías', 'Acciones'].map((label, i) => (
                      <th key={i} className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {label}
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2C2C38] text-gray-800 dark:text-gray-200">
                  {isLoading ? (
                    // Skeleton loading state con múltiples filas
                    <>
                      {[...Array(pageSize)].map((_, index) => (
                        <TableRowSkeleton key={index} />
                      ))}
                    </>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        {search ? `No se encontraron usuarios que coincidan con "${search}"` : 'No hay usuarios registrados'}
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.idUser} className="hover:bg-gray-50 dark:hover:bg-[#262636] transition">
                        <td className="px-6 py-4">{user.fullname}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">{user.username}</td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            'px-2 py-1 rounded-full text-xs',
                            user.profileName.includes('ADVAN')
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-white'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white'
                          )}>
                            {user.profileName.includes('ADVAN') 
                              ? 'ADVAN' 
                              : user.profileName.replace('Administrador ', '')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.companies?.length ? (
                            <ul className="space-y-3">
                              {user.companies.map((comp, index) => (
                                <li key={index}>
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium text-gray-800 dark:text-white">
                                      {comp.companyName}
                                    </div>
                                    
                                    {comp.connections?.length > 0 && (
                                      <button
                                        onClick={() => toggleConnectionsVisibility(user.idUser, index)}
                                        className={clsx(
                                          "p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition",
                                          "flex items-center justify-center"
                                        )}
                                        title="Ver conexiones"
                                      >
                                        <Database className="w-3.5 h-3.5 mr-1" />
                                        <span className="text-xs">{comp.connections.length}</span>
                                        <ChevronRight 
                                          className={clsx(
                                            "w-3 h-3 transition-transform", 
                                            isCompanyExpanded(user.idUser, index) ? "rotate-90" : ""
                                          )} 
                                        />
                                      </button>
                                    )}
                                  </div>
                                  
                                  {comp.connections?.length > 0 && isCompanyExpanded(user.idUser, index) && (
                                    <div className="mt-2 ml-4 p-2 border-l-2 border-gray-200 dark:border-gray-700">
                                      <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                                        {comp.connections.map((conn, idx) => (
                                          <li key={idx} className="flex items-center px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded">
                                            <Database className="w-3 h-3 mr-2 text-primary" />
                                            <span>
                                              <span className="font-medium">{conn.nameErpDb}</span>
                                              <span className="mx-1">@</span>
                                              <span className="text-gray-500 dark:text-gray-400">{conn.serverErpDb}</span>
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {!comp.connections?.length && (
                                    <div className="ml-4 text-xs italic text-gray-400 dark:text-gray-500">
                                      Sin conexiones
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400 italic">Sin compañías</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          >
                            <Pencil className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-medium">Editar</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Paginación */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-[#2C2C38] text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {totalUsers > 0 ? (
                    <>Mostrando {Math.min((page - 1) * pageSize + 1, totalUsers)} - {Math.min(page * pageSize, totalUsers)} de {totalUsers}</>
                  ) : (
                    'No hay resultados'
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1 || isLoading || totalUsers === 0}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className={clsx(
                      "inline-flex items-center px-3 py-1.5 rounded text-gray-700 dark:text-gray-200",
                      "transition focus:outline-none",
                      page === 1 || isLoading || totalUsers === 0
                        ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#2C2C38]"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48]"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </button>
                  <button
                    disabled={page * pageSize >= totalUsers || isLoading || totalUsers === 0}
                    onClick={() => setPage(prev => prev + 1)}
                    className={clsx(
                      "inline-flex items-center px-3 py-1.5 rounded text-gray-700 dark:text-gray-200",
                      "transition focus:outline-none",
                      page * pageSize >= totalUsers || isLoading || totalUsers === 0
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

        {/* Modal */}
        <UserFormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleUserSubmit}
          initialData={editingUser}
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