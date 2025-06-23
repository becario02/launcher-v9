// NotificationFilters.jsx
import { useState, useEffect } from 'react';
import { Search, X, ChevronDown, Filter, Calendar, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  category,
  setCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  companyId,
  setCompanyId,
  companies,
  setPage,
  clearAllFilters
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Categorías disponibles actualizadas
  const categoryOptions = [
    { value: 'VERSION_RELEASE', label: 'Lanzamiento de Versión' },
    { value: 'MAINTENANCE_WINDOW', label: 'Ventana de Mantenimiento' },
    { value: 'ERP_UPDATE', label: 'Actualización ERP' },
    { value: 'NEWS', label: 'Noticias' },
    { value: 'NEWVIDEO', label: 'Nuevo Video' },
    { value: 'NEWARTICLE', label: 'Nuevo Artículo' },
    { value: 'NEWEVENT', label: 'Nuevo Evento' },
    { value: 'HOLIDAY', label: 'Días Festivos' },
    { value: 'CHANGELOG', label: 'Registro de Cambios' }
  ];

  // Función para obtener la etiqueta de categoría
  const getCategoryLabel = (categoryValue) => {
    const category = categoryOptions.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (search) count++;
    if (status) count++;
    if (category) count++;
    if (startDate) count++;
    if (endDate) count++;
    if (companyId) count++;
    setActiveFiltersCount(count);
  }, [search, status, category, startDate, endDate, companyId]);

  return (
    <div className="bg-white dark:bg-[#1C1C24] rounded-xl shadow-sm border border-gray-200 dark:border-[#2C2C38] overflow-hidden">
      {/* Search and main filter controls */}
      <div className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search bar - Manteniendo el diseño original */}
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#262631] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick filters row */}
          <div className="flex flex-wrap gap-2">
            {/* Status filter pills */}
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-[#2C2C38] overflow-hidden">
              <button
                onClick={() => {
                  setStatus('');
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  status === '' 
                    ? 'bg-primary text-white dark:text-white' 
                    : 'bg-white dark:bg-[#262631] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#32323e]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => {
                  setStatus('ACTIVE');
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  status === 'ACTIVE' 
                    ? 'bg-primary text-white dark:text-white' 
                    : 'bg-white dark:bg-[#262631] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#32323e]'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => {
                  setStatus('INACTIVE');
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  status === 'INACTIVE' 
                    ? 'bg-primary text-white dark:text-white' 
                    : 'bg-white dark:bg-[#262631] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#32323e]'
                }`}
              >
                Inactivas
              </button>
            </div>

            {/* Category filter dropdown */}
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="h-full appearance-none px-3 py-1.5 pr-8 text-xs font-medium rounded-lg border border-gray-200 dark:border-[#2C2C38] bg-white dark:bg-[#262631] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Todas las categorías</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Advanced filters toggle button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition
                ${showAdvancedFilters 
                  ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20' 
                  : 'border-gray-200 dark:border-[#2C2C38] bg-white dark:bg-[#262631] text-gray-700 dark:text-gray-300'
                }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filtros avanzados
              {activeFiltersCount > 0 && !showAdvancedFilters && (
                <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-primary text-white ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Clear filters button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => clearAllFilters()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-200 dark:border-[#2C2C38]"
          >
            <div className="p-4 bg-gray-50 dark:bg-[#262631]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Company filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                    <Building className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    Compañía
                  </label>
                  <select
                    value={companyId || ''}
                    onChange={(e) => {
                      setCompanyId(e.target.value ? parseInt(e.target.value) : null);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                  >
                    <option value="">Todas las compañías</option>
                    {companies.map(company => (
                      <option key={company.idCompany} value={company.idCompany}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start date filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    Desde
                  </label>
                  <input
                    type="date"
                    value={startDate ? startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      const localDate = new Date(year, month - 1, day); // mes 0-indexado
                      setStartDate(localDate);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                  />
                </div>

                {/* End date filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={endDate ? endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [year, month, day] = e.target.value.split('-').map(Number);
                        setEndDate(new Date(year, month - 1, day));
                      } else {
                        setEndDate(null);
                      }
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                  />
                </div>
              </div>

              {/* Applied filters badges */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 pt-1.5">
                    Filtros aplicados:
                  </span>

                  {status && (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                      Estado: {status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                      <button 
                        onClick={() => setStatus('')}
                        className="ml-1.5 text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {category && (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                      Categoría: {getCategoryLabel(category)}
                      <button 
                        onClick={() => setCategory('')}
                        className="ml-1.5 text-purple-400 hover:text-purple-600 dark:text-purple-300 dark:hover:text-purple-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {companyId && (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                      Compañía: {companies.find(c => c.idCompany === companyId)?.name || companyId}
                      <button 
                        onClick={() => setCompanyId(null)}
                        className="ml-1.5 text-emerald-400 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {startDate && (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                      Desde: {startDate.toLocaleDateString()}
                      <button 
                        onClick={() => setStartDate(null)}
                        className="ml-1.5 text-amber-400 hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {endDate && (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                      Hasta: {endDate.toLocaleDateString()}
                      <button 
                        onClick={() => setEndDate(null)}
                        className="ml-1.5 text-amber-400 hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationFilters;