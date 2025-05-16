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

  const generateKey = (c) => `${c.name}-${c.serverErpDb}-${c.nameErpDb}`;
  const selectedKey = selectedCompany ? generateKey(selectedCompany) : null;

  if (loading) {
    return (
      <div className="font-[Poppins] relative w-[567px] text-sm font-medium text-gray-700 dark:text-gray-200">
        {/* Loading skeleton placeholder */}
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="font-[Poppins] relative w-[567px] text-sm font-medium text-gray-700 dark:text-gray-200">
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

  function formatServer(server) {
    if (!server) return '';
    let hostPart = server;
    let portOrInstance = '';
    if (server.includes(':')) {
      [hostPart, portOrInstance] = server.split(':');
      portOrInstance = ':' + portOrInstance;
    } else if (server.includes('\\')) {
      [hostPart, portOrInstance] = server.split('\\');
      portOrInstance = '\\' + portOrInstance;
    }
    const parts = hostPart.split('.');
    const last = parts.pop();
    const maskedParts = parts.map(part => '*'.repeat(part.length));
    return maskedParts.concat(last).join('.') + portOrInstance;
  }

  return (
    <div ref={dropdownRef} className="font-[Poppins] relative w-[567px] text-sm font-medium text-gray-700 dark:text-gray-200">
      <button
        onClick={handleSelectorClick}
        className={`w-full flex items-center justify-between ${
          open || showSingleMessage
            ? 'border border-[var(--primary-color)] border-b-transparent rounded-t-lg'
            : 'border border-gray-300 dark:border-gray-600 rounded-lg'
        } px-3 py-2 bg-white dark:bg-[#1c1c24] hover:bg-gray-50 dark:hover:bg-[#2c2c38] transition-all`}
        aria-label={`Selected company: ${selectedCompany.name}`}
      >
        <div className="flex items-center gap-3 w-full">
          {/* Company logo/icon */}
          <div className="flex-shrink-0">
            <div className="w-9 h-9 flex items-center justify-center rounded-[50px] bg-white dark:bg-primary border border-gray-200 dark:border-gray-600 overflow-hidden">
              <Image 
                src="/assets/company-selector/truck-icon.png" 
                alt="Company logo" 
                width={36} 
                height={36}
                className="object-contain"
                onError={(e) => {
                  try {
                    e.target.style.display = 'none';
                    if (e.currentTarget && e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML = selectedCompany.name.charAt(0);
                    }
                  } catch (error) {
                    console.error("Error handling image load failure:", error);
                  }
                }}
              />
            </div>
          </div>
          
          {/* Company information - left aligned */}
          <div className="flex flex-col items-start flex-grow overflow-hidden">
            <div className="flex items-center w-full">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {selectedCompany.name}
              </span>
            </div>
            <div className="flex items-center w-full text-[10px] text-gray-500 dark:text-gray-400">
              {/* IP y BD */}
              <div className="flex items-center gap-2 truncate">
                <span className="truncate">{formatServer(selectedCompany.serverErpDb)}</span>
                <span className="whitespace-nowrap">•</span>
                <span className="whitespace-nowrap">{selectedCompany.nameErpDb}</span>
              </div>
              
              {/* Espacio flexible */}
              <div className="flex-grow"></div>
              
              {/* PRUEBAS o PRODUCCIÓN */}
              <div className="flex-shrink-0">
                <span className={`inline-flex px-2 py-0.5 text-white text-[10px] rounded-[25px] whitespace-nowrap font-medium ${
                  selectedCompany.environment === 'TEST' 
                    ? 'bg-gray-500 dark:bg-gray-600' 
                    : 'bg-primary'
                }`}>
                  {selectedCompany.environment === 'TEST' ? 'PRUEBAS' : 'PRODUCCIÓN'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Toggle button - right aligned */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Image
              src={open || showSingleMessage ? '/assets/company-selector/icon-contrae-2.svg' : '/assets/company-selector/icon-expand.svg'}
              alt="Toggle"
              width={16}
              height={16}
              className="dark:invert"
            />
          </div>
        </div>
      </button>

      {showSingleMessage && (
        <div className="absolute top-full w-full bg-white dark:bg-[#1c1c24] border border-[var(--primary-color)] border-t-0 rounded-b-lg shadow z-10 p-3 text-center">
          <p className="text-[14px] text-gray-700 dark:text-gray-200">Solo tienes acceso a esta empresa</p>
        </div>
      )}

      {open && companies.length > 1 && (
        <ul className="absolute top-full w-full bg-white dark:bg-[#1c1c24] border border-[var(--primary-color)] border-t-0 rounded-b-lg shadow z-10">
          {companies
            .filter((c, i, arr) => arr.findIndex(x => generateKey(x) === generateKey(c)) === i)
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
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0080FF]/10 dark:bg-primary text-[#0080FF] dark:text-white border">
                    <span className="text-[13px] font-medium">{company.name.charAt(0)}</span>
                  </div>
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-[14px] font-medium text-gray-700 dark:text-gray-200">
                        {company.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          {formatServer(company.serverErpDb)} • {company.nameErpDb}
                        </span>
                        {/* Añadido tipo de BD (environment) */}
                        <span className={`inline-flex px-2 py-0.5 text-white text-[10px] rounded-[25px] flex-shrink-0 font-medium ${
                          company.environment === 'TEST' 
                            ? 'bg-gray-500 dark:bg-gray-600' 
                            : 'bg-primary'
                        }`}>
                          {company.environment === 'TEST' ? 'PRUEBAS' : 'PRODUCCIÓN'}
                        </span>
                      </div>
                    </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}