'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useCompany } from '@/context/CompanyContext';

export default function CompanySelector() {
  const [open, setOpen] = useState(false);
  const [showSingleMessage, setShowSingleMessage] = useState(false);
  const dropdownRef = useRef(null);

  const {
    companies,
    selectedCompany,
    openCompanySelector,
    setPreselectedCompany,
    loading
  } = useCompany();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setShowSingleMessage(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Genera una clave única para cada empresa
  const generateKey = (c) => `${c.name}-${c.serverErpDb}-${c.nameErpDb}`;
  const selectedKey = selectedCompany ? generateKey(selectedCompany) : null;

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="font-[Poppins] relative w-full sm:w-72 text-sm font-medium text-gray-700 dark:text-gray-200">
        {/* Aquí podría ir un skeleton placeholder */}
      </div>
    );
  }

  // Si no hay empresa seleccionada, abrir modal completo
  if (!selectedCompany) {
    return (
      <div className="font-[Poppins] relative w-full sm:w-72 text-sm font-medium text-gray-700 dark:text-gray-200">
        <button
          onClick={openCompanySelector}
          className="w-full flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#1c1c24] hover:bg-gray-50 dark:hover:bg-[#2c2c38] transition-all"
        >
          <span>Seleccionar empresa</span>
          <Image
            src="/assets/company-selector/icon-expand.svg"
            alt="Expand"
            width={16}
            height={16}
            className="dark:invert"
          />
        </button>
      </div>
    );
  }

  const handleSelectorClick = () => {
    if (companies.length > 1) {
      setOpen(!open);
      setShowSingleMessage(false);
    } else {
      setShowSingleMessage(!showSingleMessage);
      setOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="font-[Poppins] relative w-full sm:w-72 text-sm font-medium text-gray-700 dark:text-gray-200">
      {/* Botón principal */}
      <button
        onClick={handleSelectorClick}
        className={`w-full flex items-center justify-between border ${
          open || showSingleMessage
            ? 'border-[var(--primary-color)] border-b-transparent rounded-t-lg'
            : 'border-gray-300 dark:border-gray-600 rounded-lg'
        } px-3 py-2 bg-white dark:bg-[#1c1c24] hover:bg-gray-50 dark:hover:bg-[#2c2c38] transition-all`}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0080FF]/10 dark:bg-[#0080FF] text-[#0080FF] dark:text-white border">
            <span className="text-[13px] font-medium">{selectedCompany.name.charAt(0)}</span>
          </div>
          <div className="flex flex-col items-start truncate">
            <span className="text-[13px] font-medium truncate max-w-[140px]">
              {selectedCompany.name}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
              {selectedCompany.serverErpDb} • {selectedCompany.nameErpDb}
            </span>
          </div>
        </div>
        <Image
          src={open || showSingleMessage ? '/assets/company-selector/icon-contrae-2.svg' : '/assets/company-selector/icon-expand.svg'}
          alt="Toggle"
          width={16}
          height={16}
          className="dark:invert"
        />
      </button>

      {/* Mensaje para única empresa */}
      {showSingleMessage && (
        <div className="absolute top-full w-full bg-white dark:bg-[#1c1c24] border border-[var(--primary-color)] border-t-0 rounded-b-lg shadow z-10 p-3 text-center">
          <p className="text-[13px] text-gray-700 dark:text-gray-200">Solo tienes acceso a esta empresa</p>
        </div>
      )}

      {/* Dropdown con lista de empresas sin duplicados y excluyendo la seleccionada */}
      {open && companies.length > 1 && (
        <ul className="absolute top-full w-full bg-white dark:bg-[#1c1c24] border border-[var(--primary-color)] border-t-0 rounded-b-lg shadow z-10">
          {companies
            // Deduplicar
            .filter((c, i, arr) => arr.findIndex(x => generateKey(x) === generateKey(c)) === i)
            // Excluir seleccionada
            .filter(c => generateKey(c) !== selectedKey)
            .map(company => {
              const key = generateKey(company);
              return (
                <li
                  key={key}
                  onClick={() => {
                    setPreselectedCompany(company);
                    openCompanySelector();
                    setOpen(false);
                  }}
                  className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#2c2c38] flex items-center gap-2"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0080FF]/10 dark:bg-[#0080FF] text-[#0080FF] dark:text-white border">
                    <span className="text-[13px] font-medium">{company.name.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col items-start truncate">
                    <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200 truncate max-w-[140px]">
                      {company.name}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                      {company.serverErpDb} • {company.nameErpDb}
                    </span>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}