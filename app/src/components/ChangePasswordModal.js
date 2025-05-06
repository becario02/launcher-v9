import { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import Cookies from 'js-cookie';

export default function ChangePasswordModal({ onClose, onSuccess }) {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Muy débil',
    color: 'bg-red-500'
  });

  // Obtener el idioma del navegador o usar español por defecto
  const rawLang =
    typeof navigator !== 'undefined'
      ? navigator.language || 'en-US'
      : 'en-US';
  const language = rawLang.startsWith('es') ? 'es-MX' : 'en-US';
  
  // Animar entrada al montar
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Manejar clics fuera del modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Evaluar la fortaleza de la contraseña cuando cambia
  useEffect(() => {
    if (passwords.newPassword) {
      const strength = evaluatePasswordStrength(passwords.newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, label: 'Muy débil', color: 'bg-red-500' });
    }
  }, [passwords.newPassword]);

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

  const handleClose = () => {
    // Iniciar animación de salida
    setIsVisible(false);
    // Esperar a que termine la animación antes de cerrar
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar el error cuando el usuario empieza a escribir
    if (error) setError('');
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  // Renderizar indicador de fortaleza
  const renderStrengthIndicator = () => {
    const { score, label, color } = passwordStrength;
    const percentage = (score / 5) * 100;
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400">Fortaleza:</span>
          <span className={`font-medium ${
            score <= 2 
              ? 'text-red-600 dark:text-red-400' 
              : score <= 3 
                ? 'text-yellow-600 dark:text-yellow-400' 
                : 'text-green-600 dark:text-green-400'
          }`}>
            {label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-300`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    // Validación de requisitos
    const validationErrors = validatePassword(passwords.newPassword);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Obtener el ID de usuario
      const userId = Cookies.get('idUser');
      
      if (!userId) {
        throw new Error('No se encontró el ID de usuario');
      }
      
      const response = await fetch('http://localhost:5173/mslauncher/api/v1/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': language
        },
        body: JSON.stringify({
          idUser: parseInt(userId),
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }),
      });
      
      // Obtener el cuerpo de la respuesta como JSON incluso si el estado no es 200
      const data = await response.json();
      
      if (data.statusCode === "200") {
        // Notificar éxito
        onSuccess(data.message || 'Contraseña actualizada exitosamente');
        handleClose();
      } else if (data.statusCode === "401") {
        // Manejar específicamente el caso de contraseña incorrecta
        setError(data.message || 'La contraseña actual es incorrecta');
      } else {
        // Manejar otros errores
        setError(data.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300"
         style={{ opacity: isVisible ? 1 : 0 }}>
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-[#1C1C24] rounded-xl shadow-lg w-full max-w-md relative overflow-hidden transition-all duration-300 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-2 border-gray-200 dark:border-[#2C2C38]">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Cambiar contraseña</h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contraseña actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handleChange}
                  className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white pr-10 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white pr-10 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Indicador de fortaleza y requisitos */}
              {passwords.newPassword && renderStrengthIndicator()}
              
              <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1 pl-5 list-disc">
                <li className={passwords.newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
                  Mínimo 8 caracteres
                </li>
                <li className={/[a-z]/.test(passwords.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                  Al menos una letra minúscula
                </li>
                <li className={/[A-Z]/.test(passwords.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                  Al menos una letra mayúscula
                </li>
                <li className={/[0-9]/.test(passwords.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                  Al menos un número
                </li>
                <li className={/[^a-zA-Z0-9]/.test(passwords.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                  Al menos un carácter especial
                </li>
              </ul>
            </div>
            
            {/* Confirmar nueva contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white pr-10 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Mensaje de coincidencia */}
              {passwords.newPassword && passwords.confirmPassword && (
                <p className={`mt-1 text-xs ${passwords.newPassword === passwords.confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {passwords.newPassword === passwords.confirmPassword ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                </p>
              )}
            </div>
            
            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            
            {/* Botones */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || validatePassword(passwords.newPassword).length > 0 || passwords.newPassword !== passwords.confirmPassword || !passwords.currentPassword}
                className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}