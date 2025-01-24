'use client';
import VistaBienvenida from '@/components/VistaBienvenida';
import SeleccionPerfil from '@/components/SeleccionPerfil';
import { useState } from 'react';

export default function Page() {
  const [paso, setPaso] = useState(1);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {paso === 1 && <VistaBienvenida onSiguiente={() => setPaso(2)} />}
      {paso === 2 && <SeleccionPerfil />}
    </div>
  );
}