'use client';

import { useState } from 'react';
import { User, PlusCircle, Shield } from 'lucide-react';
import PermissionsModal from './PermisosModal';

export default function UserHeader({
  selectedCompany,
  profileName,
  onChangeCompany,
  onAddUser,
  onManagePermissions, // 🔥 nueva prop para manejar permisos
  primaryColor,
  users
}) {

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* TÍTULO */}
      <div>
        <div className="flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          <h1 className="text-[20px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
            Administración de Usuarios
            {selectedCompany ? ` - ${selectedCompany.companyName}` : ''}
          </h1>
        </div>
        <p className="text-p text-[#696974] dark:text-[#92929d] ml-8 mt-1">
          Lista de usuarios registrados en la empresa seleccionada.
        </p>
      </div>

      {/* BOTONES */}
      <div className="flex flex-wrap gap-2">
        {profileName === 'ADMINADVAN' && (
          <>
            <button
              onClick={onChangeCompany}
              className="flex items-center gap-2 text-p font-medium px-4 py-2 rounded-md bg-gray-300 dark:bg-[#2C2C38] text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-[#3C3C48]"
            >
              {selectedCompany ? 'Cambiar empresa' : 'Seleccionar empresa'}
            </button>
          </>
        )}
        <button
            onClick={() => setShowPermissionsModal(true)}          
            className="flex items-center gap-2 text-p font-medium px-4 py-2 rounded-md bg-gray-300 dark:bg-[#2C2C38] text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-[#3C3C48]"
        >
          <Shield className="w-4 h-4" />
          Configurar permisos
        </button>  
        <button
          onClick={onAddUser}
          className="flex items-center gap-2 text-p font-medium text-white px-4 py-2 rounded-md"
          style={{ backgroundColor: primaryColor }}
        >
          <PlusCircle className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>
      <PermissionsModal
  isOpen={showPermissionsModal}
  users={users}
  onClose={() => setShowPermissionsModal(false)}
  onSave={(selectedUserIds, permType) => {
    console.log('Usuarios seleccionados:', selectedUserIds);
    console.log('Permiso para:', permType);
    // aquí puedes hacer tu POST a la API o manejar la lógica
  }}
/>

    </div>
  );
}