import React, { useState } from 'react';
import { Mail, Loader2, X } from 'lucide-react';
import PropTypes from 'prop-types';

const FormRecuperarContraseña = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Función para validar el email
  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'El correo electrónico es requerido';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Por favor ingresa un correo electrónico válido';
    }
    
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (emailError) {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validar email antes de enviar
    const error = validateEmail(formData.email);
    if (error) {
      setEmailError(error);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error en el formulario:', error);
      setEmailError('Error al enviar el correo. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1C1C24] rounded-2xl p-6 w-full max-w-md mx-auto">
        {/* Header del modal */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recuperar Contraseña
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu contraseña.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-[#2C2C38] text-gray-900 dark:text-white ${
                    emailError 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[#0080ff]'
                  }`}
                  required
                  disabled={isSubmitting}
                />
              </div>
              {/* Mostrar error de validación */}
              {emailError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {emailError}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2C2C38] rounded-lg hover:bg-gray-200 dark:hover:bg-[#3C3C48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.email || isSubmitting || emailError}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
              formData.email && !isSubmitting && !emailError
                ? 'bg-[#0080ff] hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </div>
            ) : (
              'Enviar enlace'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

FormRecuperarContraseña.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default FormRecuperarContraseña;