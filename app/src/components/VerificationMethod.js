'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const VerificationMethod = ({ onMethodSelected, onBack }) => {
  const [method, setMethod] = useState('email');
  const [securityMessage, setSecurityMessage] = useState('');

  // Retrieve the security message when component mounts
  useEffect(() => {
    const message = localStorage.getItem('securityMessage');
    if (message) {
      setSecurityMessage(message);
      // Clean up after retrieving
      localStorage.removeItem('securityMessage');
    }
  }, []);

  const handleContinue = () => {
    onMethodSelected(method);
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-white h-screen">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/logoAdvan.svg"
            alt="Advan Logo"
            width={160}
            height={50}
            className="h-auto"
            priority
          />
        </div>

        <h2 className="text-2xl font-medium text-gray-800 mb-2">
          Autentificación de dos factores
        </h2>
        
        {securityMessage && (
          <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-500 flex items-start">
            <AlertTriangle size={20} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              {securityMessage}
            </p>
          </div>
        )}
        
        <div className="space-y-4 mb-8 text-left">
          <label className="flex items-start border border-gray-300 rounded-md p-5 cursor-pointer">
            <div>
              <span className="font-medium text-gray-800">Correo electrónico</span>
              <p className="text-sm text-gray-500">
                Revisa tu correo para continuar con la verificación. Da clic en “Continuar” e ingresa el código que recibiste.
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
        >
          Continuar
        </button>

        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={16} className="mr-2" />
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationMethod;