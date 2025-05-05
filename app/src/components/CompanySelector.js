'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useCompany } from '@/context/CompanyContext';
import * as Tooltip from '@radix-ui/react-tooltip';

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
      <div className="font-[Poppins] relative w-full sm:w-72 text-sm font-medium text-gray-700 dark:text-gray-200">
        {/* Loading skeleton placeholder */}
      </div>
    );
  }

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
    <div ref={dropdownRef} className="font-[Poppins] relative w-full sm:w-72 text-sm font-medium text-gray-700 dark:text-gray-200">
      <Tooltip.Provider delayDuration={300}>
        <Tooltip.Root open={open || showSingleMessage ? false : undefined}>
          <Tooltip.Trigger asChild>
            <button
              onClick={handleSelectorClick}
              className={`w-full flex items-center justify-between border ${
                open || showSingleMessage
                  ? 'border-[var(--primary-color)] border-b-transparent rounded-t-lg'
                  : 'border-gray-300 dark:border-gray-600 rounded-lg'
              } px-3 py-2 bg-white dark:bg-[#1c1c24] hover:bg-gray-50 dark:hover:bg-[#2c2c38] transition-all`}
              aria-label={`Selected company: ${selectedCompany.name}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0080FF]/10 dark:bg-[#0080FF] text-[#0080FF] dark:text-white border">
                  <span className="text-[14px] font-medium">{selectedCompany.name.charAt(0)}</span>
                </div>
                <div className="flex flex-col items-start truncate">
                  <span className="text-[14px] font-medium truncate max-w-[200px] cursor-default">
                    {selectedCompany.name}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                    {formatServer(selectedCompany.serverErpDb)} • {selectedCompany.nameErpDb}
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
          </Tooltip.Trigger>

          {!(open || showSingleMessage) && (
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                align="center"
                sideOffset={5}
                className="bg-white dark:bg-[#1c1c24] border-[var(--primary-color)] text-gray-7 dark:text-white text-xs rounded-md px-4 py-3 shadow-lg z-50 animate-fadeIn max-w-xs"
              >
                <div className="flex flex-col gap-1">
                  <div className="font-medium text-h3">{selectedCompany.name}</div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="bg-primary text-white px-2 py-0.5 rounded text-[10px]">
                      {formatServer(selectedCompany.serverErpDb)}
                    </span>
                    <span className="bg-primary text-white px-2 py-0.5 rounded text-[10px]">
                      {selectedCompany.nameErpDb}
                    </span>
                  </div>
                </div>
                <Tooltip.Arrow className="fill-gray-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          )}
        </Tooltip.Root>
      </Tooltip.Provider>

      {showSingleMessage && (
        <div className="absolute top-full w-full bg-white dark:bg-[#1c1c24] border border-[var(--primary-color)] border-t-0 rounded-b-lg shadow z-10 p-3 text-center">
          <p className="text-[13px] text-gray-700 dark:text-gray-200">Solo tienes acceso a esta empresa</p>
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
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0080FF]/10 dark:bg-[#0080FF] text-[#0080FF] dark:text-white border">
                    <span className="text-[13px] font-medium">{company.name.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col items-start truncate">
                    <span className="text-[14px] font-medium text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
                      {company.name}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                      {formatServer(company.serverErpDb)} • {company.nameErpDb}
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