'use client';

import Image from 'next/image';
import { User, Lock, Server, Database, Globe, Linkedin, Youtube, Facebook } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const router = useRouter();
  
  const conectar = (e) => {
    e.preventDefault();
    console.log('Conectando al dashboard...');
    router.push('/home');
  };
  
  return (
    <div className="w-full lg:w-1/2 min-h-screen flex flex-col bg-white">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 flex flex-col flex-grow">
        
        <div className="flex justify-center md:justify-end">
          <Image
            src="/logoAdvanLogin.png"
            alt="Advan Logo"
            width={150}
            height={50}
            className="w-32 md:w-40 lg:w-48 h-auto"
          />
        </div>

        
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md md:max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-[#00B1EA] text-center mb-10 md:mb-12">
              ¡Bienvenid@!
            </h1>

            <form className="space-y-6 md:space-y-8">
              <div className="space-y-4 md:space-y-6">
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Usuario"
                    className="w-full pl-11 md:pl-14 pr-4 py-3 md:py-4 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B1EA] text-gray-600 text-base md:text-lg"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className="w-full pl-11 md:pl-14 pr-4 py-3 md:py-4 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B1EA] text-gray-600 text-base md:text-lg"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none">
                    <Server className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Servidor"
                    className="w-full pl-11 md:pl-14 pr-4 py-3 md:py-4 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B1EA] text-gray-600 text-base md:text-lg"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none">
                    <Database className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Base de datos"
                    className="w-full pl-11 md:pl-14 pr-4 py-3 md:py-4 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B1EA] text-gray-600 text-base md:text-lg"
                  />
                </div>
              </div>

              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                <a href="#" className="text-[#099aba] hover:underline text-base md:text-lg order-2 md:order-1">
                  ¿Olvidaste tu contraseña?
                </a>
                <button
                  onClick={conectar}
                  type="submit"
                  className="w-full md:w-48 lg:w-56 px-8 md:px-10 py-3 md:py-4 bg-[#00B1EA] text-white rounded-full hover:bg-[#0099D1] transition-colors flex items-center justify-center gap-2 text-base md:text-lg font-medium order-1 md:order-2"
                >
                  Conectar →
                </button>
              </div>
            </form>

            
            <div className="mt-12 md:mt-16 flex items-center justify-center space-x-4 md:space-x-6">
              {['Globe', 'Linkedin', 'Youtube', 'Facebook'].map((icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-[#00B1EA] bg-white text-[#00B1EA] hover:bg-[#00B1EA] hover:text-white transition-colors"
                >
                  {icon === 'Globe' && <Globe className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />}
                  {icon === 'Linkedin' && <Linkedin className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />}
                  {icon === 'Youtube' && <Youtube className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />}
                  {icon === 'Facebook' && <Facebook className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;