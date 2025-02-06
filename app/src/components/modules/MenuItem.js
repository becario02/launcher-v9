// src/components/modules/MenuItem.js

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { DraggableItem } from './DraggableItem';

export const MenuItem = ({ 
  section, 
  expanded, 
  onToggle, 
  onDragStart, 
  onTouchStart
}) => (
  <div className="px-2">
    <button 
      onClick={() => onToggle(section.id)}
      className={`w-full p-2 flex items-center justify-between rounded-lg
        hover:bg-white/60 transition-colors duration-200
        ${expanded ? 'bg-white/80' : ''}`}
    >
      <span className="text-sm font-medium text-gray-700">
        {section.name}
      </span>
      {section.items.length > 0 && (
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200
            ${expanded ? 'rotate-180' : ''}`} 
        />
      )}
    </button>

    <div className={`overflow-hidden transition-all duration-200 ease-in-out
      ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
      {section.items.map(item => (
        <DraggableItem
          key={item.id}
          item={item}
          onDragStart={onDragStart}
          onTouchStart={onTouchStart}
        />
      ))}
    </div>
  </div>
);