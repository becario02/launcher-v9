'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Building2, Check, X, Shield } from 'lucide-react';
import { Fragment } from 'react';

export default function SelectCompanyModal({ isOpen, companies, onSelect, onClose, isLoading }) {
  const [search, setSearch] = useState('');

  const filteredCompanies = companies.filter((company) =>
    company.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[9999]">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1C1C24] shadow-xl ring-1 ring-black/10 dark:ring-white/10 p-6 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <Dialog.Title className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-6 pt-5">
                Selecciona una empresa para ver a sus usuarios administradores
              </Dialog.Title>

              {/* Search */}
              <input
                type="text"
                placeholder="Buscar empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded-md text-sm bg-gray-100 dark:bg-[#2C2C38] text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {/* Content */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <ul className="space-y-2">
                  <li
                    onClick={() => onSelect({ isAdvan: true })}
                    className="flex items-center justify-between px-4 py-3 bg-semantic.blue dark:bg-semantic.blue rounded-lg cursor-pointer hover:bg-primary-blue dark:hover:bg-primary-blue transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary dark:text-primary" />
                      <span className="text-primary dark:text-white font-medium">
                        Ver usuarios Advan
                      </span>
                    </div>
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-300 opacity-0 group-hover:opacity-100 transition" />
                  </li>

                  {/* Lista de empresas */}
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between px-4 py-3 bg-gray-200 dark:bg-[#2C2C38] rounded-lg animate-pulse"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-5 h-5 rounded-full bg-gray-400 dark:bg-gray-600" />
                          <div className="h-4 w-2/3 bg-gray-400 dark:bg-gray-600 rounded" />
                        </div>
                        <div className="w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded" />
                      </li>
                    ))
                  ) : filteredCompanies.length === 0 ? (
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      No se encontraron empresas.
                    </p>
                  ) : (
                    filteredCompanies.map((company) => (
                      <li
                        key={company.idCompany}
                        onClick={() => onSelect(company)}
                        className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-[#2C2C38] rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-[#3C3C48] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-primary" />
                          <span className="text-gray-800 dark:text-white font-medium">
                            {company.companyName}
                          </span>
                        </div>
                        <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition" />
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
