'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import CategoryPermissionsModal from './CategoryPermissionsModal';

export default function PermissionsModal({
  isOpen,
  users,
  onClose,
  onSave,
  dashboards,
  customOptions
}) {
  const [permissions, setPermissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeType, setActiveType] = useState(null);

  const handleOpenSubModal = (userId, type) => {
    setActiveUserId(userId);
    setActiveType(type);
  };

  const handleCloseSubModal = () => {
    setActiveUserId(null);
    setActiveType(null);
  };

  useEffect(() => {
    if (!isOpen) {
      setPermissions({});
      setSearchTerm('');
    } else {
      const initialPermissions = {};
      users.forEach(u => {
        const perms = {};
        customOptions.forEach(opt => {
          perms[`custom_${opt.idCustomOption}`] = false;
        });
        dashboards.forEach(d => {
          perms[`dashboard_${d.id}`] = false;
        });
        initialPermissions[u.idUser] = perms;
      });
      setPermissions(initialPermissions);
    }
  }, [isOpen, users, customOptions, dashboards]);

  const filteredUsers = users.filter(
    (u) =>
      u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative bg-white dark:bg-[#1c1c24] rounded-2xl shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-h3 font-bold text-gray-900 dark:text-white">
            Configurar Permisos de Acceso
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* SEARCH */}
        <div className="flex items-center justify-start mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-4 py-2 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* TABLE HEADER (solo desktop) */}
        <div className="hidden sm:grid grid-cols-3 gap-6 pb-2 border-b border-gray-300 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-400">
          <div>Usuario</div>
          <div className="text-center">Opciones Personalizadas</div>
          <div className="text-center">Dashboards</div>
        </div>

        {/* USERS LIST */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto max-h-64 space-y-2 sm:space-y-0">
          {filteredUsers.length === 0 ? (
            <div className="flex justify-center items-center py-6 text-gray-500 dark:text-gray-400 text-sm">
              No se encontraron usuarios con ese nombre o correo.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.idUser}
                className="py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                {/* Desktop layout */}
                <div className="hidden sm:grid grid-cols-3 gap-6 items-center">
                  <div className="flex flex-col pl-4">
                    <span className="font-medium">{user.fullname}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{user.email}</span>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleOpenSubModal(user.idUser, 'custom')}
                      className="text-primary hover:underline"
                    >
                      Configurar
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleOpenSubModal(user.idUser, 'dashboard')}
                      className="text-primary hover:underline"
                    >
                      Configurar
                    </button>
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="sm:hidden bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                  <div>
                    <p className="font-semibold">{user.fullname}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <button
                      onClick={() => handleOpenSubModal(user.idUser, 'custom')}
                      className="text-primary font-medium"
                    >
                      Custom
                    </button>
                    <button
                      onClick={() => handleOpenSubModal(user.idUser, 'dashboard')}
                      className="text-primary font-medium"
                    >
                      Dashboards
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* NOTA INFORMATIVA */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
          Da clic en “Configurar” para asignar permisos individualmente.
        </p>

        {/* SUB MODAL */}
        {activeUserId && (
          <CategoryPermissionsModal
            isOpen={!!activeUserId}
            onClose={handleCloseSubModal}
            userId={activeUserId}
            type={activeType}
            options={activeType === 'custom' ? customOptions : dashboards}
            permissions={permissions}
            setPermissions={setPermissions}
          />
        )}
      </div>
    </Dialog>
  );
}