'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, PlusCircle, Filter } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';

export default function ConexionesFilters({
  searchTerm,
  setSearchTerm,
  selectedCompany,
  setSelectedCompany,
  companies,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { primaryColor } = usePrimaryColor();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="mb-5 bg-white dark:bg-gray-7 rounded-lg shadow-sm border border-gray-200 dark:border-white/20  
                 p-3 transition-all duration-300 hover:shadow-md relative z-0"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Input */}
        <div className="relative flex-grow max-w-[300px] w-full">
          <input
            type="text"
            placeholder="Buscar conexiones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded-full
                       bg-gray-1 dark:border-[#2C2C38] dark:bg-gray-8 dark:text-white
                       focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:dark:text-primary placeholder:text-primary duration-200 text-xs text-primary"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary dark:text-primary dark:text-gray-3"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            style={{
              borderColor: primaryColor,
              color: primaryColor,
              backgroundColor: showFilters ? `${primaryColor}33` : 'transparent',
            }}
            className="border py-2 px-4 rounded-full text-sm flex items-center gap-2 transition-all duration-300"
          >
            <Filter size={16} />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Dropdown animado: filtro por empresa */}
      {showFilters && (
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4" ref={dropdownRef}>
            <div className="flex flex-col gap-1 sm:gap-2 w-full sm:w-auto">
              <span
                style={{ color: primaryColor }}
                className="text-xs font-medium dark:text-gray-2"
              >
                Empresa:
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                  style={{
                    border: `1px solid ${primaryColor}`,
                    color: primaryColor
                  }}
                  className="w-full sm:min-w-[220px] text-left pl-4 pr-4 py-2 rounded-full bg-gray-1 dark:bg-gray-6 text-sm flex items-center justify-between"
                >
                  <span>
                    {selectedCompany === 'all'
                      ? 'Todas las empresas'
                      : companies.find(c => c.id.toString() === selectedCompany)?.name || 'Empresa'}
                  </span>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </button>

                {showCompanyDropdown && (
                  <div
                    className="absolute top-full mt-2 bg-white dark:bg-gray-7 border border-gray-200 dark:border-gray-6
                               rounded-lg shadow-lg max-h-60 overflow-y-auto w-full z-50"
                    style={{
                      borderColor: `${primaryColor}33`,
                      boxShadow: `0 4px 6px -1px ${primaryColor}20, 0 2px 4px -1px ${primaryColor}10`,
                    }}
                  >
                    <div
                      onClick={() => {
                        setSelectedCompany('all');
                        setShowCompanyDropdown(false);
                      }}
                      className="px-4 py-2 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-6"
                    >
                      Todas las empresas
                    </div>
                    {companies.map(company => (
                      <div
                        key={company.id}
                        onClick={() => {
                          setSelectedCompany(company.id.toString());
                          setShowCompanyDropdown(false);
                        }}
                        className="px-4 py-2 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-6"
                      >
                        {company.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
