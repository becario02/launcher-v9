import React from 'react';
import { Mail, X } from 'lucide-react';
import PropTypes from 'prop-types';

const MensajeExitoRecuperarContraseña = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1C1C24] rounded-2xl p-6 w-full max-w-md mx-auto">
        {/* Header del modal */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ¡Solicitud enviada!
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="text-center mb-6">
          {/* Icono de éxito */}
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          {/* Mensaje */}
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Hemos enviado un enlace de recuperación a tu correo electrónico. 
            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
          </p>
        </div>

        {/* Botón de acción */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-2 text-white bg-[#0080ff] rounded-lg hover:bg-blue-600 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

MensajeExitoRecuperarContraseña.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default MensajeExitoRecuperarContraseña;