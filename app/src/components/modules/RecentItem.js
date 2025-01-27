// src/components/modules/RecentItem.js
'use client';

import { useRef } from 'react';
import { getIconComponent } from './icons/IconMapper';

export const RecentItem = ({ 
  item, 
  onDragStart, 
  onDragEnter, 
  isDragTarget, 
  onTouchStart, 
  onTouchMove 
}) => {
  const itemRef = useRef(null);

  const handleTouchStart = (e) => {
    e.preventDefault();
    onTouchStart(e, item);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const draggableElement = target?.closest('[data-draggable="true"]');
    
    if (draggableElement) {
      const itemId = draggableElement.getAttribute('data-item-id');
      onTouchMove(itemId);
    }
  };

  return (
    <div
      ref={itemRef}
      draggable
      data-draggable="true"
      data-item-id={item.id}
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnter={() => onDragEnter(item.id)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-move touch-manipulation
        ${isDragTarget ? 'border-2 border-blue-500' : ''}`}
    >
      <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-3">
        {getIconComponent(item.iconName)}
      </div>
      <h3 className="font-medium mb-1">{item.name}</h3>
      <p className="text-sm text-gray-500">{item.description}</p>
    </div>
  );
};