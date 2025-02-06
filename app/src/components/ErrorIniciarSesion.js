import React from 'react';
import { User2 } from 'lucide-react';
import PropTypes from 'prop-types';

const ErrorIniciarSesion = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-blue-500 rounded-full p-4">
            <User2 className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-blue-500 text-xl font-medium">
            Error al iniciar sesión
          </h2>
          
          <p className="text-gray-600 text-center">
            Se ha presentado un error al intentar iniciar sesión.
            Revisa los datos ingresados y vuelve a intentarlo.
          </p>
          
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

ErrorIniciarSesion.propTypes = {
  onClose: PropTypes.func.isRequired
}; 

export default ErrorIniciarSesion;