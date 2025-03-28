'use client';

import { useSearchParams } from 'next/navigation';
import NuevaContraseñaForm from '@/components/recuperarContraseña/NuevaContraseñaForm';

export default function RecuperarPasswordPage() {
  const searchParams = useSearchParams();
  const encryptedData = searchParams.get('data');
  
  // Verificar que se recibió el parámetro encriptado
  if (!encryptedData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-full max-w-md bg-white p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Enlace inválido</h2>
          <p className="text-gray-600 mb-6">
            El enlace para recuperar contraseña no contiene la información necesaria.
            Por favor, solicita un nuevo enlace.
          </p>
        </div>
      </div>
    );
  }
  
  return <NuevaContraseñaForm encryptedData={encryptedData} />;
}