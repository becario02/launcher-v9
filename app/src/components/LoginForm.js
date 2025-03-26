'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';

const LoginForm = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulated authentication
      Cookies.set('auth', 'dummy-token', { expires: 7 });
      login({ 
        username: formData.username || 'demo_user',
      });
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <Image
            src="/logoAdvan.svg"
            alt="Advan Logo"
            width={160}
            height={50}
            className="h-auto"
            priority
          />
        </div>
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            Ingresa a tu cuenta
          </h1>
          <p className="text-gray-500 text-sm">
            Bienvenido de nuevo, ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="luis.gonzalez@gmail.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="••••••••••"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link href="#" className="text-sm text-gray-600 hover:text-gray-800">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors
              disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            ¿Tienes problemas para accesar? 
            <Link href="#" className="text-gray-800 hover:underline ml-1">
              Solicita acceso
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;