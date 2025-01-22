import React from 'react';
import { Key } from 'lucide-react';

const MensajeOlvidasteContraseña = ({ onClose, onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="relative p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-sky-500 rounded-full p-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-sky-500 text-xl font-medium">
              ¿Olvidaste tu contraseña?
            </h2>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="bg-gray-100 p-6">
          <p className="text-gray-600 text-center mb-6">
            Ingresa la información requerida a continuación
            para iniciar el proceso de restablecimiento de tu contraseña.
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={onContinue}
              className="bg-sky-500 text-white rounded-full py-2 px-12 hover:bg-sky-600 transition-colors text-sm font-medium"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MensajeOlvidasteContraseña;