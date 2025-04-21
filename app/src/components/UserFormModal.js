'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { usePrimaryColor } from '@/context/primaryColor';

export default function UserFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const { primaryColor } = usePrimaryColor();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    username: '',
    password: ''
  });

  // ✅ Resetea el formulario al abrir el modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          fullname: initialData.fullname || '',
          email: initialData.email || '',
          username: initialData.username || '',
          password: ''
        });
      } else {
        setFormData({
          fullname: '',
          email: '',
          username: '',
          password: ''
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-[#1C1C24] rounded-xl w-full max-w-lg shadow-xl p-6 relative font-poppins">
        {/* Botón cerrar */}
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          {initialData ? 'Editar usuario' : 'Crear nuevo usuario'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Nombre completo</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Nombre de usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!initialData} // solo requerida si es nuevo
              className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white"
              placeholder={initialData ? '••••••••' : ''}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className={clsx(
                'px-5 py-2 rounded-md text-white font-medium text-sm shadow',
                'hover:opacity-90 transition',
              )}
              style={{ backgroundColor: primaryColor }}
            >
              {initialData ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
