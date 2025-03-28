import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';

const FormRecuperarContraseña = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error en el formulario:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-xl px-12 py-8">
        <div className="relative">
          <h2 className="text-sky-600 text-2xl font-semibold text-center mb-8">
            Ingresa la información
          </h2>

          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-1 right-2 text-gray-400 hover:text-gray-600 font-bold text-xl disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xs mx-auto space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-2xl focus:outline-none text-gray-600"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-center mt-8">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-sky-600 text-white rounded-full py-2 px-12 hover:bg-sky-700 transition-colors text-base disabled:bg-sky-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                'Aceptar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

FormRecuperarContraseña.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default FormRecuperarContraseña;