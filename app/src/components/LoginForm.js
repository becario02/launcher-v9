'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import ErrorIniciarSesion from './ErrorIniciarSesion';
import MensajeOlvidasteContraseña from './MensajeOlvidasteContraseña';
import FormRecuperarContraseña from './FormRecuperarContraseña';
import MensajeExitoRecuperarContraseña from './MensajeExitoRecuperarContraseña';
import { recuperarContraseña } from '@/services/api/recuperarContraseña';

const LoginForm = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [modalStates, setModalStates] = useState({
    error: false,
    contraseña: false,
    recuperarForm: false,
    exito: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      Cookies.set('auth', 'dummy-token', { expires: 7 });
      login({ 
        username: formData.username || 'demo_user',
      });
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setModalStates(prev => ({ ...prev, error: true }));
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = (modalName) => {
    setModalStates(prev => ({ ...prev, [modalName]: false }));
  };

  const handleRecuperarSubmit = async (formData) => {
    try {
      await recuperarContraseña.enviarCorreo(formData.email);
      handleModalClose('recuperarForm');
      setModalStates(prev => ({ ...prev, exito: true }));
    } catch (error) {
      setModalStates(prev => ({ ...prev, error: true }));
    }
    
  };

  const renderModals = () => (
    <>
      {modalStates.error && (
        <div className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center">
          <ErrorIniciarSesion onClose={() => handleModalClose('error')} />
        </div>
      )}

      {modalStates.contraseña && (
        <div className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center">
          <MensajeOlvidasteContraseña
            onClose={() => handleModalClose('contraseña')}
            onContinue={() => {
              handleModalClose('contraseña');
              setModalStates(prev => ({ ...prev, recuperarForm: true }));
            }}
          />
        </div>
      )}

      {modalStates.recuperarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center">
          <FormRecuperarContraseña
            onClose={() => handleModalClose('recuperarForm')}
            onSubmit={handleRecuperarSubmit}
          />
        </div>
      )}

      {modalStates.exito && (
        <div className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center">
          <MensajeExitoRecuperarContraseña
            onClose={() => handleModalClose('exito')}
            onContinue={() => handleModalClose('exito')}
          />
        </div>
      )}
    </>
  );

  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-white relative">
      <div className="w-full max-w-md">
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
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            Ingresa a tu cuenta
          </h1>
          <p className="text-gray-500 text-sm">
            Bienvenido de nuevo, ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>
        
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
                placeholder="correo@dominio.com"
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
                placeholder="Contraseña"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setModalStates(prev => ({ ...prev, contraseña: true }))}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ¿Olvidaste tu contraseña?
            </button>
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
      {renderModals()}
    </div>
  );
};

export default LoginForm;