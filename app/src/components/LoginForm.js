'use client';

import { IconUser, IconLock, IconServer, IconDatabase, IconWorld, IconBrandLinkedin, IconBrandYoutube, IconBrandFacebook } from "@tabler/icons-react";
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/auth';
import Cookies from 'js-cookie';
import ErrorIniciarSesion from './ErrorIniciarSesion';
import MensajeOlvidasteContraseña from './MensajeOlvidasteContraseña';
import FormRecuperarContraseña from './FormRecuperarContraseña';
import MensajeExitoRecuperarContraseña from './MensajeExitoRecuperarContraseña';
import PropTypes from 'prop-types';

const InputField = ({ icon: Icon, placeholder, type = "text", value, onChange, name }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-4 flex items-center">
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-lg border border-gray-200 
        focus:outline-none focus:ring-2 focus:ring-[#00B1EA] focus:border-transparent 
        text-gray-700 placeholder-gray-500 text-base"
    />
  </div>
);

InputField.propTypes = {
  icon: PropTypes.elementType.isRequired,
  placeholder: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};

const socialIcons = [
  { icon: IconWorld, id: 'world', href: '#' },
  { icon: IconBrandLinkedin, id: 'linkedin', href: '#' },
  { icon: IconBrandYoutube, id: 'youtube', href: '#' },
  { icon: IconBrandFacebook, id: 'facebook', href: '#' }
];

const SocialButton = ({ icon: Icon, href = "#" }) => (
  <a
    href={href}
    className="w-11 h-11 flex items-center justify-center rounded-full border-2 
      border-[#00B1EA] text-[#00B1EA] hover:bg-[#00B1EA] hover:text-white 
      transition-colors duration-200"
  >
    <Icon className="w-5 h-5" strokeWidth={2} />
  </a>
);

SocialButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  href: PropTypes.string
};

const LoginForm = () => {
  const { login } = useAuth();
  const [modalStates, setModalStates] = useState({
    error: false,
    contraseña: false,
    recuperarForm: false,
    exito: false
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    server: '',
    database: ''
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
      login({ username: 'demo_user' });
    } catch (error) {
      setModalStates(prev => ({ ...prev, error: true }));
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = (modalName) => {
    setModalStates(prev => ({ ...prev, [modalName]: false }));
  };

  const handleRecuperarSubmit = () => {
    handleModalClose('recuperarForm');
    setModalStates(prev => ({ ...prev, exito: true }));
  };

  const renderMainContent = () => (
    <div className={`${Object.values(modalStates).some(Boolean) ? 'opacity-50' : 'opacity-100'} 
      transition-opacity duration-200`}>
      <div className="w-full p-8 md:p-10">
        <div className="flex justify-end">
          <Image
            src="/logoAdvan.svg"
            alt="Advan Logo"
            width={160}
            height={50}
            className="h-auto -m-2"
            priority
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20">
        <div className="w-full max-w-md space-y-12">
          <h1 className="text-[#00B1EA] text-4xl font-bold text-center">
            ¡Bienvenid@!
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              {['username', 'password', 'server', 'database'].map(field => (
                <InputField
                  key={field}
                  icon={{
                    username: IconUser,
                    password: IconLock,
                    server: IconServer,
                    database: IconDatabase
                  }[field]}
                  type={field === 'password' ? 'password' : 'text'}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                />
              ))}
            </div>

            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6">
              <button
                type="button"
                onClick={() => setModalStates(prev => ({ ...prev, contraseña: true }))}
                className="text-[#00B1EA] hover:text-[#0099D1] text-base"
              >
                ¿Olvidaste tu contraseña?
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-10 py-3.5 bg-[#00B1EA] text-white rounded-full
                  hover:bg-[#0099D1] transition-colors duration-200 flex items-center justify-center gap-2
                  disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Conectando...' : 'Conectar'}
                {!loading && <span className="text-lg">→</span>}
              </button>
            </div>
          </form>

          <div className="flex items-center justify-center gap-6 pb-8">
            {socialIcons.map(({ icon, id, href }) => (
              <SocialButton key={id} icon={icon} href={href} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

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
    <div className="w-full lg:w-1/2 flex flex-col bg-white relative">
      {renderMainContent()}
      {renderModals()}
    </div>
  );
};

export default LoginForm;