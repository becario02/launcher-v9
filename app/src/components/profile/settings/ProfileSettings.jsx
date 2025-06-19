import Image from 'next/image';
import { Pencil, Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import Cookies from 'js-cookie';

export default function ProfileSettings({
  formData,
  formErrors,
  onInputChange,
  onPasswordClick,
  avatarSrc = '/assets/navbar/perfil.jpg',
  onAvatarError,
  onAvatarUpdate,
  onShowToast
}) {
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Función para abrir el modal de avatar
  const openAvatarModal = () => {
    setShowAvatarModal(true);
    setPreviewImage(null);
    setSelectedFile(null);
  };

  // Función para cerrar el modal de avatar
  const closeAvatarModal = () => {
    setShowAvatarModal(false);
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para manejar la selección de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Por favor selecciona una imagen válida (JPG, JPEG, PNG)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Función para convertir archivo a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remover el prefijo data:image/type;base64,
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Función para manejar el cambio de avatar
  const handleAvatarChange = async () => {
    if (!selectedFile) return;

    try {
      setIsUpdatingAvatar(true);
      
      // Convertir a base64
      const base64 = await fileToBase64(selectedFile);
      
      // Obtener userId
      const userId = Cookies.get('idUser');
      if (!userId) {
        throw new Error('No se encontró el ID de usuario');
      }

      // Enviar al servidor
      const response = await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idUser: parseInt(userId),
          avatarBase64: base64
        })
      });

      const data = await response.json();
      
      if (data.statusCode === "200") {
        // Crear nueva URL de imagen para mostrar inmediatamente
        const imageType = selectedFile.type.split('/')[1];
        const newAvatarUrl = `data:image/${imageType};base64,${base64}`;
        
        // Actualizar localStorage
        localStorage.setItem('avatarImage', newAvatarUrl);
        
        // Forzar actualización del navbar - disparar evento personalizado
        window.dispatchEvent(new CustomEvent('avatarUpdated', { 
          detail: { newAvatarUrl } 
        }));
        
        // Notificar al componente padre para actualizar el avatar
        if (onAvatarUpdate) {
          onAvatarUpdate(newAvatarUrl);
        }
        
        // Cerrar modal
        closeAvatarModal();
        
        // Mostrar toast de éxito
        if (onShowToast) {
          onShowToast('Avatar actualizado exitosamente', 'success');
        }
      } else {
        throw new Error(data.message || 'Error al actualizar el avatar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al cambiar el avatar');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-10">
      <div className="w-full md:w-60 pt-2">
        <h3 className="text-[14px] font-medium text-[#000] dark:text-[#e2e2ea]">Perfil</h3>
        <p className="text-[12px] text-[#696974] dark:text-[#92929d] mt-1">
          Tu información personal y los ajustes de seguridad de la cuenta.
        </p>
      </div>
      <div className="flex-1">
        <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <Image 
                src={avatarSrc} 
                alt="Avatar" 
                width={48} 
                height={48} 
                className="object-cover w-full h-full"
                onError={onAvatarError}
              />
            </div>
            <button 
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center gap-1"
              onClick={openAvatarModal}
            >
              <Pencil className="w-4 h-4" /> Cambiar avatar
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block mb-1 text-gray-600 dark:text-gray-400">Nombre completo</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={onInputChange}
                className={`w-full rounded-md bg-white dark:bg-[#1C1C24] border ${formErrors.fullname ? 'border-red-500' : 'border-gray-300'} dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white`}
              />
              {formErrors.fullname && <p className="text-red-500 text-xs mt-1">{formErrors.fullname}</p>}
            </div>

            <div>
              <label className="block mb-1 text-gray-600 dark:text-gray-400">Correo</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onInputChange}
                className={`w-full rounded-md bg-white dark:bg-[#1C1C24] border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white`}
              />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block mb-1 text-gray-600 dark:text-gray-400">Contraseña</label>
              <input
                type="password"
                value="••••••••"
                disabled
                className="w-full rounded-md bg-gray-100 dark:bg-[#16161E] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-gray-500 cursor-not-allowed"
              />
              <div className="mt-2 flex justify-end">
                <button
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  onClick={onPasswordClick}
                >
                  <Pencil className="w-4 h-4" />
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para cambiar avatar */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1C1C24] rounded-2xl p-6 w-full max-w-md mx-auto">
            {/* Header del modal */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cambiar Avatar
              </h3>
              <button
                onClick={closeAvatarModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Imagen actual o preview */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {previewImage ? 'Nueva imagen' : 'Imagen actual'}
              </p>
              <div className={`w-24 h-24 mx-auto rounded-full overflow-hidden border-2 ${
                previewImage ? 'border-blue-500' : 'border-gray-200 dark:border-gray-600'
              }`}>
                <Image
                  src={previewImage || avatarSrc}
                  alt={previewImage ? 'Preview' : 'Avatar actual'}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  onError={onAvatarError}
                />
              </div>
            </div>

            {/* Botón para seleccionar imagen */}
            <div className="mb-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-100 dark:bg-[#2C2C38] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors"
              >
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile ? 'Cambiar imagen seleccionada' : 'Seleccionar nueva imagen'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  JPG, JPEG, PNG hasta 5MB
                </p>
              </button>
              
              {/* Input oculto para seleccionar archivo */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>



            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={closeAvatarModal}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2C2C38] rounded-lg hover:bg-gray-200 dark:hover:bg-[#3C3C48] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAvatarChange}
                disabled={!selectedFile || isUpdatingAvatar}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  selectedFile && !isUpdatingAvatar
                    ? 'bg-primary hover:opacity-90'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isUpdatingAvatar ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Actualizando...
                  </div>
                ) : (
                  'Guardar cambios'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}