'use client';

import { ChevronDown } from 'lucide-react';
import { SideMenu } from '@/components/modules/SideMenu';
import { RecentItems } from '@/components/modules/RecentItems';
import ModuleHeader from '@/components/modules/ModuleHeader';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

const initialItems = [
  { 
    id: 'convenios-recent', 
    name: 'Convenios', 
    description: 'Lorem ipsum dolor sit amet', 
    iconName: 'Handshake'
  },
  { 
    id: 'vehiculos-recent', 
    name: 'Vehículos', 
    description: 'Lorem ipsum dolor sit amet', 
    iconName: 'Truck'
  },
  { 
    id: 'tabulador-recent', 
    name: 'Tabulador de tarifas', 
    description: 'Lorem ipsum dolor sit amet', 
    iconName: 'Calculator'
  }
];

export default function ModulePage() {
  const {
    recentItems,
    dragOverItemId,
    handleDragStart,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    setDragOverItemId
  } = useDragAndDrop(initialItems);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideMenu
        onDrop={(e) => handleDrop(e, 'menu')}
        onDragOver={(e) => e.preventDefault()}
        onDragStart={handleDragStart}
        onTouchStart={handleTouchStart}
      />

      <div className="flex-1">
        <ModuleHeader />
        
        <div className="p-8">
          <section>
            <h2 className="text-xl font-semibold mb-6">Utilizados recientemente</h2>
            
            <RecentItems
              items={recentItems}
              onDrop={(e) => handleDrop(e, 'recent')}
              onDragOver={(e) => e.preventDefault()}
              onDragStart={handleDragStart}
              onDragEnter={setDragOverItemId}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              dragOverItemId={dragOverItemId}
            />

            <div className="mt-8 border-t border-gray-200 pt-8">
              <button 
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium gap-2 group"
                onClick={() => {/* Aquí puedes agregar la lógica para mostrar más información */}}
              >
                <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
                <span>¡Descubre todo lo que puedes hacer con ADVAN ERP Trucks!</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}