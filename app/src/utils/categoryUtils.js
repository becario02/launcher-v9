// utils/categoryUtils.js

export function getCategoryColor(category) {
  const colors = {
    // Nuevas categorías de noticias con colores distintivos
    'COMMUNICATION': 'bg-blue-600',        // Azul para comunicados oficiales
    'MAINTENANCE_EXTERNAL': 'bg-orange-600', // Naranja para mantenimiento
    'GENERAL_NEWS': 'bg-green-600',        // Verde para noticias generales
    'LEGAL_NEWS': 'bg-purple-600',         // Morado para noticias legales/normativas
    'BLOG': 'bg-indigo-600',               // Índigo para contenido de blog
    'PRODUCTS_SERVICES': 'bg-cyan-600',    // Cian para productos y servicios
    'SUCCESS_STORY': 'bg-emerald-600',     // Esmeralda para casos de éxito
    'PROMOTIONAL': 'bg-pink-600',          // Rosa para contenido promocional
    'CLOUD_PROMO': 'bg-sky-600',           // Azul cielo para promociones de nube
    'UPCOMING_EVENTS': 'bg-yellow-600',    // Amarillo para eventos próximos
    
    // Categorías legacy (compatibilidad con versiones anteriores)
    'NEWS': 'bg-green-600',                // Mantenemos verde para noticias legacy
    'ADVICE': 'bg-blue-600',               // Azul para consejos
    'NOTIFICATION': 'bg-gray-600',         // Gris para notificaciones legacy
    
    // Categorías adicionales que podrían existir
    'Tecnología': 'bg-slate-700',
    'NOTIFICATION': 'bg-zinc-700',
    'Mantenimiento': 'bg-stone-700',
    'Características': 'bg-neutral-700',
    'Eventos': 'bg-gray-700'
  };
  
  // Retorna el color correspondiente o gris por defecto
  return colors[category] || 'bg-gray-600';
}

// Función auxiliar para obtener el nombre legible de la categoría
export function getCategoryLabel(category) {
  const labels = {
    // Nuevas categorías
    'COMMUNICATION': 'Comunicados',
    'MAINTENANCE_EXTERNAL': 'Mantenimiento Externo',
    'GENERAL_NEWS': 'Noticias',
    'LEGAL_NEWS': 'Noticias Normativas y Fiscales',
    'BLOG': 'Blog',
    'PRODUCTS_SERVICES': 'Productos y Servicios Advan',
    'SUCCESS_STORY': 'Casos de Éxito - Productos o servicios Advan',
    'PROMOTIONAL': 'Promocional',
    'CLOUD_PROMO': 'Nube - Promocional',
    'UPCOMING_EVENTS': 'Eventos Próximos',
    
    // Categorías legacy
    'NEWS': 'Noticias',
    'ADVICE': 'Consejo',
    'NOTIFICATION': 'Notificación'
  };
  
  return labels[category] || category;
}

// Función para obtener todas las categorías disponibles
export function getAllNewsCategories() {
  return [
    { value: 'COMMUNICATION', label: 'Comunicados', color: 'bg-blue-600' },
    { value: 'MAINTENANCE_EXTERNAL', label: 'Mantenimiento Externo', color: 'bg-orange-600' },
    { value: 'GENERAL_NEWS', label: 'Noticias', color: 'bg-green-600' },
    { value: 'LEGAL_NEWS', label: 'Noticias Normativas y Fiscales', color: 'bg-purple-600' },
    { value: 'BLOG', label: 'Blog', color: 'bg-indigo-600' },
    { value: 'PRODUCTS_SERVICES', label: 'Productos y Servicios Advan', color: 'bg-cyan-600' },
    { value: 'SUCCESS_STORY', label: 'Casos de Éxito', color: 'bg-emerald-600' },
    { value: 'PROMOTIONAL', label: 'Promocional', color: 'bg-pink-600' },
    { value: 'CLOUD_PROMO', label: 'Nube - Promocional', color: 'bg-sky-600' },
    { value: 'UPCOMING_EVENTS', label: 'Eventos Próximos', color: 'bg-yellow-600' }
  ];
}