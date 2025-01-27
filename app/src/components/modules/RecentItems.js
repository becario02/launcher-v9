// src/components/modules/RecentItems.js
'use client';

import { RecentItem } from './RecentItem';

export const RecentItems = ({ 
  items, 
  onDrop, 
  onDragOver, 
  onDragStart, 
  onDragEnter, 
  onTouchStart, 
  onTouchMove, 
  dragOverItemId 
}) => (
  <div 
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg p-4"
    onDrop={onDrop}
    onDragOver={onDragOver}
    data-drop-zone="recent"
  >
    {items.map(item => (
      <RecentItem
        key={item.id}
        item={item}
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        isDragTarget={dragOverItemId === item.id}
      />
    ))}
  </div>
);