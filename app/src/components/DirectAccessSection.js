'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompany } from '@/context/CompanyContext';

const SortableItem = ({ item, onDelete }) => {
  const {
    attributes,
    setNodeRef,
    transform,
    transition,
    isDragging,
    listeners
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C24] rounded-md border border-gray-200 dark:border-[#2C2C38] hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 text-[13px] text-gray-500 dark:text-gray-400">
        <div {...listeners}>
          <GripVertical className="w-4 h-4 cursor-grab" />
        </div>
        <div className="flex items-center gap-4">
          <span>{item.category}</span>
          <span className="text-gray-300 dark:text-gray-500">{'>'}</span>
          <span>{item.subcategory}</span>
          <span className="text-gray-300 dark:text-gray-500">{'>'}</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">{item.name}</span>
        </div>
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const DirectAccessSection = () => {
  const { selectedCompany } = useCompany();
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    const fetchAccesses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5173/mslauncher/api/v1/GetMenuShorcutsByUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idUser: selectedCompany.idUser }),
        });

        const data = await response.json();

        const mappedData = data.data.data.map((access) => ({
          id: access.idMenuShortCut,
          category: access.moduleGroup || 'Sin Categoría',
          subcategory: access.moduleName || 'Sin Módulo',
          name: access.textOption || 'Sin Nombre',
        }));

        setItems(mappedData);
      } catch (error) {
        console.error('Error fetching accesses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedCompany?.idUser) {
      fetchAccesses();
    }
  }, [selectedCompany]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(items, oldIndex, newIndex);

        const updatedItems = reordered.map((item, index) => ({
          ...item,
          sequence: index + 1,
        }));
        setItems(updatedItems);

        updatedItems.forEach(async (item) => {
          try {
            await fetch('http://localhost:5173/mslauncher/api/v1/UpdateSequenceMenuShortCuts', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                idMenuShortCut: item.id,
                sequence: item.sequence
              })
            });
          } catch (error) {
            console.error(`Error updating sequence for id ${item.id}:`, error);
          }
        });
      }
    }
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Función que abre la modal
  const confirmDelete = (id) => {
    setIdToDelete(id);
    setShowModal(true);
  };

  // Función que elimina después de confirmar
  const handleDelete = async () => {
    if (!idToDelete) return;

    try {
      await fetch('http://localhost:5173/mslauncher/api/v1/DeleteMenuShortCuts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idMenuShortCut: idToDelete }),
      });

      setItems((prevItems) => prevItems.filter((item) => item.id !== idToDelete));
    } catch (error) {
      console.error(`Error deleting shortcut with id ${idToDelete}:`, error);
    } finally {
      setShowModal(false);
      setIdToDelete(null);
    }
  };

  const visibleItems = expanded ? items : items.slice(0, 3);
  const hasMore = items.length > 3;
  const activeItem = items.find((item) => item.id === activeId);

  return (
    <section className="font-[Poppins] bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-xl px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-medium text-gray-800 dark:text-gray-100">
          Mis accesos directos
        </h2>
        {hasMore && !isLoading && (
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C24] rounded-md border border-gray-200 dark:border-[#2C2C38]">
              <div className="flex items-center gap-3 w-full">
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-3 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              <div className="space-y-2">
                {visibleItems.map((item) => (
                  <SortableItem
                    key={item.id || `temp-${item.name}`}
                    item={item}
                    onDelete={confirmDelete}
                  />
                ))}
              </div>
            </AnimatePresence>
          </SortableContext>

          <DragOverlay>
            {activeItem ? (
              <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C24] rounded-md border border-primary dark:border-primary shadow-lg">
                <div className="flex items-center gap-3 text-[13px] text-gray-700 dark:text-gray-200">
                  <GripVertical className="w-4 h-4" />
                  <div className="flex items-center gap-4">
                    <span>{activeItem.category}</span>
                    <span className="text-gray-400">{'>'}</span>
                    <span>{activeItem.subcategory}</span>
                    <span className="text-gray-400">{'>'}</span>
                    <span className="font-semibold">{activeItem.name}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Modal de Confirmación */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-[#1C1C24] rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-center text-gray-800 dark:text-gray-100">¿Eliminar acceso directo?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">Esta acción no se puede deshacer.</p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DirectAccessSection;