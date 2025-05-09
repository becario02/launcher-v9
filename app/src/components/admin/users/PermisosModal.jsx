'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

export default function PermissionsModal({ isOpen, users, onClose, onSave }) {
  const [permissions, setPermissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPermissions({});
      setSearchTerm('');
    } else {
      const initialPermissions = {};
      users.forEach(u => {
        initialPermissions[u.idUser] = { customOption: false, dashboard: false };
      });
      setPermissions(initialPermissions);
    }
  }, [isOpen, users]);

  const togglePermission = (userId, type) => {
    setPermissions(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [type]: !prev[userId][type] }
    }));
  };

  const toggleAll = (type) => {
    const allChecked = users.every(u => permissions[u.idUser]?.[type]);
    const updated = {};
    users.forEach(u => {
      updated[u.idUser] = {
        ...permissions[u.idUser],
        [type]: !allChecked
      };
    });
    setPermissions(updated);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    onSave(permissions);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative bg-[#1c1c24] rounded-2xl shadow-2xl max-w-3xl w-full p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-h3 font-bold text-white">Configurar Permisos de Acceso</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition">
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
            className="w-64 rounded-lg bg-gray-800 text-p text-gray-200 px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* TABLE HEADER */}
        <div className="grid grid-cols-3 gap-6 pb-2 border-b border-gray-700 text-p font-semibold text-gray-400">
          <div>Usuario</div>
          <div className="text-center flex items-center justify-center gap-2">
            Custom Option
            <button
              onClick={() => toggleAll('customOption')}
              className="flex items-center gap-1 text-xs text-primary bg-primary/10 rounded-full px-2 py-1 hover:bg-primary/20 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Seleccionar todo
            </button>
          </div>
          <div className="text-center flex items-center justify-center gap-2">
            Dashboard
            <button
              onClick={() => toggleAll('dashboard')}
              className="flex items-center gap-1 text-xs text-primary bg-primary/10 rounded-full px-2 py-1 hover:bg-primary/20 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Seleccionar todo
            </button>
          </div>
        </div>

        {/* USERS LIST */}
        <div className="divide-y divide-gray-700 overflow-y-auto max-h-60">
          {filteredUsers.map((user) => (
            <div
              key={user.idUser}
              className="grid grid-cols-3 gap-6 py-3 items-center text-gray-200 hover:bg-gray-800 rounded-lg transition"
            >
              <div className="flex flex-col pl-4">
                <span className="font-medium text-p">{user.fullname}</span>
                <span className="text-p text-gray-400">{user.email}</span>
              </div>

              <div className="flex justify-center">
                {/* SWITCH */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions[user.idUser]?.customOption || false}
                    onChange={() => togglePermission(user.idUser, 'customOption')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary transition"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></div>
                </label>
              </div>
              <div className="flex justify-center">
                {/* SWITCH */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions[user.idUser]?.dashboard || false}
                    onChange={() => togglePermission(user.idUser, 'dashboard')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary transition"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></div>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6 text-p">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[20px] bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-[20px] font-semibold bg-primary text-white hover:bg-primary/90 transition"
          >
            Guardar Permisos
          </button>
        </div>
      </div>
    </Dialog>
  );
}