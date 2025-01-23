'use client';

import Image from 'next/image';
import { useState } from 'react';
import { User, Lock, Server, Database, Globe, Linkedin, Youtube, Facebook } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ErrorIniciarSesion from './ErrorIniciarSesion';
import MensajeOlvidasteContraseña from './MensajeOlvidasteContraseña';
import FormRecuperarContraseña from './FormRecuperarContraseña';
import MensajeExitoRecuperarContraseña from './MensajeExitoRecuperarContraseña';

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

const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    server: '',
    database: ''
  });
  const [showError, setShowError] = useState(false);
  const [showModalContraseña, setShowModalContraseña] = useState(false);
  const [showRecuperarForm, setShowRecuperarForm] = useState(false);
  const [showExito, setShowExito] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await login(formData);
      router.push('/');
    } catch (error) {
      console.error('Error:', error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowModalContraseña(true);
  };

  const handleRecuperarSubmit = () => {
    setShowRecuperarForm(false);
    setShowExito(true);
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-col bg-white relative">
      <div className={`${(showModalContraseña || showRecuperarForm || showExito || showError) ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}>
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
                <InputField 
                  icon={User} 
                  placeholder="Usuario" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
                <InputField 
                  icon={Lock} 
                  placeholder="Contraseña" 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <InputField 
                  icon={Server} 
                  placeholder="Servidor"
                  name="server"
                  value={formData.server}
                  onChange={handleChange}
                />
                <InputField 
                  icon={Database} 
                  placeholder="Base de datos"
                  name="database"
                  value={formData.database}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6">
                <button
                  type="button"
                  onClick={handleForgotPassword}
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
              <SocialButton icon={Globe} />
              <SocialButton icon={Linkedin} />
              <SocialButton icon={Youtube} />
              <SocialButton icon={Facebook} />
            </div>
          </div>
        </div>
      </div>

      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center">
          <ErrorIniciarSesion onClose={() => setShowError(false)} />
        </div>
      )}

      {showModalContraseña && (
        <div className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center">
          <MensajeOlvidasteContraseña 
            onClose={() => setShowModalContraseña(false)}
            onContinue={() => {
              setShowModalContraseña(false);
              setShowRecuperarForm(true);
            }}
          />
        </div>
      )}

      {showRecuperarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center">
          <FormRecuperarContraseña 
            onClose={() => setShowRecuperarForm(false)}
            onSubmit={handleRecuperarSubmit}
          />
        </div>
      )}

      {showExito && (
        <div className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center">
          <MensajeExitoRecuperarContraseña
            onClose={() => setShowExito(false)}
            onContinue={() => setShowExito(false)}
          />
        </div>
      )}
    </div>
  );
};

export default LoginForm;