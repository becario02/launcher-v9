// src/components/modules/DraggableItem.js

import React from 'react';
import { getIconComponent } from './icons/IconMapper';

export const DraggableItem = ({ item, onDragStart, onTouchStart }) => {
  const handleTouchStart = (e) => {
    e.preventDefault();
    onTouchStart(e, item);
  };

  return (
    <div
      draggable
      data-draggable="true"
      data-item-id={item.id}
      onDragStart={(e) => onDragStart(e, item)}
      onTouchStart={handleTouchStart}
      className="ml-2 p-2 mt-1 flex items-center gap-3 rounded-md
        hover:bg-white/60 cursor-move touch-manipulation
        transition-colors duration-200"
    >
      <div className="text-gray-500">
        {getIconComponent(item.iconName)}
      </div>
      <span className="text-sm text-gray-600 whitespace-nowrap">
        {item.name}
      </span>
    </div>
  );
};