'use client';

import { useState, useEffect } from 'react';

export const useDragAndDrop = (initialItems) => {
  const [recentItems, setRecentItems] = useState(initialItems);
  const [dragOverItemId, setDragOverItemId] = useState(null);
  const [touchData, setTouchData] = useState(null);
  const [ghostElement, setGhostElement] = useState(null);

  const createGhostElement = (element) => {
    const ghost = element.cloneNode(true);
    ghost.style.position = 'fixed';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '1000';
    ghost.style.width = `${element.offsetWidth}px`;
    ghost.style.height = `${element.offsetHeight}px`;
    ghost.style.transform = 'scale(0.95)';
    ghost.style.opacity = '0.8';
    ghost.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    ghost.style.transition = 'transform 0.2s ease';
    ghost.id = 'ghost-element';
    
    document.body.appendChild(ghost);
    return ghost;
  };

  const updateGhostPosition = (ghost, x, y) => {
    if (ghost) {
      const halfWidth = ghost.offsetWidth / 2;
      const halfHeight = ghost.offsetHeight / 2;
      ghost.style.left = `${x - halfWidth}px`;
      ghost.style.top = `${y - halfHeight}px`;
    }
  };

  const handleDragStart = (e, item) => {
    const transferData = {
      id: item.id,
      name: item.name,
      iconName: item.iconName,
      source: item.id.includes('-recent') ? 'recent' : 'menu'
    };
    e.dataTransfer.setData('dragData', JSON.stringify(transferData));
  };

  const reorderItems = (draggedId, targetId) => {
    setRecentItems(prev => {
      const items = [...prev];
      const draggedIndex = items.findIndex(i => i.id === draggedId);
      const dropIndex = items.findIndex(i => i.id === targetId);
      
      if (draggedIndex !== -1 && dropIndex !== -1) {
        const [draggedItem] = items.splice(draggedIndex, 1);
        items.splice(dropIndex, 0, draggedItem);
      }
      
      return items;
    });
  };

  const handleTouchStart = (e, item) => {
    const touch = e.touches[0];
    const element = e.target.closest('[data-draggable="true"]');
    
    if (element) {
      const ghost = createGhostElement(element);
      updateGhostPosition(ghost, touch.clientX, touch.clientY);
      setGhostElement(ghost);
      
      element.style.opacity = '0.3';
      
      setTouchData({
        item,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        sourceElement: element
      });
    }
  };

  const handleTouchMove = (itemId) => {
    if (touchData) {
      setDragOverItemId(itemId);
      
      // Actualizar posición del elemento fantasma
      const touch = event.touches[0];
      updateGhostPosition(ghostElement, touch.clientX, touch.clientY);
    }
  };

  useEffect(() => {
    const handleDocumentTouchMove = (e) => {
      if (touchData && ghostElement) {
        e.preventDefault();
        const touch = e.touches[0];
        updateGhostPosition(ghostElement, touch.clientX, touch.clientY);
      }
    };

    document.addEventListener('touchmove', handleDocumentTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleDocumentTouchMove);
    };
  }, [touchData, ghostElement]);

  const handleTouchEnd = (e) => {
    if (!touchData) return;

    // Eliminar elemento fantasma
    if (ghostElement) {
      ghostElement.remove();
      setGhostElement(null);
    }

    // Restaurar opacidad del elemento original
    if (touchData.sourceElement) {
      touchData.sourceElement.style.opacity = '1';
    }

    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = target?.closest('[data-drop-zone]');
    const targetItem = target?.closest('[data-draggable="true"]');
    
    if (dropZone) {
      const zone = dropZone.getAttribute('data-drop-zone');
      
      if (zone === 'recent' && targetItem) {
        const targetId = targetItem.getAttribute('data-item-id');
        const sourceId = touchData.item.id;
        
        if (targetId && sourceId && targetId !== sourceId) {
          if (sourceId.includes('-recent') && targetId.includes('-recent')) {
            reorderItems(sourceId, targetId);
          } else {
            handleDrop({
              preventDefault: () => {},
              dataTransfer: {
                getData: () => JSON.stringify({
                  ...touchData.item,
                  source: touchData.item.id.includes('-recent') ? 'recent' : 'menu'
                })
              }
            }, zone);
          }
        }
      } else {
        handleDrop({
          preventDefault: () => {},
          dataTransfer: {
            getData: () => JSON.stringify({
              ...touchData.item,
              source: touchData.item.id.includes('-recent') ? 'recent' : 'menu'
            })
          }
        }, zone);
      }
    }

    // Restaurar todos los elementos
    const elements = document.querySelectorAll('[data-draggable="true"]');
    elements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    setTouchData(null);
    setDragOverItemId(null);
  };

  const handleDrop = (e, targetArea) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('dragData'));
    const { source, ...item } = data;

    if (source === 'menu' && targetArea === 'recent') {
      const newItem = {
        id: `${item.id}-recent`,
        name: item.name,
        description: 'Lorem ipsum dolor sit amet',
        iconName: item.iconName
      };
      
      if (!recentItems.some(i => i.id === newItem.id)) {
        setRecentItems(prev => [...prev, newItem]);
      }
    }
    else if (source === 'recent' && targetArea === 'menu') {
      setRecentItems(prev => prev.filter(i => i.id !== item.id));
    }
    else if (source === 'recent' && targetArea === 'recent' && dragOverItemId) {
      reorderItems(item.id, dragOverItemId);
    }

    setDragOverItemId(null);
  };

  useEffect(() => {
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      if (ghostElement) {
        ghostElement.remove();
      }
    };
  }, [touchData, ghostElement]);

  return {
    recentItems,
    dragOverItemId,
    handleDragStart,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    setDragOverItemId
  };
};