'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { recuperarContraseña } from '@/services/api/recuperarContraseña';

const NuevaContraseñaForm = ({ encryptedData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    encryptedData: encryptedData
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      await recuperarContraseña.cambiarContraseñaConToken(
        formData.encryptedData, 
        formData.password
      );
      setSuccess(true);
    } catch (error) {
      setError( error.message );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-full max-w-md bg-white p-8 text-center">
          <div className="mb-6">
            <Image
              src="/logoAdvan.svg"
              alt="Advan Logo"
              width={160}
              height={50}
              className="h-auto mx-auto"
              priority
            />
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">¡Contraseña actualizada!</h2>
          <p className="text-gray-600 mb-6">Tu contraseña ha sido cambiada exitosamente.</p>
          
          <Link href="/login" className="block w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors text-center">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white p-8">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logoAdvan.svg"
            alt="Advan Logo"
            width={150}
            height={40}
            className="h-auto"
            priority
          />
        </div>
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            Crear nueva contraseña
          </h1>
          <p className="text-gray-500 text-sm">
            Ingresa y confirma tu nueva contraseña
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Nueva Contraseña"
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Confirmar Contraseña"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors
              disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NuevaContraseñaForm;