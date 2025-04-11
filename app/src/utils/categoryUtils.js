// utils/categoryUtils.js

export function getCategoryColor(category) {
    const colors = {
      'Tecnología': 'bg-slate-700',
      'NOTIFICATION': 'bg-zinc-700',
      'Mantenimiento': 'bg-stone-700',
      'Características': 'bg-neutral-700',
      'Eventos': 'bg-gray-700'
    };
    return colors[category] || 'bg-gray-700';
  }