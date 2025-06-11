'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, PlusCircle, Filter } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { usePrimaryColor } from '@/context/primaryColor';

export default function NewsFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  handleOpenModal,
  setCurrentPage
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filterHeight, setFilterHeight] = useState(0);
  const filterRef = useRef(null);
  const { theme } = useTheme();
  const { primaryColor } = usePrimaryColor();

  useEffect(() => {
    if (filterRef.current) {
      setFilterHeight(showFilters ? filterRef.current.scrollHeight : 0);
    }
  }, [showFilters]);

  const toggleFilters = () => setShowFilters(prev => !prev);
  const filterBg = showFilters ? `${primaryColor}33` : 'transparent';
  
  // Traducciones actualizadas para las nuevas categorías de noticias
  const categoryTranslations = {
    // Nuevas categorías
    'COMMUNICATION': 'Comunicados',
    'MAINTENANCE_EXTERNAL': 'Mantenimiento Externo',
    'GENERAL_NEWS': 'Noticias',
    'LEGAL_NEWS': 'Noticias Normativas',
    'BLOG': 'Blog',
    'PRODUCTS_SERVICES': 'Productos y Servicios',
    'SUCCESS_STORY': 'Casos de Éxito',
    'PROMOTIONAL': 'Promocional',
    'CLOUD_PROMO': 'Nube Promocional',
    'UPCOMING_EVENTS': 'Eventos Próximos',
    // Categorías legacy (por compatibilidad)
    'NEWS': 'Noticias',
    'ADVICE': 'Consejo',
    'NOTIFICATION': 'Notificación'
  };

  return (
    <div
      className="
        mb-5
        bg-white dark:bg-gray-7
        rounded-lg shadow-sm
        border border-gray-200 dark:border-white/20  
        p-3 transition-all duration-300 hover:shadow-md
      "
    >
      {/* Mobile */}
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <div className="relative flex-grow max-w-[180px]">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => { setCurrentPage(1); setSearchTerm(e.target.value); }}
            className="
              w-full pl-8 pr-2 py-2
              border border-gray-200 bg-gray-1 text-primary-blue placeholder:text-primary-blue
              dark:border-[#2C2C38] dark:bg-gray-8 dark:text-white dark:placeholder:text-gray-3
              rounded-full
              focus:outline-none focus:ring-1 focus:ring-primary-blue focus:ring-offset-1
              transition-all duration-200 text-xs
            "
          />
          <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-primary-blue dark:text-gray-3" />
          {searchTerm && (
            <button
              onClick={() => { setCurrentPage(1); setSearchTerm(''); }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-3 hover:text-primary-blue dark:text-gray-4 dark:hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Agregar - dinámico */}
          <button
            onClick={() => handleOpenModal('add')}
            style={{ backgroundColor: primaryColor }}
            className="text-white py-2 px-3 rounded-full text-xs flex items-center gap-1 transition-all duration-200"
          >
            <PlusCircle size={14} />
            <span>Agregar</span>
          </button>

          {/* Filtrar - dinámico */}
          <button
            onClick={toggleFilters}
            style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: filterBg }}
            className="border py-2 px-3 rounded-full text-xs flex items-center gap-1 transition-all duration-200"
          >
            <Filter size={14} />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between gap-2 mb-3">
        <div className="relative flex-grow max-w-[300px]">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => { setCurrentPage(1); setSearchTerm(e.target.value); }}
            className="
              w-full pl-8 pr-2 py-2
              border border-gray-200 rounded-full
              bg-gray-1 text-primary-blue placeholder:text-primary-blue
              dark:border-[#2C2C38] dark:bg-gray-8 dark:text-white dark:placeholder:text-gray-3
              focus:outline-none focus:ring-1 focus:ring-primary-blue focus:ring-offset-1
              transition-all duration-200 text-p
            "
          />
          <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-primary-blue dark:text-gray-3" />
          {searchTerm && (
            <button
              onClick={() => { setCurrentPage(1); setSearchTerm(''); }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-blue dark:text-gray-4 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Agregar - dinámico */}
          <button
            onClick={() => handleOpenModal('add')}
            style={{ backgroundColor: primaryColor }}
            className="text-white py-2 px-4 rounded-full text-p flex items-center gap-2 transition-all duration-200"
          >
            <PlusCircle size={16} />
            <span>Agregar</span>
          </button>

          {/* Filtrar - dinámico */}
          <button
            onClick={toggleFilters}
            style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: filterBg }}
            className="border py-2 px-4 rounded-full text-p flex items-center gap-2 transition-all duration-300"
          >
            <Filter size={16} />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Panel de filtros extra */}
      <div
        style={{ height: `${filterHeight}px`, opacity: showFilters ? 1 : 0 }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div
          ref={filterRef}
          // border-top dinámico en lugar de border-gray-200
          style={{ borderTop: `1px solid ${primaryColor}` }}
          className="mt-3 pt-3 pb-2 sm:pb-3 md:pb-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
            <div className="flex flex-col gap-1 sm:gap-2">
              {/* etiqueta 'Estado' con color dinámico */}
              <span
                style={{ color: primaryColor }}
                className="text-xs font-medium dark:text-gray-2"
              >
                Estado:
              </span>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {['all', 'ACTIVE', 'INACTIVE'].map(status => {
                  const isActive = statusFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => { setCurrentPage(1); setStatusFilter(status); }}
                      // fondo y texto dinámicos cuando está activo, solo texto dinámico si no
                      style={
                        isActive
                          ? { backgroundColor: primaryColor, color: '#fff' }
                          : { color: primaryColor }
                      }
                      className={`
                        px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm
                        transition-all duration-200
                        bg-gray-1 dark:bg-gray-6
                        ${isActive ? '' : 'hover:bg-opacity-10 dark:hover:bg-opacity-30'}
                      `}
                    >
                      {status === 'all'
                        ? 'Todos'
                        : status === 'ACTIVE'
                        ? 'Activos'
                        : 'Inactivos'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1 sm:gap-2 md:items-end">
              <span
                style={{ color: primaryColor }}
                className="text-xs font-medium block md:mb-1 dark:text-gray-2"
              >
                Categoría:
              </span>
              <select
                value={categoryFilter}
                onChange={e => { setCurrentPage(1); setCategoryFilter(e.target.value); }}
                style={{
                  border: `1px solid ${primaryColor}`,
                  color: primaryColor
                }}
                className="
                  appearance-none pl-3 sm:pl-4 pr-8 sm:pr-10 py-1.5 sm:py-2 rounded-full
                  bg-gray-1 dark:bg-gray-6
                  focus:outline-none focus:ring-0
                  transition-all duration-200
                "
              >
                <option value="all">Todas las categorías</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>
                    {categoryTranslations[category] || category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}