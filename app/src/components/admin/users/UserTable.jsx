'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, ChevronRight, ChevronLeft, Database, Pencil, X } from 'lucide-react';

export default function UserTable({
  users,
  isLoading,
  page,
  pageSize,
  totalUsers,
  search,
  onPageChange,
  onEditUser
}) {
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [connectionsForUser, setConnectionsForUser] = useState([]);

  const openConnectionsModal = (connections) => {
    setConnectionsForUser(connections);
    setShowConnectionsModal(true);
  };

  const closeConnectionsModal = () => {
    setShowConnectionsModal(false);
    setConnectionsForUser([]);
  };

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

  function formatServer(server) {
    if (!server) return '';
    let hostPart = server;
    let portOrInstance = '';
    if (server.includes(':')) {
      [hostPart, portOrInstance] = server.split(':');
      portOrInstance = ':' + portOrInstance;
    } else if (server.includes('\\')) {
      [hostPart, portOrInstance] = server.split('\\');
      portOrInstance = '\\' + portOrInstance;
    }
    const parts = hostPart.split('.');
    const last = parts.pop();
    const maskedParts = parts.map(part => '*'.repeat(part.length));
    return maskedParts.concat(last).join('.') + portOrInstance;
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24] overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              {['Nombre', 'Correo', 'Usuario', 'Perfil', 'Conexiones', 'Acciones'].map((label, i) => (
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
              [...Array(pageSize)].map((_, index) => <TableRowSkeleton key={index} />)
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  {search ? `No se encontraron usuarios que coincidan con "${search}"` : 'No hay usuarios registrados'}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.idUser} className="hover:bg-gray-50 dark:hover:bg-[#262636] transition">
                  <td className="px-6 py-4">{user.fullname}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.username}</td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        'px-2 py-1 rounded-full text-p',
                        user.profileName.includes('ADMIN')
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-white'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white'
                      )}
                    >
                      {user.profileName.includes('ADMIN') ? 'ADMIN' : user.profileName.replace('USER', '')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.connections?.length > 0 ? (
                      <button
                        onClick={() => openConnectionsModal(user.connections)}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        <Database className="w-4 h-4" />
                        {user.connections.length} conexiones
                      </button>
                    ) : (
                      <span className="text-gray-400 italic">Sin conexiones</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onEditUser(user)}
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
              <>
                Mostrando {Math.min((page - 1) * pageSize + 1, totalUsers)} - {Math.min(page * pageSize, totalUsers)} de {totalUsers}
              </>
            ) : (
              'No hay resultados'
            )}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1 || isLoading || totalUsers === 0}
              onClick={() => onPageChange(page - 1)}
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
              onClick={() => onPageChange(page + 1)}
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

      {/* Modal de conexiones */}
      {showConnectionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-[#1C1C24] rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={closeConnectionsModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Conexiones</h2>
            {connectionsForUser.length > 0 ? (
              <ul className="space-y-3">
                {connectionsForUser.map((conn, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-gray-100 dark:bg-[#2C2C38] rounded-md p-3">
                    <Database className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col text-sm w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-gray-900 dark:text-white">{conn.nameErpDb}</span>
                        {/* Etiqueta de tipo de base de datos */}
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 text-white text-[10px] rounded-[25px] flex-shrink-0 font-medium ${
                          conn.environment === 'TEST' 
                            ? 'bg-gray-500 dark:bg-gray-600' 
                            : 'bg-primary'
                        }`}>
                          {conn.environment === 'TEST' ? 'PRUEBAS' : 'PRODUCCIÓN'}
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{formatServer(conn.serverErpDb)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin conexiones.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}