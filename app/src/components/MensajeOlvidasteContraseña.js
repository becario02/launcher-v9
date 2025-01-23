import React from 'react';
import { Key } from 'lucide-react';

const MensajeOlvidasteContraseña = ({ onClose, onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-blue-500 rounded-full p-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-blue-500 text-xl font-medium">
            ¿Olvidaste tu contraseña?
          </h2>
          
          <p className="text-gray-600 text-center">
            Ingresa la información requerida a continuación
            para iniciar el proceso de restablecimiento de tu contraseña.
          </p>
          
          <button
            onClick={onContinue}
            className="w-full bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition-colors"
          >
            Continuar
          </button>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default MensajeOlvidasteContraseña;