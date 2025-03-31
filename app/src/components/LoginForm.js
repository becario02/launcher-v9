'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import VerificationMethod from './VerificationMethod';
import TokenInput from './TokenInput';
import axios from 'axios';

const LoginForm = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('login'); // login | method | token
  const [error, setError] = useState('');
  const [ip, setIp] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const rawLang = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US';
  const language = rawLang.startsWith('es') ? 'es-MX' : 'en-US';

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5173/mslauncher/api/v1/login',
        {
          username: formData.username,
          password: formData.password,
          ipHostUser: ip,
          digitToken: null
        },
        {
          headers: {
            'Accept-Language': language,
            'Content-Type': 'application/json'
          },
          validateStatus: () => true,
        }
      );

      const message = response.data.message || response.data.Message;

      if (message === 'Usuario o contraseña incorrectos' || message === 'Invalid username or password') {
        setError(message);
      } else if (message.startsWith('Se ha detectado') || message.startsWith('New device detected')) {
        setStep('method');
      } else if (message === 'Inicio de sesión exitoso' || message === 'Login successful') {
        Cookies.set('auth', 'dummy-token', { expires: 7 });
        login({ username: formData.username });
      } else {
        setError(message);
      }

    } catch (error) {
      console.error('Error de conexión:', error);
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelected = () => setStep('token');

  const handleTokenSubmit = async (token) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5173/mslauncher/api/v1/login',
        {
          username: formData.username,
          password: formData.password,
          ipHostUser: ip,
          digitToken: token
        },
        {
          headers: {
            'Accept-Language': language,
            'Content-Type': 'application/json'
          },
          validateStatus: () => true,
        }
      );

      const message = response.data.message || response.data.Message;

      if (message === 'El código ingresado es incorrecto' || message === 'The verification code is incorrect') {
        setError(message);
      } else if (message === 'Inicio de sesión exitoso' || message === 'Login successful') {
        Cookies.set('auth', 'dummy-token', { expires: 7 });
        login({ username: formData.username });
      } else {
        setError(message);
      }

    } catch (error) {
      console.error('Error al verificar token:', error);
      setError('No se pudo verificar el código');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'method') {
    return (
      <VerificationMethod
        onMethodSelected={handleMethodSelected}
        onBack={() => {
          setError('');
          setStep('login');
        }}
      />
    );
  }

  if (step === 'token') {
    return (
      <TokenInput
        onSubmitToken={handleTokenSubmit}
        error={error}
        loading={loading}
        onBack={() => {
          setError('');
          setStep('method');
        }}
      />
    );
  }

  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-white h-screen">
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

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-2">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

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
