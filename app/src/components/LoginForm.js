'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import ErrorIniciarSesion from './ErrorIniciarSesion';
import MensajeOlvidasteContraseña from './MensajeOlvidasteContraseña';
import FormRecuperarContraseña from './FormRecuperarContraseña';
import MensajeExitoRecuperarContraseña from './MensajeExitoRecuperarContraseña';
import VerificationMethod from './VerificationMethod';
import TokenInput from './TokenInput';
import { recuperarContraseña } from '@/services/api/recuperarContraseña';
import axios from 'axios';

export default function LoginForm() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('login'); // 'login' | 'method' | 'token'
  const [error, setError] = useState('');
  const [ip, setIp] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [modalStates, setModalStates] = useState({
    error: false,
    contraseña: false,
    recuperarForm: false,
    exito: false
  });

  const rawLang =
    typeof navigator !== 'undefined'
      ? navigator.language || 'en-US'
      : 'en-US';
  const language = rawLang.startsWith('es') ? 'es-MX' : 'en-US';

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveSession = userData => {
    const companies = userData.connections || [];
    Cookies.set('auth', 'dummy-token', { expires: 7 });
    Cookies.set('idUser', userData.idUser, { expires: 7 });
    Cookies.set('fullname', userData.fullname, { expires: 7 });
    Cookies.set('companyName', companies[0]?.name || '', { expires: 7 });
    Cookies.set('urlErp', companies[0]?.urlErp || '', { expires: 7 });
    Cookies.set('passwordErpDb', userData.passwordErpDb, { expires: 7 });
    Cookies.set('serverErpDb', userData.serverErpDb, { expires: 7 });
    Cookies.set('nameErpDb', userData.nameErpDb, { expires: 7 });
    localStorage.setItem(
      'userData',
      JSON.stringify({ data: companies })
    );
    localStorage.removeItem('selectedCompany');

    login({
      username: formData.username,
      idUser: userData.idUser,
      fullname: userData.fullname,
      idCompany : companies[0]?.idCompany || '',
      companyName: companies[0]?.name || '',
      urlErp: companies[0]?.urlErp || '',
      passwordErpDb: userData.passwordErpDb,
      serverErpDb: userData.serverErpDb,
      nameErpDb: userData.nameErpDb
    });

    setTimeout(() => window.location.reload(), 100);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
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
          validateStatus: () => true
        }
      );
      const msg = res.data.message || res.data.Message;
      if (
        msg === 'Usuario o contraseña incorrectos' ||
        msg === 'Invalid username or password'
      ) {
        setError(msg);
      } else if (
        msg.startsWith('Se ha detectado') ||
        msg.startsWith('New device detected')
      ) {
        setStep('method');
      } else if (
        msg === 'Inicio de sesión exitoso' ||
        msg === 'Login successful'
      ) {
        saveSession(res.data.data);
        return;
      } else {
        setError(msg);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = async token => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
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
          validateStatus: () => true
        }
      );
      const msg = res.data.message || res.data.Message;
      if (
        msg === 'El código ingresado es incorrecto' ||
        msg === 'The verification code is incorrect'
      ) {
        setError(msg);
      } else if (
        msg === 'Inicio de sesión exitoso' ||
        msg === 'Login successful'
      ) {
        saveSession(res.data.data);
        return;
      } else {
        setError(msg);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo verificar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelected = () => setStep('token');
  const handleModalClose = name =>
    setModalStates(prev => ({ ...prev, [name]: false }));
  const handleRecuperarSubmit = async ({ email }) => {
    try {
      await recuperarContraseña.enviarCorreo(email);
      setModalStates(prev => ({
        ...prev,
        recuperarForm: false,
        exito: true
      }));
    } catch {
      setModalStates(prev => ({ ...prev, error: true }));
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
        <div className="mb-12 flex justify-center">
          <Image
            src="/logoAdvan.svg"
            alt="Advan Logo"
            width={160}
            height={50}
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gray-400"
                placeholder="usuario"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gray-400"
                placeholder="********"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                setModalStates(prev => ({ ...prev, contraseña: true }))
              }
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>

      {modalStates.error && (
        <ErrorIniciarSesion onClose={() => handleModalClose('error')} />
      )}
      {modalStates.contraseña && (
        <MensajeOlvidasteContraseña
          onClose={() => handleModalClose('contraseña')}
          onContinue={() =>
            setModalStates(prev => ({
              ...prev,
              contraseña: false,
              recuperarForm: true
            }))
          }
        />
      )}
      {modalStates.recuperarForm && (
        <FormRecuperarContraseña
          onClose={() => handleModalClose('recuperarForm')}
          onSubmit={handleRecuperarSubmit}
        />
      )}
      {modalStates.exito && (
        <MensajeExitoRecuperarContraseña onClose={() => handleModalClose('exito')} />
      )}
    </div>
  );
}
