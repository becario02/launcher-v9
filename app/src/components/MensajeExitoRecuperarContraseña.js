import React from 'react';
import { AtSign } from 'lucide-react';

const MensajeExitoRecuperarContraseña = ({ onClose, onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-blue-500 rounded-full p-4">
            <AtSign className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-blue-500 text-xl font-medium">
            ¡Recibimos tu solicitud!
          </h2>
          
          <p className="text-gray-600 text-center">
            Revisa tu correo electrónico y sigue las instrucciones 
            para restablecer tu contraseña.
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

export default MensajeExitoRecuperarContraseña;