import React from 'react';
import { AtSign, X } from 'lucide-react';

const MensajeExitoRecuperarContraseña = ({ onClose, onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-lg relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="flex flex-col items-center">
          
          <div className="w-full flex flex-col items-center pt-8 pb-6">
            <div className="bg-sky-600 rounded-full p-4 mb-4">
              <AtSign className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-sky-600 text-2xl font-medium">
              ¡Recibimos tu solicitud!
            </h2>
          </div>
          
          
          <div className="w-full bg-gray-100 rounded-b-3xl py-6 px-8 flex flex-col items-center">
            <p className="text-gray-600 text-center text-base mb-6">
              Revisa tu correo electrónico y sigue las instrucciones 
              para restablecer tu contraseña.
            </p>
            
            <button
              onClick={onContinue}
              className="w-32 bg-sky-600 text-white rounded-full py-2.5 px-6 hover:bg-sky-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MensajeExitoRecuperarContraseña;