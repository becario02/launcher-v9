'use client';

import { useState, useEffect } from 'react';
import { useCompany } from '@/context/CompanyContext';

const CompanySelectModal = () => {
  const {
    companies,
    showCompanyModal,
    selectCompany,
    setShowCompanyModal,
    preselectedCompany,
    connectAndSync  // ✅ AGREGAR ESTA LÍNEA
  } = useCompany();

  // estado con la "clave" única de la empresa seleccionada
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // función que genera la clave única
  const generateKey = (company) =>
    `${company.name}-${company.serverErpDb}-${company.nameErpDb}`;

  // al abrir el modal, preseleccionar si viene una empresa
  useEffect(() => {
    if (showCompanyModal) {
      if (preselectedCompany) {
        setSelectedCompanyId(generateKey(preselectedCompany));
      } else {
        setSelectedCompanyId(null);
      }
    }
  }, [showCompanyModal, preselectedCompany]);

  const handleSelectCompany = (company) => {
    setSelectedCompanyId(generateKey(company));
  };

  const handleConnect = () => {
    if (!selectedCompanyId) return;
    const company = companies.find(
      (c) => generateKey(c) === selectedCompanyId
    );
    if (company) {
      // ✅ USAR LA NUEVA FUNCIÓN QUE CONECTA Y SINCRONIZA
      connectAndSync(company); // En lugar de selectCompany(company)
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

  if (!showCompanyModal) return null;

  return (
    <div className="fixed inset-0 z-50 font-poppins">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-[#171725]/50 dark:bg-[#0B0B10]/70 transition-opacity" />
        <div className="relative bg-white dark:bg-[#1c1c24] rounded-[10px] max-w-md w-full mx-auto shadow-xl animate-fadeIn">
          <div className="p-6">
            <h2 className="text-[20px] font-semibold text-[#171725] dark:text-white mb-6">
              Selecciona una empresa
            </h2>

            <div className="max-h-96 overflow-y-auto scrollbar-custom">
              {companies.length > 0 ? (
                <ul className="space-y-2">
                  {companies.map((company) => {
                    const key = generateKey(company);
                    const isSelected = key === selectedCompanyId;

                    return (
                      <li key={key} className="rounded-[10px] overflow-hidden">
                        <button
                          onClick={() => handleSelectCompany(company)}
                          className={`w-full text-left p-3 rounded-[10px] transition-all flex items-start
                            ${isSelected
                              ? 'bg-[#0080FF]/10 dark:bg-[#0080FF]/20 border border-primary'
                              : 'bg-[#F5F7FA] hover:bg-[#E2E2EA] dark:bg-[#2c2c38] dark:hover:bg-[#44444F] border border-[#E6E8EC] dark:border-[#2C2C38]'}`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0
                              ${isSelected
                                ? 'bg-primary text-white'
                                : 'bg-[#0080FF]/10 dark:bg-primary text-[#0080FF] dark:text-white'}`}
                          >
                            <span className="font-medium text-[14px]">
                              {company.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[14px] text-[#171725] dark:text-white mb-1">
                              {company.name}
                            </p>
                            <div className="text-[#696974] dark:text-gray-400 text-[12px] space-y-0.5">
                              <p className="truncate flex items-center">
                                <span className="font-medium mr-1">Servidor:</span>
                                {formatServer(company.serverErpDb)}
                              </p>
                              <div className="flex items-center">
                                <p className="truncate flex items-center">
                                  <span className="font-medium mr-1">Base de datos:</span>
                                  {company.nameErpDb}
                                </p>
                                {/* Etiqueta de tipo de base de datos */}
                                <span className={`inline-flex px-2 py-1 text-white text-[10px] rounded-[25px] flex-shrink-0 font-medium ml-2 ${
                                  company.environment === 'TEST' 
                                    ? 'bg-gray-500 dark:bg-gray-600' 
                                    : 'bg-primary'
                                }`}>
                                  {company.environment === 'TEST' ? 'PRUEBAS' : 'PRODUCCIÓN'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="ml-2 flex-shrink-0 self-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-primary"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="py-6 text-center text-[#696974] dark:text-gray-400">
                  <p className="text-[14px] font-medium">No se encontraron empresas</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={handleConnect}
                disabled={!selectedCompanyId}
                className="w-full py-3 px-4 bg-primary text-white rounded-[10px] font-medium text-[14px]
                           hover:bg-primary transition-colors
                           disabled:bg-[#92929D] disabled:cursor-not-allowed"
              >
                Conectar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySelectModal;