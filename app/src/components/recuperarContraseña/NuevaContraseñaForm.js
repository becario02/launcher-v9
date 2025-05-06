'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { recuperarContraseña } from '@/services/api/recuperarContraseña';

const NuevaContraseñaForm = ({ encryptedData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    encryptedData: encryptedData
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Muy débil',
    color: 'bg-red-500'
  });

  // Evaluar la fortaleza de la contraseña cuando cambia
  useEffect(() => {
    if (formData.password) {
      const strength = evaluatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, label: 'Muy débil', color: 'bg-red-500' });
    }
  }, [formData.password]);

  // Función para evaluar la fortaleza de la contraseña
  const evaluatePasswordStrength = (password) => {
    let score = 0;
    
    // Longitud mínima
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complejidad
    if (/[a-z]/.test(password)) score += 1; // Minúsculas
    if (/[A-Z]/.test(password)) score += 1; // Mayúsculas
    if (/[0-9]/.test(password)) score += 1; // Números
    if (/[^a-zA-Z0-9]/.test(password)) score += 1; // Caracteres especiales
    
    // Patrones repetitivos (reduce la puntuación)
    if (/(.)\1{2,}/.test(password)) score -= 1; // Caracteres repetidos
    if (/^(?:123|abc|qwerty|password|contraseña|admin)/i.test(password)) score -= 1; // Patrones comunes
    
    // Asegúrate que el puntaje no sea negativo
    score = Math.max(0, score);
    
    // Máximo 5 puntos
    score = Math.min(5, score);
    
    // Determina la etiqueta y color según la puntuación
    const strengthMap = [
      { score: 0, label: 'Muy débil', color: 'bg-red-500' },
      { score: 1, label: 'Muy débil', color: 'bg-red-500' },
      { score: 2, label: 'Débil', color: 'bg-orange-500' },
      { score: 3, label: 'Moderada', color: 'bg-yellow-500' },
      { score: 4, label: 'Fuerte', color: 'bg-blue-500' },
      { score: 5, label: 'Muy fuerte', color: 'bg-green-500' }
    ];
    
    return strengthMap[score];
  };

  // Validar contraseña - validación más estricta
  const validatePassword = (password) => {
    const errors = [];
    
    // Verificamos todos los criterios obligatorios
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Debe incluir al menos una letra minúscula');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe incluir al menos una letra mayúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Debe incluir al menos un número');
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Debe incluir al menos un carácter especial');
    }
    
    // Verificaciones adicionales de seguridad
    if (/(.)\1{2,}/.test(password)) {
      errors.push('No debe contener caracteres repetidos consecutivamente');
    }
    
    if (/^(?:123|abc|qwerty|password|contraseña|admin)/i.test(password)) {
      errors.push('No debe contener secuencias comunes o predecibles');
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación de coincidencia
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    // Validación de requisitos - AHORA EXIGIMOS QUE SE CUMPLAN TODOS LOS REQUISITOS
    const validationErrors = validatePassword(formData.password);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }
    
    // Ya no dependemos solo del score, sino que validamos que todos los criterios se cumplan
    // Esto asegura que incluso una contraseña con buen score pero que falte algún criterio será rechazada
    
    setLoading(true);
    
    try {
      await recuperarContraseña.cambiarContraseñaConToken(
        formData.encryptedData, 
        formData.password
      );
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar indicador de fortaleza
  const renderStrengthIndicator = () => {
    const { score, label, color } = passwordStrength;
    const percentage = (score / 5) * 100;
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Fortaleza:</span>
          <span className={`font-medium ${score <= 2 ? 'text-red-600' : score <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
            {label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-300`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-full max-w-md bg-white p-8 text-center">
          <div className="mb-6">
            <Image
              src="/logoAdvan.svg"
              alt="Advan Logo"
              width={160}
              height={50}
              className="h-auto mx-auto"
              priority
            />
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">¡Contraseña actualizada!</h2>
          <p className="text-gray-600 mb-6">Tu contraseña ha sido cambiada exitosamente.</p>
          
          <Link href="/login" className="block w-full bg-[#0080ff] text-white py-3 rounded-md hover:bg-blue-600 transition-colors text-center">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white p-8">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logoAdvan.svg"
            alt="Advan Logo"
            width={150}
            height={40}
            className="h-auto"
            priority
          />
        </div>
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            Crear nueva contraseña
          </h1>
          <p className="text-gray-500 text-sm">
            Ingresa y confirma tu nueva contraseña
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Nueva Contraseña"
                required
              />
              
              {formData.password && renderStrengthIndicator()}
              
              <ul className="mt-2 text-xs text-gray-500 space-y-1 pl-5 list-disc">
                <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                  Mínimo 8 caracteres
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                  Al menos una letra minúscula
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                  Al menos una letra mayúscula
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                  Al menos un número
                </li>
                <li className={/[^a-zA-Z0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                  Al menos un carácter especial
                </li>
              </ul>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Confirmar Contraseña"
                required
              />
              {formData.password && formData.confirmPassword && (
                <p className={`mt-1 text-xs ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.password === formData.confirmPassword ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                </p>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || validatePassword(formData.password).length > 0 || formData.password !== formData.confirmPassword}
            className="w-full bg-[#0080ff] text-white py-3 rounded-md hover:bg-blue-600 transition-colors
              disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NuevaContraseñaForm;