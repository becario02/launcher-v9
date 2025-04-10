'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const initialAccesses = [
  {
    id: 1,
    category: 'Nucleares',
    subcategory: 'Tráfico',
    name: 'Subnivel 2.2',
  },
  {
    id: 2,
    category: 'Nucleares',
    subcategory: 'Llantas',
    name: 'Subnivel 2.3',
  },
  {
    id: 3,
    category: 'Financieros',
    subcategory: 'Contabilidad',
    name: 'Subnivel 1.4',
  },
  {
    id: 4,
    category: 'Auxiliares',
    subcategory: 'Logística',
    name: 'Subnivel 3.1',
  },
];

const SortableItem = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center justify-between px-4 py-3 bg-white rounded-md border border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 text-[13px] text-gray-500">
        <GripVertical className="w-4 h-4 cursor-grab" {...listeners} />

        <div className="flex items-center gap-4">
          <span>{item.category}</span>
          <span className="text-gray-300">{'>'}</span>
          <span>{item.subcategory}</span>
          <span className="text-gray-300">{'>'}</span>
          <span className="font-semibold text-gray-700">{item.name}</span>
        </div>
      </div>

      <button className="text-gray-400 hover:text-gray-600">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const DirectAccessSection = () => {
  const [items, setItems] = useState(initialAccesses);
  const [expanded, setExpanded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over?.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  const visibleItems = expanded ? items : items.slice(0, 3);
  const hasMore = items.length > 3;

  return (
    <section className="font-[Poppins] bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-medium text-gray-800">Mis accesos directos</h2>
        {hasMore && (
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {visibleItems.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
};

export default DirectAccessSection;
