"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, X, PlusCircle, Filter } from 'lucide-react';

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

  useEffect(() => {
    if (filterRef.current) {
      setFilterHeight(showFilters ? filterRef.current.scrollHeight : 0);
    }
  }, [showFilters]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="mb-5 bg-white rounded-lg shadow-sm border border-gray-100 p-3 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <div className="relative flex-grow max-w-[180px]">
          <input 
            type="text" 
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
            className="w-full pl-8 pr-2 py-2 border border-gray-200 bg-white rounded-full focus:outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-1 transition-all duration-200 text-xs"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => {
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenModal('add')}
            className="bg-gray-900 hover:bg-gray-800 text-white py-2 px-3 rounded-full text-xs flex items-center gap-1"
          >
            <PlusCircle size={14} />
            <span>Agregar</span>
          </button>
          
          <button 
            onClick={toggleFilters}
            className="bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-full text-xs flex items-center gap-1"
          >
            <Filter size={14} />
            <span>Filtrar</span>
          </button>
        </div>
      </div>
      
      <div className="hidden sm:flex items-center justify-between gap-2 mb-3">
        <div className="relative flex-grow max-w-[300px]">
          <input 
            type="text" 
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
            className="w-full pl-8 pr-2 py-2 border border-gray-200 bg-white rounded-full focus:outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-1 transition-all duration-200 text-sm"
          />
          <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => {
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenModal('add')}
            className="bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-full text-sm flex items-center gap-2"
          >
            <PlusCircle size={16} />
            <span>Agregar</span>
          </button>
          
          <button 
            onClick={toggleFilters}
            className={`bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-full text-sm flex items-center gap-2 transition-all duration-300 ${showFilters ? 'bg-gray-100' : ''}`}
          >
            <Filter size={16} />
            <span>Filtrar</span>
          </button>
        </div>
      </div>
      
      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out" 
        style={{ height: `${filterHeight}px`, opacity: showFilters ? 1 : 0 }}
      >
        <div ref={filterRef} className="mt-3 pt-3 pb-2 sm:pb-3 md:pb-2 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
            <div className="flex flex-col gap-1 sm:gap-2">
              <span className="text-xs text-gray-500 font-medium">Estado:</span>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button 
                  onClick={() => {
                    setCurrentPage(1);
                    setStatusFilter('all');
                  }}
                  className={`px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                    statusFilter === 'all' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage(1);
                    setStatusFilter('active');
                  }}
                  className={`px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                    statusFilter === 'active' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Activos
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage(1);
                    setStatusFilter('inactive');
                  }}
                  className={`px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                    statusFilter === 'inactive' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Inactivos
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 sm:gap-2 md:items-end">
              <div className="md:w-auto md:self-end">
                <span className="text-xs text-gray-500 font-medium block md:mb-1">Categoría:</span>
                <select 
                  value={categoryFilter}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setCategoryFilter(e.target.value);
                  }}
                  className="appearance-none pl-3 sm:pl-4 pr-8 sm:pr-10 py-1.5 sm:py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-xs sm:text-sm w-full max-w-xs md:w-auto"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}