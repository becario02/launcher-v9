'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Componente para un elemento arrastrable
const DraggableItem = ({ item, type, onDragStart, onDragEnter, isDragTarget }) => {
  // Elemento del menú lateral
  if (type === 'menu') {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, item, 'menu')}
        className="px-4 py-2 hover:bg-gray-200 cursor-move"
      >
        <div className="flex items-center gap-2">
          <span>{item.icon}</span>
          <span className="text-sm">{item.name}</span>
        </div>
      </div>
    );
  }

  // Elemento de la sección de recientes
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item, 'recent')}
      onDragEnter={() => onDragEnter(item.id)}
      className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-move
        ${isDragTarget ? 'border-2 border-blue-500' : ''}`}
    >
      <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-3 text-xl">
        {item.icon}
      </div>
      <h3 className="font-medium mb-1">{item.name}</h3>
      <p className="text-sm text-gray-500">{item.description}</p>
    </div>
  );
};

// Menú lateral
const SideMenu = ({ items, onDrop, onDragOver, onDragStart }) => (
  <div className="w-64 bg-gray-100 border-r border-gray-200">
    <div className="p-4">
      <button className="w-full flex items-center justify-between px-4 py-2 bg-blue-600 text-white rounded">
        <span className="font-medium">Transacciones</span>
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
    
    <div onDrop={onDrop} onDragOver={onDragOver}>
      {items.map(item => (
        <DraggableItem
          key={item.id}
          item={item}
          type="menu"
          onDragStart={onDragStart}
        />
      ))}
    </div>
  </div>
);

// Sección de elementos recientes
const RecentItems = ({ items, onDrop, onDragOver, onDragStart, onDragEnter, dragOverItemId }) => (
  <div 
    className="grid grid-cols-5 gap-6 min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg p-4"
    onDrop={onDrop}
    onDragOver={onDragOver}
  >
    {items.map(item => (
      <DraggableItem
        key={item.id}
        item={item}
        type="recent"
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        isDragTarget={dragOverItemId === item.id}
      />
    ))}
  </div>
);

// Lista de elementos del menú
const menuItems = [
  { id: 'convenios', name: 'Convenios', icon: '📄' },
  { id: 'tabulador', name: 'Tabulador de tarifas', icon: '💰' },
  { id: 'admin-proyectos', name: 'Administración de proyectos', icon: '📊' },
  { id: 'ofertas', name: 'Ofertas de Customer', icon: '🎯' },
  { id: 'planeacion', name: 'Planeación de servicios', icon: '📅' },
];

export default function ModulePage() {
  const [recentItems, setRecentItems] = useState([
    { id: 'convenios-recent', name: 'Convenios', description: 'Lorem ipsum dolor sit amet', icon: '🤝' },
    { id: 'vehiculos-recent', name: 'Vehículos', description: 'Lorem ipsum dolor sit amet', icon: '🚛' }
  ]);
  const [dragOverItemId, setDragOverItemId] = useState(null);

  // Manejar inicio del arrastre
  const handleDragStart = (e, item, source) => {
    e.dataTransfer.setData('dragData', JSON.stringify({ ...item, source }));
  };

  // Manejar soltar elemento
  const handleDrop = (e, targetArea) => {
    e.preventDefault();
    const { source, ...item } = JSON.parse(e.dataTransfer.getData('dragData'));

    // Mover del menú a recientes
    if (source === 'menu' && targetArea === 'recent') {
      const newItem = {
        id: `${item.id}-recent`,
        name: item.name,
        description: 'Lorem ipsum dolor sit amet',
        icon: item.icon
      };
      
      if (!recentItems.some(i => i.id === newItem.id)) {
        setRecentItems(prev => [...prev, newItem]);
      }
    }
    // Mover de recientes al menú (eliminar)
    else if (source === 'recent' && targetArea === 'menu') {
      setRecentItems(prev => prev.filter(i => i.id !== item.id));
    }
    // Reordenar elementos recientes
    else if (source === 'recent' && targetArea === 'recent' && dragOverItemId) {
      setRecentItems(prev => {
        const items = [...prev];
        const draggedIndex = items.findIndex(i => i.id === item.id);
        const dropIndex = items.findIndex(i => i.id === dragOverItemId);
        
        if (draggedIndex !== -1 && dropIndex !== -1) {
          const [draggedItem] = items.splice(draggedIndex, 1);
          items.splice(dropIndex, 0, draggedItem);
        }
        
        return items;
      });
    }

    setDragOverItemId(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideMenu
        items={menuItems}
        onDrop={(e) => handleDrop(e, 'menu')}
        onDragOver={(e) => e.preventDefault()}
        onDragStart={handleDragStart}
      />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-12">Tráfico</h1>
        
        <section>
          <h2 className="text-xl font-semibold mb-6">Utilizados recientemente</h2>
          
          <RecentItems
            items={recentItems}
            onDrop={(e) => handleDrop(e, 'recent')}
            onDragOver={(e) => e.preventDefault()}
            onDragStart={handleDragStart}
            onDragEnter={setDragOverItemId}
            dragOverItemId={dragOverItemId}
          />
        </section>
      </div>
    </div>
  );
}