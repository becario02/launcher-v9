'use client';

import { Dialog } from '@headlessui/react';
import { Building2, Check } from 'lucide-react';

export default function SelectCompanyModal({ isOpen, companies, onSelect, onClose, isLoading }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white dark:bg-[#1C1C24] shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white px-6 pt-6">
            Selecciona una empresa
          </Dialog.Title>
          <div className="px-6 py-4 space-y-4">
            {isLoading ? (
                <p className="text-gray-500 dark:text-gray-400">Cargando empresas...</p>
            ) : companies.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No hay empresas disponibles</p>
            ) : (
              <ul className="space-y-2">
                {companies.map((company) => (
                  <li
                    key={company.idCompany}
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#2C2C38] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3C3C48] transition"
                    onClick={() => onSelect(company)}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-primary" />
                      <span className="text-gray-800 dark:text-white font-medium">{company.companyName}</span>
                    </div>
                    <Check className="w-4 h-4 text-primary" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}