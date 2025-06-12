'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

export default function ChangeErpPasswordModal({
  companyName,
  userErpDb,
  serverErpDb,
  nameErpDb,
  idUserCompany,
  onClose,
  onSave,
  showNotification
}) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [visible, setVisible] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  useEffect(() => {
    const listener = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };

  const toggleVisibility = (field) => {
    setVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const formatServer = (server) => {
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
    const maskedParts = parts.map((part) => '*'.repeat(part.length));
    return maskedParts.concat(last).join('.') + portOrInstance;
  };

  const validate = () => {
    const { currentPassword, newPassword, confirmPassword } = form;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'Todos los campos son obligatorios';
    }
    if (newPassword !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    if (newPassword.length < 8) return 'Debe tener mínimo 8 caracteres';
    if (!/[a-z]/.test(newPassword)) return 'Debe incluir una letra minúscula';
    if (!/[A-Z]/.test(newPassword)) return 'Debe incluir una letra mayúscula';
    if (!/[0-9]/.test(newPassword)) return 'Debe incluir un número';
    if (!/[^a-zA-Z0-9]/.test(newPassword)) return 'Debe incluir un carácter especial';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
        setError(msg);
        return;
    }

    setIsSubmitting(true); // 🔒 deshabilita el botón
    await enviarCambioPassword();
  };


  const isFormValid = () => {
    const { currentPassword, newPassword, confirmPassword } = form;
    return (
      currentPassword &&
      newPassword &&
      confirmPassword &&
      newPassword === confirmPassword &&
      newPassword.length >= 8 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[^a-zA-Z0-9]/.test(newPassword)
    );
  };

  const login = async () => {
    try {
        const response = await fetch('http://localhost:5293/mserpservice/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'admin',
            password: 'Hola'
        })
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data.accessToken;
    } catch (err) {
        console.error('Error en login:', err);
        return null;
    }
    };

    const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await fetch('http://localhost:5293/mserpservice/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) throw new Error('Refresh failed');

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data.token;
    } catch (err) {
        console.error('Error al refrescar token:', err);
        return null;
    }
    };

    const enviarCambioPassword = async () => {
      let token = await login();

      try {
          
          const configRes = await fetch('/api/configurations');
          const configJson = await configRes.json();

          const configuraciones = configJson.data || [];

          const usuarioAdmin = configuraciones.find(c => c.configName === 'SQLSERVER_USER_MASTER')?.configValue;
          const passwordAdmin = configuraciones.find(c => c.configName === 'SQLSERVER_PASSWORD_MASTER')?.configValue;

          if (!usuarioAdmin || !passwordAdmin) {
              throw new Error('No se pudieron obtener las credenciales del admin');
          }

          const payload = {
              server: serverErpDb.replace(':', ','),
              usuarioOriginal: userErpDb,
              passwordOriginal: form.currentPassword,
              nuevaPassword: form.newPassword,
              usuarioAdmin,
              passwordAdmin,
              baseDatos: nameErpDb
          };

          const response = await fetch('http://localhost:5293/mserpservice/api/cambiar-password', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(payload)
          });

          if (response.status === 404) {
              token = await refreshToken();
              if (!token) return setError('Error al refrescar token');

              const retryResponse = await fetch('http://localhost:5293/mserpservice/api/cambiar-password', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify(payload)
              });

              if (!retryResponse.ok) throw new Error('Error al cambiar contraseña tras refrescar token');

              const retryData = await retryResponse.json();
              showNotification('success', retryData.message, 'toast');

              await fetch('/api/update-password-erpdb', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      idUserCompany: idUserCompany,
                      passwordErpDb: form.newPassword
                  })
              });

          } else if (!response.ok) {
              throw new Error('Error al cambiar contraseña');
          } else {
              const data = await response.json();
              showNotification('success', data.message, 'toast');

              await fetch('/api/update-password-erpdb', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      idUserCompany: idUserCompany,
                      passwordErpDb: form.newPassword
                  })
              });
          }

          onSave(form);
          handleClose();

      } catch (err) {
          console.error(err);
          setError('Error al cambiar contraseña');
          showNotification('error', 'Error al cambiar contraseña', 'toast');
      }
    };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-poppins transition-opacity"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-[#1C1C24] rounded-xl w-full max-w-md shadow-xl transition-all duration-300 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-2 border-b border-gray-200 dark:border-[#2C2C38]">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Cambiar contraseña ERP
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 pt-4 space-y-1 text-sm text-[#696974] dark:text-[#92929d]">
          <p>
            Empresa:{' '}
            <span className="font-medium text-gray-800 dark:text-white">{companyName}</span>
          </p>
          <p>
            Usuario ERP:{' '}
            <span className="font-medium text-gray-800 dark:text-white">{userErpDb}</span>
          </p>
          <p>
            Servidor:{' '}
            <span className="font-medium text-gray-800 dark:text-white">
              {formatServer(serverErpDb)}
            </span>
          </p>
          <p>
            Base de datos:{' '}
            <span className="font-medium text-gray-800 dark:text-white">{nameErpDb}</span>
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5">
          {/* Contraseña actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña actual
            </label>
            <div className="relative">
              <input
                type={visible.current ? 'text' : 'password'}
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña actual"
                className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('current')}
                className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
              >
                {visible.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={visible.new ? 'text' : 'password'}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('new')}
                className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
              >
                {visible.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1 pl-5 list-disc">
              <li className={form.newPassword.length >= 8 ? 'text-green-500' : ''}>
                Mínimo 8 caracteres
              </li>
              <li className={/[a-z]/.test(form.newPassword) ? 'text-green-500' : ''}>
                Al menos una letra minúscula
              </li>
              <li className={/[A-Z]/.test(form.newPassword) ? 'text-green-500' : ''}>
                Al menos una letra mayúscula
              </li>
              <li className={/[0-9]/.test(form.newPassword) ? 'text-green-500' : ''}>
                Al menos un número
              </li>
              <li className={/[^a-zA-Z0-9]/.test(form.newPassword) ? 'text-green-500' : ''}>
                Al menos un carácter especial
              </li>
            </ul>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <input
                type={visible.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirma tu nueva contraseña"
                className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('confirm')}
                className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
              >
                {visible.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.newPassword && form.confirmPassword && (
              <p
                className={`text-xs mt-1 ${
                  form.newPassword === form.confirmPassword ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {form.newPassword === form.confirmPassword
                  ? 'Las contraseñas coinciden'
                  : 'Las contraseñas no coinciden'}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`px-4 py-2 rounded-md text-white transition-opacity ${
                  !isFormValid() || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:opacity-90'
              }`}
             >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}